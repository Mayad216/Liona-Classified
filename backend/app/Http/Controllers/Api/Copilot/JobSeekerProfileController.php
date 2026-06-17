<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Jobs\CalculateJobMatchesJob;
use App\Models\UserScreeningAnswer;
use App\Services\Copilot\JobSeekerProfileService;
use App\Models\JobSeekerProfile;
use Illuminate\Http\Request;

class JobSeekerProfileController extends Controller
{
    public function __construct(protected JobSeekerProfileService $profiles)
    {
    }

    /** GET /api/v1/copilot/profile */
    public function show(Request $request)
    {
        $user = $request->user()->load(['jobSeekerProfile', 'screeningAnswers']);

        return response()->json([
            'data' => [
                'profile' => $user->jobSeekerProfile,
                'screening_answers' => $user->screeningAnswers,
                'screening_questions' => config('copilot.screening_questions'),
            ],
        ]);
    }

    /** PUT /api/v1/copilot/profile */
    public function upsert(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:32'],
            'location' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:64'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'current_job_title' => ['nullable', 'string', 'max:120'],
            'target_job_titles' => ['nullable', 'array'],
            'target_job_titles.*' => ['string', 'max:120'],
            'target_industries' => ['nullable', 'array'],
            'target_industries.*' => ['string', 'max:120'],
            'preferred_locations' => ['nullable', 'array'],
            'preferred_locations.*' => ['string', 'max:120'],
            'remote_preference' => ['nullable', 'in:remote,hybrid,onsite,any'],
            'expected_salary_min' => ['nullable', 'integer', 'min:0'],
            'expected_salary_max' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:8'],
            'work_authorization' => ['nullable', 'string', 'max:255'],
            'requires_visa_sponsorship' => ['nullable', 'boolean'],
            'notice_period' => ['nullable', 'string', 'max:64'],
            'availability_date' => ['nullable', 'date'],
            'professional_summary' => ['nullable', 'string', 'max:3000'],
            'screening_answers' => ['nullable', 'array'],
            'screening_answers.*.question_key' => ['required_with:screening_answers', 'string', 'max:64'],
            'screening_answers.*.question_text' => ['required_with:screening_answers', 'string', 'max:500'],
            'screening_answers.*.answer_text' => ['required_with:screening_answers', 'string', 'max:2000'],
            'screening_answers.*.answer_type' => ['nullable', 'string', 'max:32'],
        ]);

        $profileData = collect($validated)->except('screening_answers')->all();
        $profileData['completion'] = $this->profiles->calculateCompletion($profileData);

        $profile = JobSeekerProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $profileData
        );

        if (! empty($validated['screening_answers'])) {
            foreach ($validated['screening_answers'] as $answer) {
                UserScreeningAnswer::updateOrCreate(
                    [
                        'user_id' => $request->user()->id,
                        'question_key' => $answer['question_key'],
                    ],
                    [
                        'question_text' => $answer['question_text'],
                        'answer_text' => $answer['answer_text'],
                        'answer_type' => $answer['answer_type'] ?? 'text',
                    ]
                );
            }
        }

        CalculateJobMatchesJob::dispatch($request->user()->id);

        return response()->json([
            'data' => [
                'profile' => $profile->fresh(),
                'missing_fields' => $this->profiles->missingFields($profile->toArray()),
            ],
        ]);
    }
}
