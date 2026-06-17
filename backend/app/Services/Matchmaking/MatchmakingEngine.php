<?php

namespace App\Services\Matchmaking;

use App\Models\RoommateProfile;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Roommate compatibility scoring engine.
 *
 * Mirrors `frontend/src/lib/matchmaking/engine.ts` so client- and server-side
 * scores are identical. All dimensions, weights, and rules live in
 * `config/matchmaking.php` — replace that single file with your parameters
 * and this engine will reflect them without code changes.
 */
class MatchmakingEngine
{
    /** @var array<int, array<string, mixed>> */
    protected array $dimensions;

    /** @var array<string, mixed> */
    protected array $tuning;

    public function __construct()
    {
        $this->dimensions = config('matchmaking.dimensions', []);
        $this->tuning = config('matchmaking.tuning', []);
    }

    /**
     * Score every candidate against the seeker, return ranked results.
     *
     * @param  Collection<int, RoommateProfile>  $candidates
     * @return array<int, array<string, mixed>>
     */
    public function topMatches(
        RoommateProfile $seeker,
        Collection $candidates,
        int $minScore = null,
        ?int $limit = null,
        bool $includeExcluded = false
    ): array {
        $minScore ??= (int) ($this->tuning['min_display_score'] ?? 55);

        $results = $candidates
            ->reject(fn (RoommateProfile $c) => $c->user_id === $seeker->user_id)
            ->map(fn (RoommateProfile $c) => $this->scorePair($seeker, $c))
            ->values()
            ->all();

        if (! $includeExcluded) {
            $results = array_values(array_filter($results, fn ($r) => ! $r['excluded']));
        }
        $results = array_values(array_filter(
            $results,
            fn ($r) => $r['excluded'] || $r['score'] >= $minScore
        ));
        usort($results, fn ($a, $b) => $b['score'] <=> $a['score']);

        if ($limit) {
            $results = array_slice($results, 0, $limit);
        }
        return $results;
    }

    public function scorePair(RoommateProfile $seeker, RoommateProfile $candidate): array
    {
        if (! $this->passesGenderFilter($seeker, $candidate)) {
            $genderDim = collect($this->dimensions)->firstWhere('key', 'gender_preference');
            $genderScore = $genderDim
                ? $this->scoreGenderCompatibility($seeker, $candidate, $genderDim)
                : ['score' => 0, 'explanation' => 'Gender preference mismatch', 'contributed' => true];

            return [
                'candidate' => $this->serializeCandidate($candidate),
                'score' => 0,
                'raw' => 0,
                'breakdown' => $genderDim ? [[
                    'key' => $genderDim['key'],
                    'label' => $genderDim['label'],
                    'category' => $genderDim['category'],
                    'score' => $genderScore['score'],
                    'weight' => (float) $genderDim['weight'],
                    'explanation' => $genderScore['explanation'],
                    'contributed' => true,
                ]] : [],
                'excluded' => true,
                'excluded_reason' => $this->genderFilterFailureReason($seeker, $candidate),
                'highlights' => [],
                'concerns' => [],
            ];
        }

        if (! $this->passesLocationFilter($seeker, $candidate)) {
            $locationDim = collect($this->dimensions)->firstWhere('key', 'preferred_locations');
            $locationScore = $locationDim
                ? $this->scoreLocationCompatibility($seeker, $candidate, $locationDim)
                : ['score' => 0, 'explanation' => 'Location preference mismatch', 'contributed' => true];

            return [
                'candidate' => $this->serializeCandidate($candidate),
                'score' => 0,
                'raw' => 0,
                'breakdown' => $locationDim ? [[
                    'key' => $locationDim['key'],
                    'label' => $locationDim['label'],
                    'category' => $locationDim['category'],
                    'score' => $locationScore['score'],
                    'weight' => (float) $locationDim['weight'],
                    'explanation' => $locationScore['explanation'],
                    'contributed' => true,
                ]] : [],
                'excluded' => true,
                'excluded_reason' => $this->locationFilterFailureReason($seeker, $candidate),
                'highlights' => [],
                'concerns' => [],
            ];
        }

        $hard = $this->checkHardFilters($seeker, $candidate);

        $breakdown = [];
        foreach ($this->dimensions as $dim) {
            if (($dim['key'] ?? null) === 'gender_preference') {
                $breakdown[] = $this->scoreGenderCompatibility($seeker, $candidate, $dim);
                continue;
            }

            if (($dim['key'] ?? null) === 'preferred_locations') {
                $breakdown[] = $this->scoreLocationCompatibility($seeker, $candidate, $dim);
                continue;
            }

            $a = ($seeker->looking_for ?? [])[$dim['key']] ?? null;
            $b = ($candidate->preferences ?? [])[$dim['key']] ?? null;
            $breakdown[] = $this->scoreDimension($dim, $a, $b);
        }

        if (! $hard['passed']) {
            return [
                'candidate' => $this->serializeCandidate($candidate),
                'score' => 0,
                'raw' => 0,
                'breakdown' => $breakdown,
                'excluded' => true,
                'excluded_reason' => $hard['reason'],
                'highlights' => [],
                'concerns' => [],
            ];
        }

        $contributing = array_values(array_filter($breakdown, fn ($d) => $d['contributed']));
        $totalWeight = array_sum(array_column($contributing, 'weight')) ?: 1;
        $weighted = array_sum(array_map(
            fn ($d) => $d['score'] * $d['weight'],
            $contributing
        ));
        $raw = $weighted / $totalWeight;

        // Consistency bonus
        $bonus = $this->tuning['consistency_bonus'] ?? null;
        if ($bonus) {
            $strong = count(array_filter($contributing, fn ($d) => $d['score'] >= 0.8));
            if ($strong >= $bonus['threshold_count']) {
                $raw += min(
                    $bonus['cap'],
                    ($strong - $bonus['threshold_count'] + 1) * $bonus['per_dimension']
                );
            }
        }
        $raw = max(0.0, min(1.0, $raw));

        // Highlights & concerns
        $sorted = $contributing;
        usort(
            $sorted,
            fn ($a, $b) => ($b['score'] * $b['weight']) <=> ($a['score'] * $a['weight'])
        );
        $highlights = array_slice(
            array_values(array_filter($sorted, fn ($d) => $d['score'] >= 0.75)),
            0,
            3
        );
        $concernsSorted = $contributing;
        usort(
            $concernsSorted,
            fn ($a, $b) => ($a['score'] * $a['weight']) <=> ($b['score'] * $b['weight'])
        );
        $concerns = array_slice(
            array_values(array_filter($concernsSorted, fn ($d) => $d['score'] < 0.5)),
            0,
            3
        );

        return [
            'candidate' => $this->serializeCandidate($candidate),
            'score' => (int) round($raw * 100),
            'raw' => $raw,
            'breakdown' => $breakdown,
            'excluded' => false,
            'highlights' => $highlights,
            'concerns' => $concerns,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Per-dimension scoring
    // ─────────────────────────────────────────────────────────────────────

    protected function scoreDimension(array $dim, mixed $a, mixed $b): array
    {
        $base = [
            'key' => $dim['key'],
            'label' => $dim['label'],
            'category' => $dim['category'],
            'weight' => (float) $dim['weight'],
        ];

        if ($a === null && $b === null) {
            return [...$base, 'score' => 0.5, 'explanation' => 'No data', 'contributed' => false];
        }
        if ($a === null || $b === null) {
            return [...$base, 'score' => 0.5, 'explanation' => 'One side missing', 'contributed' => false];
        }

        $rule = $dim['rule'] ?? $this->defaultRuleForType($dim['type']);

        $score = match ($rule) {
            'exact', 'matrix' => $this->scoreExact($a, $b, $dim),
            'scale' => $this->scoreScale($a, $b, $dim),
            'boolean' => $this->scoreBoolean($a, $b),
            'overlap' => $this->scoreOverlap($a, $b),
            'range' => $this->scoreRange($a, $b, $dim),
            default => 0.5,
        };

        return [
            ...$base,
            'score' => max(0.0, min(1.0, $score)),
            'explanation' => $this->explain($dim, $rule, $a, $b, $score),
            'contributed' => true,
        ];
    }

    protected function defaultRuleForType(array $type): string
    {
        return match ($type['kind'] ?? 'enum') {
            'enum' => 'exact',
            'multi-select' => 'overlap',
            'scale' => 'scale',
            'boolean' => 'boolean',
            'range' => 'range',
            default => 'exact',
        };
    }

    protected function scoreExact(mixed $a, mixed $b, array $dim): float
    {
        if ($a === $b) {
            return 1.0;
        }
        $opts = $dim['type']['options'] ?? [];
        if (
            ($dim['type']['kind'] ?? null) === 'enum' &&
            in_array('Any', $opts, true) &&
            ($a === 'Any' || $b === 'Any')
        ) {
            return 1.0;
        }
        if (($dim['rule'] ?? null) === 'matrix' && isset($dim['matrix'])) {
            $v = $dim['matrix'][$a][$b] ?? null;
            if (is_numeric($v)) {
                return (float) $v;
            }
        }
        return 0.0;
    }

    protected function scoreScale(mixed $a, mixed $b, array $dim): float
    {
        if (! is_numeric($a) || ! is_numeric($b)) {
            return 0.5;
        }
        $range = ($dim['type']['max'] ?? 1) - ($dim['type']['min'] ?? 0);
        return $range > 0 ? 1 - abs($a - $b) / $range : 0.5;
    }

    protected function scoreBoolean(mixed $a, mixed $b): float
    {
        return $a === $b ? 1.0 : 0.0;
    }

    protected function scoreOverlap(mixed $a, mixed $b): float
    {
        if (! is_array($a) || ! is_array($b) || $a === [] || $b === []) {
            return 0.5;
        }
        $intersection = count(array_intersect($a, $b));
        $union = count(array_unique(array_merge($a, $b)));
        return $union > 0 ? $intersection / $union : 0.5;
    }

    protected function scoreRange(mixed $a, mixed $b, array $dim): float
    {
        $tuple = function ($v): ?array {
            if (is_array($v) && count($v) === 2 && is_numeric($v[0]) && is_numeric($v[1])) {
                return [(float) $v[0], (float) $v[1]];
            }
            if (is_numeric($v)) {
                return [(float) $v, (float) $v];
            }
            return null;
        };
        $A = $tuple($a);
        $B = $tuple($b);
        if (! $A || ! $B) {
            return 0.5;
        }
        $overlap = max(0, min($A[1], $B[1]) - max($A[0], $B[0]));
        $span = max($A[1] - $A[0], $B[1] - $B[0], 1);
        if ($overlap === 0) {
            $dimRange = ($dim['type']['max'] ?? 1) - ($dim['type']['min'] ?? 0) ?: 1;
            $gap = max(0, max($A[0], $B[0]) - min($A[1], $B[1]));
            return max(0.0, min(1.0, (1 - $gap / $dimRange) * 0.4));
        }
        return max(0.0, min(1.0, $overlap / $span));
    }

    protected function explain(array $dim, string $rule, mixed $a, mixed $b, float $score): string
    {
        if ($rule === 'overlap' && is_array($a) && is_array($b)) {
            $shared = array_values(array_intersect($a, $b));
            if (empty($shared)) {
                return 'No overlap';
            }
            $head = implode(', ', array_slice($shared, 0, 3));
            $extra = count($shared) > 3 ? ' +'.(count($shared) - 3) : '';
            return "Shared: {$head}{$extra}";
        }

        $youSaid = is_scalar($a) ? (string) $a : json_encode($a);
        $theySaid = is_scalar($b) ? (string) $b : json_encode($b);
        if ($a === $b) {
            return "Both: {$youSaid}";
        }
        if ($score >= 0.7) {
            return "Close — you: {$youSaid}, them: {$theySaid}";
        }
        if ($score >= 0.4) {
            return "Partial — you: {$youSaid}, them: {$theySaid}";
        }
        return "Mismatch — you: {$youSaid}, them: {$theySaid}";
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Hard filters
    // ─────────────────────────────────────────────────────────────────────

    protected function checkHardFilters(RoommateProfile $seeker, RoommateProfile $candidate): array
    {
        foreach ($this->dimensions as $dim) {
            if (empty($dim['hard_filter'])) {
                continue;
            }

            if (($dim['key'] ?? null) === 'gender_preference') {
                continue;
            }

            $a = ($seeker->looking_for ?? [])[$dim['key']] ?? null;
            $b = ($candidate->preferences ?? [])[$dim['key']] ?? null;
            if ($a === null || $b === null) {
                continue;
            }
            $opts = $dim['type']['options'] ?? [];
            if (
                ($dim['type']['kind'] ?? null) === 'enum' &&
                in_array('Any', $opts, true) &&
                ($a === 'Any' || $b === 'Any')
            ) {
                continue;
            }
            if ($a !== $b) {
                return [
                    'passed' => false,
                    'reason' => "{$dim['label']} mismatch",
                ];
            }
        }

        return ['passed' => true, 'reason' => null];
    }

    protected function scoreGenderCompatibility(
        RoommateProfile $seeker,
        RoommateProfile $candidate,
        array $dim
    ): array {
        $base = [
            'key' => $dim['key'],
            'label' => $dim['label'],
            'category' => $dim['category'],
            'weight' => (float) $dim['weight'],
        ];

        $seekerToCandidate = $this->scoreGenderPreferenceVsGender(
            $this->resolveGenderPreference($seeker),
            $candidate->gender
        );
        $candidateToSeeker = $this->scoreGenderPreferenceVsGender(
            $this->resolveGenderPreference($candidate),
            $seeker->gender
        );

        $seekerPref = $this->resolveGenderPreference($seeker);
        $candidatePref = $this->resolveGenderPreference($candidate);

        if ($this->isSpecificGenderPreference($seekerPref)) {
            if (! $candidate->gender || strcasecmp((string) $candidate->gender, 'Prefer not to say') === 0) {
                return [
                    ...$base,
                    'score' => 0.0,
                    'explanation' => "You prefer {$seekerPref} roommates — candidate gender not available",
                    'contributed' => true,
                ];
            }
            if ($seekerToCandidate['score'] === 0.0) {
                return [...$base, ...$seekerToCandidate];
            }
        }

        if ($this->isSpecificGenderPreference($candidatePref)) {
            if (! $seeker->gender || strcasecmp((string) $seeker->gender, 'Prefer not to say') === 0) {
                return [
                    ...$base,
                    'score' => 0.0,
                    'explanation' => "They prefer {$candidatePref} roommates — your gender is not set on your profile",
                    'contributed' => true,
                ];
            }
            if ($candidateToSeeker['score'] === 0.0) {
                return [...$base, ...$candidateToSeeker];
            }
        }

        if (! $seekerToCandidate['contributed'] && ! $candidateToSeeker['contributed']) {
            return [
                ...$base,
                'score' => 0.5,
                'explanation' => 'Gender data incomplete on one or both sides',
                'contributed' => false,
            ];
        }

        $parts = array_values(array_filter(
            [$seekerToCandidate, $candidateToSeeker],
            fn ($p) => $p['contributed']
        ));
        $score = min(array_column($parts, 'score'));
        $explanation = $score >= 1.0
            ? "Mutual gender fit — you: {$seeker->gender}, them: {$candidate->gender}"
            : "You → them: {$seekerToCandidate['explanation']} · Them → you: {$candidateToSeeker['explanation']}";

        return [
            ...$base,
            'score' => max(0.0, min(1.0, $score)),
            'explanation' => $explanation,
            'contributed' => true,
        ];
    }

    protected function isSpecificGenderPreference(mixed $preference): bool
    {
        return $preference === 'Male' || $preference === 'Female';
    }

    protected function passesGenderFilter(RoommateProfile $seeker, RoommateProfile $candidate): bool
    {
        $seekerPref = $this->resolveGenderPreference($seeker);
        $candidatePref = $this->resolveGenderPreference($candidate);

        if ($this->isSpecificGenderPreference($seekerPref)) {
            if (! $candidate->gender || strcasecmp((string) $candidate->gender, 'Prefer not to say') === 0) {
                return false;
            }
            if ((string) $candidate->gender !== (string) $seekerPref) {
                return false;
            }
        }

        if ($this->isSpecificGenderPreference($candidatePref)) {
            if (! $seeker->gender || strcasecmp((string) $seeker->gender, 'Prefer not to say') === 0) {
                return false;
            }
            if ((string) $seeker->gender !== (string) $candidatePref) {
                return false;
            }
        }

        return true;
    }

    protected function genderFilterFailureReason(RoommateProfile $seeker, RoommateProfile $candidate): string
    {
        $seekerPref = $this->resolveGenderPreference($seeker);
        $candidatePref = $this->resolveGenderPreference($candidate);
        $candidateName = $candidate->user?->name ?? 'This user';

        if ($this->isSpecificGenderPreference($seekerPref)) {
            if (! $candidate->gender) {
                return "You prefer {$seekerPref} roommates — {$candidateName} has not set their gender";
            }
            if ((string) $candidate->gender !== (string) $seekerPref) {
                return "You prefer {$seekerPref} roommates — {$candidateName} is {$candidate->gender}";
            }
        }

        if ($this->isSpecificGenderPreference($candidatePref)) {
            if (! $seeker->gender) {
                return "{$candidateName} prefers {$candidatePref} roommates — set your gender on your profile";
            }
            if ((string) $seeker->gender !== (string) $candidatePref) {
                return "{$candidateName} prefers {$candidatePref} roommates — you are {$seeker->gender}";
            }
        }

        return 'Gender preference mismatch';
    }

    protected function passesSeekerGenderFilter(RoommateProfile $seeker, RoommateProfile $candidate): bool
    {
        return $this->passesGenderFilter($seeker, $candidate);
    }

    protected function seekerGenderFilterFailureReason(RoommateProfile $seeker, RoommateProfile $candidate): string
    {
        return $this->genderFilterFailureReason($seeker, $candidate);
    }

    protected function resolveGenderPreference(RoommateProfile $profile): mixed
    {
        return ($profile->looking_for ?? [])['gender_preference']
            ?? ($profile->preferences ?? [])['gender_preference']
            ?? null;
    }

    protected function scoreGenderPreferenceVsGender(mixed $preference, mixed $actualGender): array
    {
        if ($preference === null && $actualGender === null) {
            return ['score' => 0.5, 'explanation' => 'No data on either side', 'contributed' => false];
        }
        if ($preference === null || $actualGender === null) {
            return ['score' => 0.5, 'explanation' => 'Gender or preference not set yet', 'contributed' => false];
        }

        $pref = (string) $preference;
        $gender = (string) $actualGender;

        if (strcasecmp($gender, 'Prefer not to say') === 0) {
            return ['score' => 0.5, 'explanation' => 'Gender not shared', 'contributed' => false];
        }
        if ($pref === 'Any') {
            return ['score' => 1.0, 'explanation' => "Open to any gender · Them: {$gender}", 'contributed' => true];
        }
        if ($pref === 'Family') {
            return ['score' => 0.5, 'explanation' => "Family housing preference · Them: {$gender}", 'contributed' => false];
        }

        $match = $pref === $gender;

        return [
            'score' => $match ? 1.0 : 0.0,
            'explanation' => $match
                ? "Prefers {$pref} · They are {$gender}"
                : "Prefers {$pref} · They are {$gender} — mismatch",
            'contributed' => true,
        ];
    }

    /** @return array<int, array{emirate: string, area: ?string}> */
    protected function normalizeLocations(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $seen = [];
        $out = [];

        foreach ($value as $item) {
            $loc = null;

            if (is_string($item) && trim($item) !== '') {
                $loc = ['emirate' => trim($item), 'area' => null];
            } elseif (is_array($item) && ! empty($item['emirate'])) {
                $emirate = trim((string) $item['emirate']);
                $areaRaw = $item['area'] ?? null;
                $area = is_string($areaRaw) && trim($areaRaw) !== '' ? trim($areaRaw) : null;
                $loc = ['emirate' => $emirate, 'area' => $area];
            }

            if (! $loc) {
                continue;
            }

            $key = $loc['area'] ? "{$loc['emirate']}::{$loc['area']}" : "{$loc['emirate']}::";
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $out[] = $loc;
        }

        return $out;
    }

    /** @param array{emirate: string, area: ?string} $loc */
    protected function formatLocation(array $loc): string
    {
        return $loc['area'] ? "{$loc['emirate']} · {$loc['area']}" : $loc['emirate'];
    }

    /** @param array<int, array{emirate: string, area: ?string}> $locations */
    protected function formatLocations(array $locations): string
    {
        if ($locations === []) {
            return 'Any emirate';
        }

        return implode(', ', array_map(fn ($loc) => $this->formatLocation($loc), $locations));
    }

    /** @return array<int, array{emirate: string, area: ?string}> */
    protected function resolveSearchLocations(RoommateProfile $profile): array
    {
        return $this->normalizeLocations(($profile->looking_for ?? [])['preferred_locations'] ?? null);
    }

    /** @return array<int, array{emirate: string, area: ?string}> */
    protected function resolveDesiredLocations(RoommateProfile $profile): array
    {
        return $this->normalizeLocations(($profile->preferences ?? [])['preferred_locations'] ?? null);
    }

    /** @param array{emirate: string, area: ?string} $a @param array{emirate: string, area: ?string} $b */
    protected function locationPairMatches(array $a, array $b): bool
    {
        if ($a['emirate'] !== $b['emirate']) {
            return false;
        }
        if (empty($a['area']) || empty($b['area'])) {
            return true;
        }

        return $a['area'] === $b['area'];
    }

    /** @param array<int, array{emirate: string, area: ?string}> $a @param array<int, array{emirate: string, area: ?string}> $b */
    protected function locationsOverlap(array $a, array $b): bool
    {
        if ($a === [] || $b === []) {
            return true;
        }

        foreach ($a as $x) {
            foreach ($b as $y) {
                if ($this->locationPairMatches($x, $y)) {
                    return true;
                }
            }
        }

        return false;
    }

    /** @param array<int, array{emirate: string, area: ?string}> $search @param array<int, array{emirate: string, area: ?string}> $desired */
    protected function sharedLocations(array $search, array $desired): array
    {
        $shared = [];
        foreach ($search as $x) {
            foreach ($desired as $y) {
                if (! $this->locationPairMatches($x, $y)) {
                    continue;
                }
                $shared[] = [
                    'emirate' => $x['emirate'],
                    'area' => ! empty($x['area']) && ! empty($y['area']) && $x['area'] === $y['area']
                        ? $x['area']
                        : ($x['area'] ?? $y['area'] ?? null),
                ];
            }
        }

        return $shared;
    }

    protected function passesLocationFilter(RoommateProfile $seeker, RoommateProfile $candidate): bool
    {
        $seekerSearch = $this->resolveSearchLocations($seeker);
        $seekerDesired = $this->resolveDesiredLocations($seeker);
        $candidateSearch = $this->resolveSearchLocations($candidate);
        $candidateDesired = $this->resolveDesiredLocations($candidate);

        if ($seekerSearch !== [] && $candidateDesired !== [] && ! $this->locationsOverlap($seekerSearch, $candidateDesired)) {
            return false;
        }

        if ($candidateSearch !== [] && $seekerDesired !== [] && ! $this->locationsOverlap($candidateSearch, $seekerDesired)) {
            return false;
        }

        return true;
    }

    protected function locationFilterFailureReason(RoommateProfile $seeker, RoommateProfile $candidate): string
    {
        $seekerSearch = $this->resolveSearchLocations($seeker);
        $seekerDesired = $this->resolveDesiredLocations($seeker);
        $candidateSearch = $this->resolveSearchLocations($candidate);
        $candidateDesired = $this->resolveDesiredLocations($candidate);
        $candidateName = $candidate->user?->name ?? 'This user';

        if ($seekerSearch !== [] && $candidateDesired !== [] && ! $this->locationsOverlap($seekerSearch, $candidateDesired)) {
            return sprintf(
                "You're searching in %s — %s prefers %s",
                $this->formatLocations($seekerSearch),
                $candidateName,
                $this->formatLocations($candidateDesired)
            );
        }

        if ($candidateSearch !== [] && $seekerDesired !== [] && ! $this->locationsOverlap($candidateSearch, $seekerDesired)) {
            return sprintf(
                '%s is searching in %s — you prefer %s',
                $candidateName,
                $this->formatLocations($candidateSearch),
                $this->formatLocations($seekerDesired)
            );
        }

        return 'Location preference mismatch';
    }

    protected function scoreLocationCompatibility(
        RoommateProfile $seeker,
        RoommateProfile $candidate,
        array $dim
    ): array {
        $base = [
            'key' => $dim['key'],
            'label' => $dim['label'],
            'category' => $dim['category'],
            'weight' => (float) $dim['weight'],
        ];

        $seekerSearch = $this->resolveSearchLocations($seeker);
        $seekerDesired = $this->resolveDesiredLocations($seeker);
        $candidateSearch = $this->resolveSearchLocations($candidate);
        $candidateDesired = $this->resolveDesiredLocations($candidate);

        $seekerToCandidate = $this->scoreLocationPair($seekerSearch, $candidateDesired, 'You search');
        $candidateToSeeker = $this->scoreLocationPair($candidateSearch, $seekerDesired, 'They search');

        if (! $seekerToCandidate['contributed'] && ! $candidateToSeeker['contributed']) {
            return [
                ...$base,
                'score' => 0.5,
                'explanation' => 'No location preferences set on either side',
                'contributed' => false,
            ];
        }

        if ($seekerSearch !== [] && $candidateDesired !== [] && $seekerToCandidate['score'] === 0.0) {
            return [...$base, ...$seekerToCandidate];
        }

        if ($candidateSearch !== [] && $seekerDesired !== [] && $candidateToSeeker['score'] === 0.0) {
            return [...$base, ...$candidateToSeeker];
        }

        $parts = array_values(array_filter(
            [$seekerToCandidate, $candidateToSeeker],
            fn ($p) => $p['contributed']
        ));
        $score = min(array_column($parts, 'score'));
        $shared = [
            ...$this->sharedLocations($seekerSearch, $candidateDesired),
            ...$this->sharedLocations($candidateSearch, $seekerDesired),
        ];

        if ($score >= 1.0 || $shared !== []) {
            return [
                ...$base,
                'score' => max($score, $shared !== [] ? 1.0 : $score),
                'explanation' => $shared !== []
                    ? 'Shared locations: '.$this->formatLocations($shared)
                    : 'Open to any location on one or both sides',
                'contributed' => true,
            ];
        }

        return [
            ...$base,
            'score' => max(0.0, min(1.0, $score)),
            'explanation' => "{$seekerToCandidate['explanation']} · {$candidateToSeeker['explanation']}",
            'contributed' => true,
        ];
    }

    /** @param array<int, array{emirate: string, area: ?string}> $search @param array<int, array{emirate: string, area: ?string}> $desired */
    protected function scoreLocationPair(array $search, array $desired, string $label): array
    {
        if ($search === [] && $desired === []) {
            return ['score' => 0.5, 'explanation' => "{$label}: not set", 'contributed' => false];
        }

        if ($search === [] || $desired === []) {
            return [
                'score' => 1.0,
                'explanation' => sprintf(
                    '%s: %s · Them: %s — open',
                    $label,
                    $this->formatLocations($search),
                    $this->formatLocations($desired)
                ),
                'contributed' => true,
            ];
        }

        $shared = $this->sharedLocations($search, $desired);
        if ($shared === []) {
            return [
                'score' => 0.0,
                'explanation' => sprintf(
                    '%s: %s · Them: %s — no overlap',
                    $label,
                    $this->formatLocations($search),
                    $this->formatLocations($desired)
                ),
                'contributed' => true,
            ];
        }

        $score = count($shared) / max(count($search), count($desired), 1);

        return [
            'score' => max($score, 0.75),
            'explanation' => sprintf(
                '%s: %s · Them: %s · Shared: %s',
                $label,
                $this->formatLocations($search),
                $this->formatLocations($desired),
                $this->formatLocations($shared)
            ),
            'contributed' => true,
        ];
    }

    protected function serializeCandidate(RoommateProfile $p): array
    {
        $u = $p->user;
        return [
            'user_id' => (string) $p->user_id,
            'name' => $u?->name ?? 'User',
            'avatar' => $u?->avatar,
            'age' => $p->age,
            'gender' => $p->gender,
            'occupation' => $p->occupation,
            'bio' => $p->bio,
            'preferences' => $p->preferences ?? [],
            'listing_id' => $p->listing_id ? (string) $p->listing_id : null,
        ];
    }
}
