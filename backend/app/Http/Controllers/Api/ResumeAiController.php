<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Services\ResumeAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ResumeAiController extends Controller
{
    public function summary(Request $request, ResumeAiService $ai)
    {
        $this->ensureAiQuota($request);

        $validated = $request->validate([
            'resume_data' => ['nullable', 'array'],
            'job_title' => ['required_without:resume_data', 'string', 'max:120'],
            'experience_notes' => ['required_without:resume_data', 'string', 'max:8000'],
        ]);

        $summary = ! empty($validated['resume_data'])
            ? $ai->generateSummaryFromResume($validated['resume_data'])
            : $ai->generateSummary(
                $validated['job_title'],
                $validated['experience_notes']
            );

        return response()->json([
            'data' => [
                'summary' => $summary,
            ],
        ]);
    }

    public function bullet(Request $request, ResumeAiService $ai)
    {
        $this->ensureAiQuota($request);

        $validated = $request->validate([
            'bullet' => ['required', 'string', 'max:500'],
            'job_title' => ['nullable', 'string', 'max:120'],
        ]);

        return response()->json([
            'data' => [
                'bullet' => $ai->improveBullet(
                    $validated['bullet'],
                    $validated['job_title'] ?? null
                ),
            ],
        ]);
    }

    public function tailor(Request $request, ResumeAiService $ai)
    {
        $this->ensureAiQuota($request);

        $validated = $request->validate([
            'resume_data' => ['required', 'array'],
            'job_description' => ['required', 'string', 'max:8000'],
        ]);

        return response()->json([
            'data' => $ai->tailorToJobDescription(
                $validated['resume_data'],
                $validated['job_description']
            ),
        ]);
    }

    public function keywords(Request $request, ResumeAiService $ai)
    {
        $this->ensureAiQuota($request);

        $validated = $request->validate([
            'resume_data' => ['required', 'array'],
            'job_description' => ['required', 'string', 'max:8000'],
        ]);

        return response()->json([
            'data' => $ai->suggestKeywords(
                $validated['resume_data'],
                $validated['job_description']
            ),
        ]);
    }

    public function autocomplete(Request $request, ResumeAiService $ai)
    {
        $this->ensureAutocompleteQuota($request);

        $validated = $request->validate([
            'field' => ['required', 'string', 'in:job_title,degree,school,language,language_level'],
            'query' => ['required', 'string', 'min:2', 'max:120'],
        ]);

        return response()->json([
            'data' => [
                'suggestions' => $ai->autocomplete(
                    $validated['field'],
                    $validated['query']
                ),
            ],
        ]);
    }

    public function jobDescriptions(Request $request, ResumeAiService $ai)
    {
        $this->ensureAiQuota($request);

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:120'],
        ]);

        return response()->json([
            'data' => [
                'suggestions' => $ai->suggestJobDescriptions(
                    $validated['job_title'],
                    $validated['company'] ?? null
                ),
            ],
        ]);
    }

    public function skills(Request $request, ResumeAiService $ai)
    {
        $this->ensureAiQuota($request);

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:120'],
            'experience_notes' => ['nullable', 'string', 'max:4000'],
        ]);

        return response()->json([
            'data' => [
                'suggestions' => $ai->suggestSkillsForRole(
                    $validated['job_title'],
                    $validated['company'] ?? null,
                    $validated['experience_notes'] ?? null
                ),
            ],
        ]);
    }

    private function ensureAutocompleteQuota(Request $request): void
    {
        $key = 'resume-ai-autocomplete:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, 40)) {
            abort(429, 'Too many autocomplete requests. Please wait a moment.');
        }

        RateLimiter::hit($key, 60);
    }

    private function ensureAiQuota(Request $request): void
    {
        $key = 'resume-ai:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, config('resume.ai_daily_limit', 20))) {
            abort(429, 'AI daily limit reached. Try again tomorrow or upgrade to Pro.');
        }

        RateLimiter::hit($key, 86400);
    }
}
