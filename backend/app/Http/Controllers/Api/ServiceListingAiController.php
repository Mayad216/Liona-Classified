<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ServiceListingAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ServiceListingAiController extends Controller
{
    public function suggest(Request $request, ServiceListingAiService $ai)
    {
        $this->ensureQuota($request);

        $validated = $request->validate([
            'category' => ['required', 'string', 'max:80'],
            'title' => ['required', 'string', 'max:160'],
            'emirate' => ['required', 'string', 'max:60'],
            'area' => ['required', 'string', 'max:120'],
            'account_type' => ['nullable', 'string', 'in:individual,business'],
            'provider_name' => ['nullable', 'string', 'max:120'],
            'price_from' => ['nullable', 'numeric'],
            'unit' => ['nullable', 'string', 'max:40'],
            'response_time' => ['nullable', 'string', 'max:40'],
            'years_experience' => ['nullable', 'string', 'max:20'],
            'coverage' => ['nullable', 'string', 'max:40'],
            'same_day' => ['nullable', 'string', 'max:20'],
            'trade_licence' => ['nullable', 'string', 'max:40'],
            'tutoring_languages' => ['nullable', 'array'],
            'teaches_levels' => ['nullable', 'array'],
            'session_format' => ['nullable', 'string', 'max:40'],
            'meal_cuisines' => ['nullable', 'array'],
            'dietary_tags' => ['nullable', 'array'],
            'meal_offering_type' => ['nullable', 'string', 'max:40'],
            'meal_fulfillment' => ['nullable', 'string', 'max:40'],
            'pest_types' => ['nullable', 'array'],
        ]);

        $description = $ai->suggestDescription($validated);

        return response()->json([
            'data' => [
                'description' => $description,
            ],
        ]);
    }

    private function ensureQuota(Request $request): void
    {
        $key = 'service-listing-ai:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, config('resume.ai_daily_limit', 20))) {
            abort(429, 'AI daily limit reached. Try again tomorrow.');
        }

        RateLimiter::hit($key, 86400);
    }
}
