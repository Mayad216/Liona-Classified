<?php

namespace App\Services\Copilot;

use App\Models\CopilotApplication;
use App\Models\CopilotApplication;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ScreenshotStorageService
{
    public function disk(): string
    {
        return config('copilot.auto_apply.screenshot_disk', 'local');
    }

    public function storeBase64(CopilotApplication $application, string $base64, string $step = 'screenshot'): string
    {
        $data = $base64;
        if (str_contains($base64, ',')) {
            $data = explode(',', $base64, 2)[1];
        }

        $binary = base64_decode($data, true);
        if ($binary === false) {
            throw new \InvalidArgumentException('Invalid screenshot payload.');
        }

        $path = sprintf(
            'copilot/screenshots/%d/%s-%s.png',
            $application->id,
            $step,
            Str::uuid()
        );

        Storage::disk($this->disk())->put($path, $binary);

        return $path;
    }

    public function url(?string $path, ?CopilotApplication $application = null): ?string
    {
        if (! $path || ! $application) {
            return null;
        }

        return url("/api/v1/copilot/auto-apply/applications/{$application->id}/screenshots/".base64_encode($path));
    }
}
