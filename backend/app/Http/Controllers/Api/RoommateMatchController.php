<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoommateProfile;
use App\Services\Matchmaking\MatchmakingEngine;
use App\Services\Notifications\ReviewPromptNotificationService;
use Illuminate\Http\Request;

class RoommateMatchController extends Controller
{
    public function __construct(
        protected MatchmakingEngine $engine,
        protected ReviewPromptNotificationService $reviewPrompts
    ) {
    }

    protected function ensureEmiratesIdVerified(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        if (! $user->emirates_id_verified_at) {
            return response()->json([
                'message' => 'Emirates ID verification is required to use Match Me.',
                'code' => 'emirates_id_required',
            ], 403);
        }

        return null;
    }

    /** Expose the dimension config so the React form stays in sync. */
    public function config()
    {
        return response()->json([
            'tuning' => config('matchmaking.tuning'),
            'categories' => config('matchmaking.categories'),
            'dimensions' => config('matchmaking.dimensions'),
        ]);
    }

    /** GET /api/v1/me/roommate-profile */
    public function show(Request $request)
    {
        $profile = $request->user()->roommateProfile()
            ->with('user:id,name,avatar,is_verified')
            ->first();

        return response()->json(['data' => $profile ? $this->serializeProfile($profile) : null]);
    }

    /** POST /api/v1/me/roommate-profile — upsert */
    public function upsert(Request $request)
    {
        $data = $request->validate([
            'age' => ['nullable', 'integer', 'between:16,90'],
            'gender' => ['nullable', 'string', 'in:Male,Female,Prefer not to say'],
            'occupation' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'listing_id' => ['nullable', 'exists:listings,id'],
            'monthly_budget_aed' => ['nullable', 'integer', 'between:500,50000'],
            'move_in_date' => ['nullable', 'date'],
            'lease_duration' => ['nullable', 'string', 'max:40'],
            'preferences' => ['required', 'array'],
            'looking_for' => ['nullable', 'array'],
            'dealbreakers' => ['nullable', 'array'],
            'is_discoverable' => ['nullable', 'boolean'],
        ]);

        $requiredDims = collect(config('matchmaking.dimensions', []))
            ->reject(fn ($d) => ! empty($d['optional']) || ! empty($d['search_only']))
            ->count();
        $answered = collect($data['preferences'])->filter(
            fn ($v) => $v !== null && (is_array($v) ? count($v) > 0 : true)
        )->count();
        $basicsAnswered =
            (! empty($data['monthly_budget_aed']) ? 1 : 0) +
            (! empty($data['move_in_date']) ? 1 : 0);
        $total = 2 + $requiredDims;
        $data['completion'] = $total > 0 ? min(1, ($basicsAnswered + $answered) / $total) : 0;

        $profile = RoommateProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        $profile->load('user:id,name,avatar,is_verified');

        $this->reviewPrompts->syncForProfile($profile);

        return response()->json(['data' => $this->serializeProfile($profile)]);
    }

    /** GET /api/v1/roommate-matches — top matches for the current user. */
    public function index(Request $request)
    {
        if ($blocked = $this->ensureEmiratesIdVerified($request)) {
            return $blocked;
        }

        $seeker = $request->user()->roommateProfile;
        if (! $seeker) {
            return response()->json([
                'message' => 'Complete your roommate profile first.',
            ], 422);
        }

        $minScore = $request->integer('min_score', config('matchmaking.tuning.min_display_score', 55));
        $limit = $request->integer('limit', 20);

        $results = $this->engine->topMatches(
            $seeker,
            $this->discoverableCandidates($request),
            $minScore,
            $limit
        );

        return response()->json(['data' => $results]);
    }

    /**
     * POST /api/v1/roommate-matches/search — rank against ad-hoc criteria.
     *
     * Saved search presets live client-side, so the active preset has to travel
     * with the request. Without it the server would always score against
     * whatever `looking_for` happened to be persisted last, and switching
     * presets in the UI would silently do nothing.
     */
    public function search(Request $request)
    {
        if ($blocked = $this->ensureEmiratesIdVerified($request)) {
            return $blocked;
        }

        $data = $request->validate([
            'looking_for' => ['nullable', 'array'],
            'dealbreakers' => ['nullable', 'array'],
            'dealbreakers.*' => ['string', 'max:64'],
            'min_score' => ['nullable', 'integer', 'between:0,100'],
            'limit' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $seeker = $request->user()->roommateProfile;
        if (! $seeker) {
            return response()->json([
                'message' => 'Complete your roommate profile first.',
            ], 422);
        }

        // Clone rather than replicate: this must not persist, but it still needs
        // the primary key so cached bio embeddings resolve.
        $seeker = clone $seeker;
        if (is_array($data['looking_for'] ?? null)) {
            $seeker->looking_for = $data['looking_for'];
        }
        if (is_array($data['dealbreakers'] ?? null)) {
            $seeker->dealbreakers = $data['dealbreakers'];
        }

        $results = $this->engine->topMatches(
            $seeker,
            $this->discoverableCandidates($request),
            $data['min_score'] ?? (int) config('matchmaking.tuning.min_display_score', 55),
            $data['limit'] ?? 20
        );

        return response()->json(['data' => $results]);
    }

    /** @return \Illuminate\Database\Eloquent\Collection<int, RoommateProfile> */
    protected function discoverableCandidates(Request $request)
    {
        return RoommateProfile::with('user:id,name,avatar,is_verified')
            ->where('user_id', '!=', $request->user()->id)
            ->where('is_discoverable', true)
            ->get();
    }

    /** GET /api/v1/roommate-matches/{user} — single-pair detail. */
    public function pair(Request $request, int $user)
    {
        if ($blocked = $this->ensureEmiratesIdVerified($request)) {
            return $blocked;
        }

        $seeker = $request->user()->roommateProfile;
        $candidate = RoommateProfile::with('user:id,name,avatar,is_verified')
            ->where('user_id', $user)
            ->first();

        if (! $seeker || ! $candidate) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        if (! $candidate->is_discoverable && $candidate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'This profile is not discoverable.'], 404);
        }

        $candidate->increment('match_views');

        return response()->json(['data' => $this->engine->scorePair($seeker, $candidate)]);
    }

    protected function serializeProfile(RoommateProfile $profile): array
    {
        $profile->loadMissing('user:id,name,avatar,is_verified');

        return [
            'user_id' => $profile->user_id,
            'age' => $profile->age,
            'gender' => $profile->gender,
            'occupation' => $profile->occupation,
            'bio' => $profile->bio,
            'listing_id' => $profile->listing_id,
            'monthly_budget_aed' => $profile->monthly_budget_aed,
            'move_in_date' => $profile->move_in_date?->format('Y-m-d'),
            'lease_duration' => $profile->lease_duration,
            'preferences' => $profile->preferences ?? [],
            'looking_for' => $profile->looking_for ?? [],
            'dealbreakers' => $profile->dealbreakers ?? [],
            'is_discoverable' => (bool) $profile->is_discoverable,
            'completion' => $profile->completion,
            'user' => $profile->user ? [
                'id' => $profile->user->id,
                'name' => $profile->user->name,
                'avatar' => $profile->user->avatar,
                'is_verified' => $profile->user->is_verified,
            ] : null,
        ];
    }
}
