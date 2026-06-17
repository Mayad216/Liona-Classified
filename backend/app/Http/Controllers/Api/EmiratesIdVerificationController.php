<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EmiratesIdVerificationController extends Controller
{
    /** GET /api/v1/me/emirates-id-verification */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'status' => $user->emirates_id_status ?? 'none',
                'verified' => (bool) $user->emirates_id_verified_at,
                'verified_at' => $user->emirates_id_verified_at?->toIso8601String(),
                'emirates_id_last4' => $user->emirates_id_last4,
                'is_verified' => (bool) $user->is_verified,
            ],
        ]);
    }

    /** POST /api/v1/me/emirates-id-verification */
    public function submit(Request $request)
    {
        $data = $request->validate([
            'emirates_id' => ['required', 'string', 'max:20'],
            'full_name' => ['required', 'string', 'max:120'],
            'date_of_birth' => ['required', 'date', 'before:today'],
        ]);

        $digits = preg_replace('/\D/', '', $data['emirates_id']);

        if (! preg_match('/^784\d{12}$/', $digits)) {
            return response()->json([
                'message' => 'Invalid Emirates ID number. Use format 784-YYYY-XXXXXXX-X.',
            ], 422);
        }

        $birthYear = (int) substr($digits, 3, 4);
        $dobYear = (int) Carbon::parse($data['date_of_birth'])->format('Y');

        if ($birthYear !== $dobYear) {
            return response()->json([
                'message' => 'Date of birth does not match the year encoded in your Emirates ID.',
            ], 422);
        }

        $user = $request->user();
        $normalizedName = $this->normalizeName($data['full_name']);
        $accountName = $this->normalizeName($user->name);

        if ($normalizedName !== $accountName && ! str_contains($normalizedName, $accountName) && ! str_contains($accountName, $normalizedName)) {
            return response()->json([
                'message' => 'Name on the Emirates ID must match your account name.',
            ], 422);
        }

        $user->update([
            'emirates_id_last4' => substr($digits, -4),
            'emirates_id_verified_at' => now(),
            'emirates_id_status' => 'verified',
            'is_verified' => true,
        ]);

        return response()->json([
            'data' => [
                'status' => 'verified',
                'verified' => true,
                'verified_at' => $user->emirates_id_verified_at?->toIso8601String(),
                'emirates_id_last4' => $user->emirates_id_last4,
                'is_verified' => true,
            ],
            'message' => 'Emirates ID verified. You can now use Match Me.',
        ]);
    }

    protected function normalizeName(string $name): string
    {
        $name = mb_strtolower(trim($name));
        $name = preg_replace('/\s+/', ' ', $name);

        return $name ?? '';
    }
}
