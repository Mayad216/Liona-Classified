<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\JobMatch;
use App\Models\Resume;
use App\Services\Copilot\AiApplicationService;
use App\Services\Copilot\AiResumeService;
use App\Services\Copilot\UsageLimitService;
use Illuminate\Http\Request;

class CopilotAiController extends Controller
{
    public function __construct(
        protected AiResumeService $resumeAi,
        protected AiApplicationService $applicationAi,
        protected UsageLimitService $usage
    ) {
    }

    /** GET /api/v1/copilot/ai/usage */
    public function usage(Request $request)
    {
        return response()->json(['data' => $this->usage->aiUsageSummary($request->user())]);
    }

    /** POST /api/v1/copilot/ai/generate-summary */
    public function generateSummary(Request $request)
    {
        $validated = $request->validate([
            'target_role' => ['nullable', 'string', 'max:120'],
        ]);

        $ctx = $this->userContext($request);
        $this->chargeAi($request);

        return response()->json([
            'data' => [
                'summary' => $this->resumeAi->generateSummary(
                    $ctx['profile'],
                    $ctx['resume'],
                    $validated['target_role'] ?? null
                ),
                'usage' => $this->usage->aiUsageSummary($request->user()),
            ],
        ]);
    }

    /** POST /api/v1/copilot/ai/improve-bullet */
    public function improveBullet(Request $request)
    {
        $validated = $request->validate([
            'bullet' => ['required', 'string', 'max:500'],
            'role' => ['nullable', 'string', 'max:120'],
        ]);

        $this->chargeAi($request);

        return response()->json([
            'data' => [
                'versions' => $this->resumeAi->improveBullet(
                    $validated['bullet'],
                    $validated['role'] ?? null
                ),
                'usage' => $this->usage->aiUsageSummary($request->user()),
            ],
        ]);
    }

    /** POST /api/v1/copilot/ai/tailor-resume */
    public function tailorResume(Request $request)
    {
        $validated = $request->validate([
            'job_description' => ['required_without:job_match_id', 'string', 'max:8000'],
            'job_match_id' => ['nullable', 'integer', 'exists:job_matches,id'],
        ]);

        $ctx = $this->userContext($request);
        $jobDescription = $validated['job_description'] ?? $this->jobDescriptionFromMatch(
            $request,
            (int) $validated['job_match_id']
        );

        $this->chargeAi($request);

        return response()->json([
            'data' => array_merge(
                $this->resumeAi->tailorResume($ctx['profile'], $ctx['resume'] ?? [], $jobDescription),
                ['usage' => $this->usage->aiUsageSummary($request->user())]
            ),
        ]);
    }

    /** POST /api/v1/copilot/ai/extract-job-keywords */
    public function extractKeywords(Request $request)
    {
        $validated = $request->validate([
            'job_description' => ['required_without:job_match_id', 'string', 'max:8000'],
            'job_match_id' => ['nullable', 'integer', 'exists:job_matches,id'],
        ]);

        $ctx = $this->userContext($request);
        $jobDescription = $validated['job_description'] ?? $this->jobDescriptionFromMatch(
            $request,
            (int) $validated['job_match_id']
        );

        $this->chargeAi($request);

        return response()->json([
            'data' => array_merge(
                $this->resumeAi->extractJobKeywords($ctx['resume'] ?? [], $jobDescription),
                ['usage' => $this->usage->aiUsageSummary($request->user())]
            ),
        ]);
    }

    /** POST /api/v1/copilot/ai/generate-cover-letter */
    public function generateCoverLetter(Request $request)
    {
        $validated = $request->validate([
            'job_description' => ['required_without:job_match_id', 'string', 'max:8000'],
            'job_match_id' => ['nullable', 'integer', 'exists:job_matches,id'],
            'job_title' => ['nullable', 'string', 'max:160'],
            'company' => ['nullable', 'string', 'max:160'],
        ]);

        $ctx = $this->userContext($request);
        $meta = $this->jobMetaFromRequest($request, $validated);

        $this->chargeAi($request);

        return response()->json([
            'data' => [
                'cover_letter' => $this->applicationAi->generateCoverLetter(
                    $ctx['profile'],
                    $ctx['resume'],
                    $meta['description'],
                    $meta['title'],
                    $meta['company']
                ),
                'usage' => $this->usage->aiUsageSummary($request->user()),
            ],
        ]);
    }

    /** POST /api/v1/copilot/ai/generate-screening-answer */
    public function generateScreeningAnswer(Request $request)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
        ]);

        $ctx = $this->userContext($request);
        $this->chargeAi($request);

        $answer = $this->applicationAi->generateScreeningAnswer(
            $validated['question'],
            $ctx['profile'],
            $ctx['resume'],
            $ctx['screening_answers']
        );

        return response()->json([
            'data' => [
                'answer' => $answer,
                'needs_user_review' => strtoupper(trim($answer)) === 'NEEDS_USER_REVIEW',
                'usage' => $this->usage->aiUsageSummary($request->user()),
            ],
        ]);
    }

    /** POST /api/v1/copilot/ai/explain-match */
    public function explainMatch(Request $request)
    {
        $validated = $request->validate([
            'job_description' => ['required_without:job_match_id', 'string', 'max:8000'],
            'job_match_id' => ['nullable', 'integer', 'exists:job_matches,id'],
        ]);

        $ctx = $this->userContext($request);
        $deterministicScore = null;
        $jobDescription = $validated['job_description'] ?? null;

        if (! empty($validated['job_match_id'])) {
            $match = JobMatch::query()
                ->where('user_id', $request->user()->id)
                ->findOrFail($validated['job_match_id']);
            $deterministicScore = $match->match_score;
            $jobDescription = $this->jobDescriptionFromMatch($request, $match->id);
        }

        $this->chargeAi($request);

        return response()->json([
            'data' => array_merge(
                $this->applicationAi->explainMatch(
                    $ctx['profile'],
                    $ctx['resume'],
                    $jobDescription ?? '',
                    $deterministicScore
                ),
                ['usage' => $this->usage->aiUsageSummary($request->user())]
            ),
        ]);
    }

    private function chargeAi(Request $request): void
    {
        $user = $request->user();
        if (! $this->usage->canUseAiCredits($user)) {
            abort(429, 'Monthly AI credit limit reached. Upgrade your plan for more credits.');
        }
        $this->usage->consumeAiCredits($user);
    }

    /**
     * @return array{profile: array|null, resume: array|null, screening_answers: list<array<string, string>>}
     */
    private function userContext(Request $request): array
    {
        $user = $request->user()->load(['jobSeekerProfile', 'screeningAnswers']);
        $resume = Resume::query()
            ->where('user_id', $user->id)
            ->where('is_default', true)
            ->first();

        return [
            'profile' => $user->jobSeekerProfile?->toArray(),
            'resume' => $resume?->data,
            'screening_answers' => $user->screeningAnswers->map(fn ($a) => [
                'question_key' => $a->question_key,
                'question_text' => $a->question_text,
                'answer_text' => $a->answer_text,
            ])->all(),
        ];
    }

    private function jobDescriptionFromMatch(Request $request, int $jobMatchId): string
    {
        $match = JobMatch::query()
            ->with('matchable')
            ->where('user_id', $request->user()->id)
            ->findOrFail($jobMatchId);

        $job = $match->matchable;
        if ($job instanceof Job) {
            $req = is_array($job->requirements) ? implode("\n", $job->requirements) : '';

            return trim($job->title."\n".$job->company."\n".$job->description."\n".$req);
        }
        if ($job instanceof CopilotJob) {
            return trim($job->title."\n".$job->company_name."\n".$job->description."\n".($job->requirements ?? ''));
        }

        abort(422, 'Job match has no valid job record.');
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{description: string, title: string|null, company: string|null}
     */
    private function jobMetaFromRequest(Request $request, array $validated): array
    {
        if (! empty($validated['job_match_id'])) {
            $match = JobMatch::query()
                ->with('matchable')
                ->where('user_id', $request->user()->id)
                ->findOrFail($validated['job_match_id']);
            $job = $match->matchable;

            if ($job instanceof Job) {
                return [
                    'description' => $this->jobDescriptionFromMatch($request, $match->id),
                    'title' => $validated['job_title'] ?? $job->title,
                    'company' => $validated['company'] ?? $job->company,
                ];
            }
            if ($job instanceof CopilotJob) {
                return [
                    'description' => $this->jobDescriptionFromMatch($request, $match->id),
                    'title' => $validated['job_title'] ?? $job->title,
                    'company' => $validated['company'] ?? $job->company_name,
                ];
            }
        }

        return [
            'description' => (string) ($validated['job_description'] ?? ''),
            'title' => $validated['job_title'] ?? null,
            'company' => $validated['company'] ?? null,
        ];
    }
}
