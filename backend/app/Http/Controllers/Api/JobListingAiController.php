<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\JobListingAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class JobListingAiController extends Controller
{
    public function suggest(Request $request, JobListingAiService $ai)
    {
        $this->ensureQuota($request);

        $validated = $request->validate([
            'role' => ['required', 'string', 'max:120'],
            'industry' => ['required', 'string', 'max:120'],
            'employment_type' => ['nullable', 'string', 'max:40'],
            'experience_level' => ['nullable', 'string', 'max:40'],
            'work_arrangement' => ['nullable', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:120'],
        ]);

        $data = $ai->suggestListing(
            $validated['role'],
            $validated['industry'],
            $validated['employment_type'] ?? null,
            $validated['experience_level'] ?? null,
            $validated['work_arrangement'] ?? null,
            $validated['company'] ?? null
        );

        return response()->json([
            'data' => [
                'description' => $data['description'],
                'responsibilities' => $data['responsibilities'],
                'qualifications' => $data['qualifications'],
                'benefits' => $data['benefits'],
                'salaryMin' => $data['salary_min'] ?? null,
                'salaryMax' => $data['salary_max'] ?? null,
                'experience' => $data['experience'] ?? null,
            ],
        ]);
    }

    private function ensureQuota(Request $request): void
    {
        $key = 'job-listing-ai:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, config('resume.ai_daily_limit', 20))) {
            abort(429, 'AI daily limit reached. Try again tomorrow.');
        }

        RateLimiter::hit($key, 86400);
    }
}
