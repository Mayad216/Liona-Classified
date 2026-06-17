<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UaeEmirate;
use Illuminate\Http\JsonResponse;

class UaeLocationController extends Controller
{
    public function index(): JsonResponse
    {
        $emirates = UaeEmirate::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['neighborhoods' => fn ($q) => $q->orderBy('name_en')])
            ->get()
            ->map(fn (UaeEmirate $emirate) => [
                'name' => $emirate->name,
                'slug' => $emirate->slug,
                'dubizzle_city_id' => $emirate->dubizzle_city_id,
                'neighborhoods' => $emirate->neighborhoods->map(fn ($n) => [
                    'name' => $n->name_en,
                    'name_ar' => $n->name_ar,
                    'slug' => $n->slug,
                    'dubizzle_id' => $n->dubizzle_id,
                    'propertyfinder_id' => $n->propertyfinder_id,
                    'source' => $n->source,
                ])->values(),
            ]);

        return response()->json(['data' => $emirates]);
    }
}
