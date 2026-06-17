<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;

class ListingModerationController extends Controller
{
    public function approve(Listing $listing)
    {
        $listing->update(['status' => 'active', 'is_published' => true]);

        return response()->json(['data' => $listing]);
    }

    public function reject(Listing $listing)
    {
        $listing->update(['status' => 'rejected', 'is_published' => false]);

        return response()->json(['data' => $listing]);
    }
}
