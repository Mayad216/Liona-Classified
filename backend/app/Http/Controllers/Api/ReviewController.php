<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'reviewee_id' => ['required', 'exists:users,id'],
            'listing_id' => ['nullable', 'exists:listings,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $review = Review::create([
            'reviewer_id' => $request->user()->id,
            ...$data,
        ]);

        return response()->json(['data' => $review], 201);
    }
}
