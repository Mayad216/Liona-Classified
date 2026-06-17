<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $q = Service::query()->with('provider:id,name,avatar,is_verified');

        if ($category = $request->string('category')->toString()) {
            $q->where('category', $category);
        }
        if ($emirate = $request->string('emirate')->toString()) {
            $q->where('emirate', $emirate);
        }
        if ($search = $request->string('q')->toString()) {
            $q->where('title', 'like', "%{$search}%");
        }

        return $q->orderByDesc('rating')->paginate(24);
    }

    public function show(Service $service)
    {
        return response()->json([
            'data' => $service->load('provider:id,name,avatar,is_verified,rating'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string'],
            'category' => ['required', 'string'],
            'price_from' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string'],
            'emirate' => ['required', 'string'],
            'photos' => ['array'],
            'response_time' => ['nullable', 'string'],
        ]);

        $service = $request->user()->services()->create($data);

        return response()->json(['data' => $service], 201);
    }

    public function book(Request $request, Service $service)
    {
        $data = $request->validate([
            'scheduled_for' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $booking = $service->bookings()->create([
            'customer_id' => $request->user()->id,
            'scheduled_for' => $data['scheduled_for'],
            'notes' => $data['notes'] ?? null,
            'status' => 'confirmed',
        ]);

        return response()->json(['data' => $booking], 201);
    }
}
