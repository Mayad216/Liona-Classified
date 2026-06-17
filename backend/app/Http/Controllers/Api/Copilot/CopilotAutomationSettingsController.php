<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Services\Copilot\CopilotDailyDigestService;
use Illuminate\Http\Request;

class CopilotAutomationSettingsController extends Controller
{
    public function __construct(protected CopilotDailyDigestService $digest)
    {
    }

    /** GET /api/v1/copilot/automation/settings */
    public function show(Request $request)
    {
        $settings = $this->digest->settingsFor($request->user());

        return response()->json([
            'data' => [
                'daily_digest_enabled' => $settings->daily_digest_enabled,
                'daily_digest_hour' => $settings->daily_digest_hour,
                'last_digest_at' => $settings->last_digest_at?->toIso8601String(),
            ],
        ]);
    }

    /** PUT /api/v1/copilot/automation/settings */
    public function update(Request $request)
    {
        $data = $request->validate([
            'daily_digest_enabled' => 'sometimes|boolean',
            'daily_digest_hour' => 'sometimes|integer|min:0|max:23',
        ]);

        $settings = $this->digest->updateSettings($request->user(), $data);

        return response()->json([
            'message' => 'Automation settings updated.',
            'data' => [
                'daily_digest_enabled' => $settings->daily_digest_enabled,
                'daily_digest_hour' => $settings->daily_digest_hour,
                'last_digest_at' => $settings->last_digest_at?->toIso8601String(),
            ],
        ]);
    }

    /** GET /api/v1/copilot/automation/digest/preview */
    public function digestPreview(Request $request)
    {
        $digest = $this->digest->compileDigest($request->user());

        return response()->json(['data' => $digest]);
    }
}
