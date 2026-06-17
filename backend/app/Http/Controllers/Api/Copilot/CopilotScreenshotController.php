<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Models\CopilotApplication;
use App\Services\Copilot\AutoApplyService;
use App\Services\Copilot\ScreenshotStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CopilotScreenshotController extends Controller
{
    /** GET /api/v1/copilot/auto-apply/applications/{copilotApplication}/screenshots/{encodedPath} */
    public function showForApplication(Request $request, CopilotApplication $copilotApplication, string $encodedPath)
    {
        abort_unless($copilotApplication->user_id === $request->user()->id, 403);

        $path = base64_decode($encodedPath, true);
        abort_unless(is_string($path) && str_starts_with($path, "copilot/screenshots/{$copilotApplication->id}/"), 404);

        $disk = config('copilot.auto_apply.screenshot_disk', 'local');
        abort_unless(Storage::disk($disk)->exists($path), 404);

        return Storage::disk($disk)->response($path, headers: [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
