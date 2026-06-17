<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListingOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class JobListingOptionController extends Controller
{
    /** GET /api/v1/jobs/listing-options — community-added roles & industries. */
    public function index()
    {
        $roles = JobListingOption::query()
            ->where('kind', 'role')
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->pluck('name')
            ->values();

        $industries = JobListingOption::query()
            ->where('kind', 'industry')
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->pluck('name')
            ->values();

        return response()->json([
            'data' => [
                'roles' => $roles,
                'industries' => $industries,
            ],
        ]);
    }

    /** POST /api/v1/jobs/listing-options — save a custom role or industry for everyone. */
    public function store(Request $request)
    {
        $this->ensureStoreQuota($request);

        $validated = $request->validate([
            'kind' => ['required', 'string', 'in:role,industry'],
            'name' => ['required', 'string', 'min:2', 'max:120'],
        ]);

        $name = $this->formatName($validated['name']);
        $normalized = $this->normalizeName($name);

        if ($normalized === '') {
            return response()->json(['message' => 'Please enter a valid name.'], 422);
        }

        $option = JobListingOption::query()->firstOrNew([
            'kind' => $validated['kind'],
            'normalized_name' => $normalized,
        ]);

        if (! $option->exists) {
            $option->name = $name;
            $option->submitted_by = $request->user()?->id;
            $option->usage_count = 1;
        } else {
            $option->increment('usage_count');
        }

        $option->save();

        return response()->json([
            'data' => [
                'kind' => $option->kind,
                'name' => $option->name,
                'usage_count' => $option->usage_count,
            ],
            'message' => 'Added to the shared list for future job listings.',
        ], $option->wasRecentlyCreated ? 201 : 200);
    }

    private function ensureStoreQuota(Request $request): void
    {
        $key = 'job-listing-option:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, 40)) {
            abort(429, 'Too many submissions. Please wait a moment.');
        }

        RateLimiter::hit($key, 3600);
    }

    private function normalizeName(string $name): string
    {
        $trimmed = trim(preg_replace('/\s+/', ' ', $name) ?? '');

        return mb_strtolower($trimmed);
    }

    private function formatName(string $name): string
    {
        return trim(preg_replace('/\s+/', ' ', $name) ?? '');
    }
}
