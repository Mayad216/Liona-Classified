<?php

namespace App\Services;

use App\Models\UaeEmirate;
use App\Models\UaeNeighborhood;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UaeLocationImportService
{
    /** @var array<string, array{name: string, slug: string, dubizzle_city_id: int|null, dubizzle_subdomain: string|null, sort_order: int}> */
    private const EMIRATES = [
        'Dubai' => ['slug' => 'dubai', 'dubizzle_city_id' => 2, 'dubizzle_subdomain' => 'dubai', 'sort_order' => 1],
        'Abu Dhabi' => ['slug' => 'abu-dhabi', 'dubizzle_city_id' => 3, 'dubizzle_subdomain' => 'abudhabi', 'sort_order' => 2],
        'Sharjah' => ['slug' => 'sharjah', 'dubizzle_city_id' => 4, 'dubizzle_subdomain' => 'sharjah', 'sort_order' => 3],
        'Ajman' => ['slug' => 'ajman', 'dubizzle_city_id' => 5, 'dubizzle_subdomain' => 'ajman', 'sort_order' => 4],
        'Ras Al Khaimah' => ['slug' => 'ras-al-khaimah', 'dubizzle_city_id' => 6, 'dubizzle_subdomain' => 'rak', 'sort_order' => 5],
        'Fujairah' => ['slug' => 'fujairah', 'dubizzle_city_id' => 7, 'dubizzle_subdomain' => 'fujairah', 'sort_order' => 6],
        'Umm Al Quwain' => ['slug' => 'umm-al-quwain', 'dubizzle_city_id' => 8, 'dubizzle_subdomain' => 'uaq', 'sort_order' => 7],
        'Al Ain' => ['slug' => 'al-ain', 'dubizzle_city_id' => 9, 'dubizzle_subdomain' => 'alain', 'sort_order' => 8],
    ];

    /**
     * @return array{emirates: int, neighborhoods: int, created: int, updated: int}
     */
    public function importFromJson(array $payload): array
    {
        $created = 0;
        $updated = 0;
        $neighborhoodCount = 0;

        DB::transaction(function () use ($payload, &$created, &$updated, &$neighborhoodCount) {
            $emirateRows = $payload['emirates'] ?? [];
            if ($emirateRows === [] && isset($payload['neighborhoods']) && is_array($payload['neighborhoods'])) {
                $emirateRows = [[
                    'name' => 'Imported',
                    'neighborhoods' => $payload['neighborhoods'],
                ]];
            }

            foreach ($emirateRows as $row) {
                $name = trim((string) ($row['name'] ?? ''));
                if ($name === '') {
                    continue;
                }

                $meta = self::EMIRATES[$name] ?? [
                    'slug' => Str::slug($name),
                    'dubizzle_city_id' => $row['dubizzle_city_id'] ?? null,
                    'dubizzle_subdomain' => $row['dubizzle_subdomain'] ?? null,
                    'sort_order' => 99,
                ];

                $emirate = UaeEmirate::query()->updateOrCreate(
                    ['name' => $name],
                    [
                        'slug' => $meta['slug'],
                        'dubizzle_city_id' => $meta['dubizzle_city_id'],
                        'dubizzle_subdomain' => $meta['dubizzle_subdomain'],
                        'sort_order' => $meta['sort_order'],
                    ]
                );

                if ($emirate->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }

                foreach ($row['neighborhoods'] ?? [] as $n) {
                    if (! is_array($n)) {
                        continue;
                    }

                    $nameEn = trim((string) ($n['name_en'] ?? $n['name'] ?? ''));
                    if ($nameEn === '') {
                        continue;
                    }

                    $source = (string) ($n['source'] ?? $payload['source'] ?? 'dubizzle');
                    $dubizzleId = isset($n['dubizzle_id']) ? (int) $n['dubizzle_id'] : null;

                    $lookup = ['emirate_id' => $emirate->id];
                    if ($dubizzleId) {
                        $lookup['dubizzle_id'] = $dubizzleId;
                    } else {
                        $lookup['name_en'] = $nameEn;
                    }

                    $record = UaeNeighborhood::query()->updateOrCreate(
                        $lookup,
                        [
                            'name_en' => $nameEn,
                            'name_ar' => $n['name_ar'] ?? null,
                            'slug' => $n['slug'] ?? Str::slug($nameEn),
                            'dubizzle_id' => $dubizzleId,
                            'propertyfinder_id' => isset($n['propertyfinder_id']) ? (int) $n['propertyfinder_id'] : null,
                            'level' => isset($n['level']) ? (int) $n['level'] : null,
                            'location_type' => $n['location_type'] ?? null,
                            'latitude' => isset($n['latitude']) ? (float) $n['latitude'] : null,
                            'longitude' => isset($n['longitude']) ? (float) $n['longitude'] : null,
                            'source' => $source,
                        ]
                    );

                    $neighborhoodCount++;
                    if ($record->wasRecentlyCreated) {
                        $created++;
                    } else {
                        $updated++;
                    }
                }
            }
        });

        return [
            'emirates' => UaeEmirate::query()->count(),
            'neighborhoods' => UaeNeighborhood::query()->count(),
            'created' => $created,
            'updated' => $updated,
        ];
    }
}
