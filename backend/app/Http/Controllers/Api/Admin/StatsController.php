<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Listing;
use App\Models\Service;
use App\Models\User;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'users_total' => User::count(),
            'users_verified' => User::where('is_verified', true)->count(),
            'listings_total' => Listing::count(),
            'listings_pending' => Listing::where('status', 'pending')->count(),
            'jobs_total' => Job::count(),
            'services_total' => Service::count(),
        ]);
    }
}
