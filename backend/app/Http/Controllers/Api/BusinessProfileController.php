<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use Illuminate\Http\Request;

class BusinessProfileController extends Controller
{
    /** GET /api/v1/me/business-profile */
    public function show(Request $request)
    {
        $profile = $request->user()->businessProfile;

        return response()->json([
            'data' => $profile ? $this->serialize($profile) : null,
        ]);
    }

    /** PUT /api/v1/me/business-profile */
    public function upsert(Request $request)
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:160'],
            'legal_name' => ['nullable', 'string', 'max:160'],
            'trade_licence_number' => ['nullable', 'string', 'max:80'],
            'industry' => ['required', 'string', 'max:120'],
            'emirate' => ['required', 'string', 'max:64'],
            'website' => ['nullable', 'url', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:32'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        $profile = BusinessProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                ...$data,
                'contact_email' => $data['contact_email'] ?? $user->email,
                'contact_phone' => $data['contact_phone'] ?? $user->phone,
            ]
        );

        if (in_array($user->role, ['seeker', 'service_provider', 'lister'], true)) {
            $user->update(['role' => 'employer']);
        }

        return response()->json(['data' => $this->serialize($profile->fresh())]);
    }

    /** @return array<string, mixed> */
    protected function serialize(BusinessProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'company_name' => $profile->company_name,
            'legal_name' => $profile->legal_name,
            'trade_licence_number' => $profile->trade_licence_number,
            'industry' => $profile->industry,
            'emirate' => $profile->emirate,
            'website' => $profile->website,
            'contact_email' => $profile->contact_email,
            'contact_phone' => $profile->contact_phone,
            'description' => $profile->description,
            'is_verified' => $profile->is_verified,
            'is_complete' => $profile->isComplete(),
            'updated_at' => $profile->updated_at,
        ];
    }
}
