<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $q = Listing::published()->with('host:id,name,avatar,is_verified,rating');

        if ($emirate = $request->string('emirate')->toString()) {
            $q->where('emirate', $emirate);
        }
        if ($roomType = $request->string('room_type')->toString()) {
            $q->where('room_type', $roomType);
        }
        if ($gender = $request->string('gender')->toString()) {
            $q->where('gender_preference', $gender);
        }
        if ($min = $request->integer('min_price')) {
            $q->where('price', '>=', $min);
        }
        if ($max = $request->integer('max_price')) {
            $q->where('price', '<=', $max);
        }
        if ($search = $request->string('q')->toString()) {
            $q->where(fn ($w) => $w
                ->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('area', 'like', "%{$search}%"));
        }

        $sort = $request->string('sort', 'recommended')->toString();
        match ($sort) {
            'price_asc' => $q->orderBy('price'),
            'price_desc' => $q->orderByDesc('price'),
            'newest' => $q->latest(),
            default => $q->orderByDesc('is_featured')->latest(),
        };

        return $q->paginate(24);
    }

    public function show(Listing $listing)
    {
        return response()->json([
            'data' => $listing->load('host:id,name,avatar,is_verified,rating,bio,created_at'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string'],
            'emirate' => ['required', 'string'],
            'area' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'room_type' => ['required', 'string'],
            'size_sqft' => ['nullable', 'integer'],
            'tenants_count' => ['required', 'integer', 'min:1'],
            'attached_bathroom' => ['boolean'],
            'balcony' => ['boolean'],
            'distance_to_metro_km' => ['nullable', 'numeric'],
            'gender_preference' => ['required', 'string'],
            'nationality_preference' => ['nullable', 'string'],
            'listed_by' => ['required', 'string'],
            'amenities' => ['array'],
            'photos' => ['array'],
        ]);

        $listing = $request->user()->listings()->create([
            ...$data,
            'is_published' => false,
            'status' => 'pending',
        ]);

        return response()->json(['data' => $listing], 201);
    }

    public function update(Request $request, Listing $listing)
    {
        abort_unless($listing->host_id === $request->user()->id, 403);
        $listing->update($request->all());

        return response()->json(['data' => $listing]);
    }

    public function destroy(Request $request, Listing $listing)
    {
        abort_unless($listing->host_id === $request->user()->id, 403);
        $listing->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function favorite(Request $request, Listing $listing)
    {
        $request->user()->favorites()->toggle($listing->id);

        return response()->json(['message' => 'Toggled']);
    }
}
