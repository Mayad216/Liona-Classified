<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Jobs\CalculateJobMatchesJob;
use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\JobMatch;
use App\Models\SavedJob;
use App\Services\Copilot\JobMatchingService;
use Illuminate\Http\Request;

class CopilotJobController extends Controller
{
    public function __construct(protected JobMatchingService $matcher)
    {
    }

    /** GET /api/v1/copilot/jobs/recommended */
    public function recommended(Request $request)
    {
        $user = $request->user();
        $status = $request->string('status')->toString() ?: 'recommended';
        $allowed = ['recommended', 'saved', 'all'];

        if (! in_array($status, $allowed, true)) {
            $status = 'recommended';
        }

        $query = JobMatch::query()
            ->with('matchable')
            ->where('user_id', $user->id)
            ->whereNot('recommendation_status', 'dismissed');

        if ($status === 'recommended') {
            $query->where('recommendation_status', 'recommended');
        } else        if ($status === 'saved') {
            $query->where('recommendation_status', 'saved');
        }

        $country = $request->string('country')->toString();
        if ($country !== '') {
            $query->whereHasMorph('matchable', [CopilotJob::class], function ($q) use ($country) {
                $q->where('country', strtoupper($country));
            });
        }

        $matches = $query
            ->orderByDesc('match_score')
            ->paginate((int) $request->input('per_page', 20));

        return response()->json($this->transformMatchesPaginated($matches));
    }

    /** GET /api/v1/copilot/jobs/matches/{jobMatch} */
    public function show(Request $request, JobMatch $jobMatch)
    {
        abort_unless($jobMatch->user_id === $request->user()->id, 403);
        $jobMatch->load('matchable');

        return response()->json(['data' => $this->transformMatch($jobMatch)]);
    }

    /** POST /api/v1/copilot/jobs/matches/recalculate */
    public function recalculate(Request $request)
    {
        $user = $request->user();
        if (! $user->jobSeekerProfile) {
            return response()->json([
                'message' => 'Complete your job seeker profile first.',
            ], 422);
        }

        if ($request->boolean('sync')) {
            $count = $this->matcher->recalculateForUser($user);

            return response()->json([
                'message' => "Calculated {$count} job matches.",
                'matches_count' => $count,
            ]);
        }

        CalculateJobMatchesJob::dispatch($user->id);

        return response()->json(['message' => 'Match calculation queued.']);
    }

    /** POST /api/v1/copilot/jobs/matches/{jobMatch}/save */
    public function save(Request $request, JobMatch $jobMatch)
    {
        abort_unless($jobMatch->user_id === $request->user()->id, 403);

        SavedJob::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'saveable_type' => $jobMatch->matchable_type,
                'saveable_id' => $jobMatch->matchable_id,
            ],
            []
        );

        $jobMatch->update(['recommendation_status' => 'saved']);

        return response()->json(['data' => $this->transformMatch($jobMatch->fresh('matchable'))]);
    }

    /** DELETE /api/v1/copilot/jobs/matches/{jobMatch}/save */
    public function unsave(Request $request, JobMatch $jobMatch)
    {
        abort_unless($jobMatch->user_id === $request->user()->id, 403);

        SavedJob::query()
            ->where('user_id', $request->user()->id)
            ->where('saveable_type', $jobMatch->matchable_type)
            ->where('saveable_id', $jobMatch->matchable_id)
            ->delete();

        $jobMatch->update(['recommendation_status' => 'recommended']);

        return response()->json(['message' => 'Job removed from saved list.']);
    }

    /** POST /api/v1/copilot/jobs/matches/{jobMatch}/dismiss */
    public function dismiss(Request $request, JobMatch $jobMatch)
    {
        abort_unless($jobMatch->user_id === $request->user()->id, 403);
        $jobMatch->update(['recommendation_status' => 'dismissed']);

        return response()->json(['message' => 'Job dismissed.']);
    }

    /** POST /api/v1/copilot/jobs/platform/{job}/match — score single platform job */
    public function matchPlatformJob(Request $request, Job $job)
    {
        $profile = $request->user()->jobSeekerProfile;
        if (! $profile) {
            return response()->json(['message' => 'Complete your profile first.'], 422);
        }

        $resume = $request->user()->resumes()->where('is_default', true)->first();
        $result = $this->matcher->score($profile, $resume?->data, $job);
        $match = $this->matcher->upsertMatch($request->user(), $job, $result);

        return response()->json(['data' => $this->transformMatch($match->load('matchable'))]);
    }

    private function transformMatchesPaginated($paginator): array
    {
        $paginator->getCollection()->transform(fn (JobMatch $m) => $this->transformMatch($m));

        return $paginator->toArray();
    }

    private function transformMatch(JobMatch $match): array
    {
        $job = $match->matchable;
        $payload = [
            'id' => $match->id,
            'match_score' => $match->match_score,
            'semantic_score' => $match->semantic_score,
            'scoring_method' => $match->scoring_method,
            'match_reason' => $match->match_reason,
            'matched_skills' => $match->matched_skills ?? [],
            'missing_skills' => $match->missing_skills ?? [],
            'salary_match' => $match->salary_match,
            'location_match' => $match->location_match,
            'experience_match' => $match->experience_match,
            'work_authorization_match' => $match->work_authorization_match,
            'recommendation_status' => $match->recommendation_status,
            'job' => null,
        ];

        if ($job instanceof Job) {
            $payload['job'] = [
                'source' => 'platform',
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->company,
                'description' => $job->description,
                'emirate' => $job->emirate,
                'area' => $job->area,
                'industry' => $job->industry,
                'employment_type' => $job->employment_type,
                'experience_level' => $job->experience_level,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'remote' => $job->remote,
                'country' => 'UAE',
                'apply_url' => url("/jobs/{$job->id}"),
            ];
        } elseif ($job instanceof CopilotJob) {
            $payload['job'] = [
                'source' => 'external',
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->company_name,
                'description' => $job->description,
                'location' => $job->location,
                'country' => $job->country,
                'employment_type' => $job->employment_type,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'remote_type' => $job->remote_type,
                'apply_url' => $job->application_url ?? $job->source_url,
            ];
        }

        return $payload;
    }
}
