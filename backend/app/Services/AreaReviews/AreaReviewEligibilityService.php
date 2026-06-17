<?php

namespace App\Services\AreaReviews;

class AreaReviewEligibilityService
{
    public const RESIDENCE_CURRENT_NEIGHBORHOOD = 'residence_current_neighborhood';

    public const RESIDENCE_PREVIOUS_NEIGHBORHOODS = 'residence_previous_neighborhoods';

    public const RESIDENCE_CURRENT_BUILDING = 'residence_current_building';

    public const RESIDENCE_PREVIOUS_BUILDINGS = 'residence_previous_buildings';

    /**
     * @param  array<string, mixed>  $preferences
     * @return array{
     *     currentNeighborhood: ?array{emirate: string, area?: string},
     *     previousNeighborhoods: array<int, array{emirate: string, area?: string}>,
     *     currentBuilding: ?string,
     *     previousBuildings: array<int, string>
     * }
     */
    public function hydrateResidenceFromPreferences(array $preferences): array
    {
        return [
            'currentNeighborhood' => $this->normalizeSingleLocation(
                $preferences[self::RESIDENCE_CURRENT_NEIGHBORHOOD] ?? null
            ),
            'previousNeighborhoods' => $this->normalizeLocationList(
                $preferences[self::RESIDENCE_PREVIOUS_NEIGHBORHOODS] ?? null
            ),
            'currentBuilding' => $this->normalizeBuilding(
                $preferences[self::RESIDENCE_CURRENT_BUILDING] ?? null
            ),
            'previousBuildings' => $this->normalizeBuildingList(
                $preferences[self::RESIDENCE_PREVIOUS_BUILDINGS] ?? null
            ),
        ];
    }

    /**
     * @param  array{
     *     currentNeighborhood: ?array{emirate: string, area?: string},
     *     previousNeighborhoods: array<int, array{emirate: string, area?: string}>,
     *     currentBuilding: ?string,
     *     previousBuildings: array<int, string>
     * }  $residence
     * @param  array{id: string, name: string, type: string, emirate: string}  $insight
     * @return array{eligible: bool, residenceStatus?: 'current'|'past', matchedAs?: string, reason?: string}
     */
    public function checkEligibility(array $residence, array $insight): array
    {
        if (($insight['type'] ?? null) === 'building') {
            if (
                $residence['currentBuilding'] &&
                $this->buildingNamesMatch($residence['currentBuilding'], $insight['name'])
            ) {
                return [
                    'eligible' => true,
                    'residenceStatus' => 'current',
                    'matchedAs' => $residence['currentBuilding'],
                ];
            }

            foreach ($residence['previousBuildings'] as $building) {
                if ($this->buildingNamesMatch($building, $insight['name'])) {
                    return [
                        'eligible' => true,
                        'residenceStatus' => 'past',
                        'matchedAs' => $building,
                    ];
                }
            }

            return [
                'eligible' => false,
                'reason' => $this->hasAnyResidenceHistory($residence) ? 'no_match' : 'no_residence_history',
            ];
        }

        if (
            $residence['currentNeighborhood'] &&
            $this->neighborhoodMatches($residence['currentNeighborhood'], $insight)
        ) {
            return [
                'eligible' => true,
                'residenceStatus' => 'current',
                'matchedAs' => $this->formatLocationLabel($residence['currentNeighborhood']),
            ];
        }

        foreach ($residence['previousNeighborhoods'] as $neighborhood) {
            if ($this->neighborhoodMatches($neighborhood, $insight)) {
                return [
                    'eligible' => true,
                    'residenceStatus' => 'past',
                    'matchedAs' => $this->formatLocationLabel($neighborhood),
                ];
            }
        }

        return [
            'eligible' => false,
            'reason' => $this->hasAnyResidenceHistory($residence) ? 'no_match' : 'no_residence_history',
        ];
    }

    /**
     * @param  array{
     *     currentNeighborhood: ?array{emirate: string, area?: string},
     *     previousNeighborhoods: array<int, array{emirate: string, area?: string}>,
     *     currentBuilding: ?string,
     *     previousBuildings: array<int, string>
     * }  $residence
     */
    protected function hasAnyResidenceHistory(array $residence): bool
    {
        return (bool) (
            $residence['currentNeighborhood'] ||
            count($residence['previousNeighborhoods']) > 0 ||
            $residence['currentBuilding'] ||
            count($residence['previousBuildings']) > 0
        );
    }

    /**
     * @param  array{emirate: string, area?: string}  $userLoc
     * @param  array{name: string, emirate: string}  $insight
     */
    protected function neighborhoodMatches(array $userLoc, array $insight): bool
    {
        if (($userLoc['emirate'] ?? '') !== ($insight['emirate'] ?? '')) {
            return false;
        }

        if (empty($userLoc['area'])) {
            return false;
        }

        return $this->listingMatchesLocation(
            ['emirate' => $insight['emirate'], 'area' => $insight['name']],
            $userLoc
        );
    }

    /**
     * @param  array{emirate: string, area: string}  $listing
     * @param  array{emirate: string, area?: string}  $preference
     */
    protected function listingMatchesLocation(array $listing, array $preference): bool
    {
        if ($listing['emirate'] !== $preference['emirate']) {
            return false;
        }

        if (empty($preference['area'])) {
            return true;
        }

        $listingArea = mb_strtolower(trim($listing['area']));
        $preferred = mb_strtolower(trim((string) $preference['area']));

        if ($listingArea === '' || $preferred === '') {
            return true;
        }

        return $listingArea === $preferred
            || str_contains($listingArea, $preferred)
            || str_contains($preferred, $listingArea);
    }

    protected function buildingNamesMatch(string $userBuilding, string $placeName): bool
    {
        $a = $this->normalizeName($userBuilding);
        $b = $this->normalizeName($placeName);

        if ($a === '' || $b === '') {
            return false;
        }

        return $a === $b || str_contains($a, $b) || str_contains($b, $a);
    }

    protected function normalizeName(string $value): string
    {
        return preg_replace('/\s+/', ' ', mb_strtolower(trim($value))) ?? '';
    }

    /**
     * @return ?array{emirate: string, area?: string}
     */
    protected function normalizeSingleLocation(mixed $value): ?array
    {
        $list = $this->normalizeLocationList(is_array($value) && array_is_list($value) ? $value : [$value]);

        return $list[0] ?? null;
    }

    /**
     * @return array<int, array{emirate: string, area?: string}>
     */
    protected function normalizeLocationList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $seen = [];
        $out = [];

        foreach ($value as $item) {
            $loc = null;

            if (is_string($item) && trim($item) !== '') {
                $loc = ['emirate' => trim($item)];
            } elseif (is_array($item) && ! empty($item['emirate'])) {
                $emirate = trim((string) $item['emirate']);
                $area = isset($item['area']) && trim((string) $item['area']) !== ''
                    ? trim((string) $item['area'])
                    : null;
                $loc = $area ? ['emirate' => $emirate, 'area' => $area] : ['emirate' => $emirate];
            }

            if (! $loc) {
                continue;
            }

            $key = ($loc['emirate'] ?? '').'|'.($loc['area'] ?? '');
            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $out[] = $loc;
        }

        return $out;
    }

    protected function normalizeBuilding(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }

    /**
     * @return array<int, string>
     */
    protected function normalizeBuildingList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $seen = [];
        $out = [];

        foreach ($value as $item) {
            if (! is_string($item)) {
                continue;
            }

            $trimmed = trim($item);
            if ($trimmed === '' || isset($seen[$trimmed])) {
                continue;
            }

            $seen[$trimmed] = true;
            $out[] = $trimmed;
        }

        return $out;
    }

    /**
     * @param  array{emirate: string, area?: string}  $loc
     */
    protected function formatLocationLabel(array $loc): string
    {
        if (! empty($loc['area'])) {
            return $loc['emirate'].' · '.$loc['area'];
        }

        return $loc['emirate'];
    }
}
