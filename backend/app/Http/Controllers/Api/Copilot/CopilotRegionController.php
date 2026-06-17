<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;

class CopilotRegionController extends Controller
{
    /** GET /api/v1/copilot/countries */
    public function countries()
    {
        $countries = collect(config('copilot.countries', []))->map(function ($meta, $code) {
            return [
                'code' => $code,
                'name' => $meta['name'] ?? $code,
                'currency' => $meta['currency'] ?? 'AED',
                'cities' => $meta['cities'] ?? [],
            ];
        })->values();

        return response()->json(['data' => $countries]);
    }
}
