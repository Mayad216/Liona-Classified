<?php

namespace App\Services\Copilot;

use App\Mail\CopilotDailyDigestMail;
use App\Models\CopilotApplication;
use App\Models\CopilotAutomationSetting;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

class CopilotDailyDigestService
{
    public function settingsFor(User $user): CopilotAutomationSetting
    {
        return CopilotAutomationSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'daily_digest_enabled' => true,
                'daily_digest_hour' => (int) config('copilot.daily_digest.default_hour', 8),
            ]
        );
    }

    public function updateSettings(User $user, array $data): CopilotAutomationSetting
    {
        $settings = $this->settingsFor($user);
        $settings->update([
            'daily_digest_enabled' => $data['daily_digest_enabled'] ?? $settings->daily_digest_enabled,
            'daily_digest_hour' => $data['daily_digest_hour'] ?? $settings->daily_digest_hour,
        ]);

        return $settings->fresh();
    }

    /**
     * @return array{submitted: int, needs_review: int, failed: int, auto_used: int, remaining: int, recent: Collection}
     */
    public function compileDigest(User $user): array
    {
        $since = now()->subDay();
        $apps = CopilotApplication::query()
            ->with(['jobMatch.matchable'])
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $since)
            ->latest()
            ->get();

        $usage = app(UsageLimitService::class)->autoUsageSummary($user);

        return [
            'submitted' => $apps->where('status', 'submitted')->count(),
            'needs_review' => $apps->where('status', 'needs_review')->count(),
            'failed' => $apps->where('status', 'failed')->count(),
            'auto_used' => $usage['auto_applications_used'],
            'remaining' => $usage['remaining'],
            'recent' => $apps->take(5),
        ];
    }

    public function sendDigest(User $user): bool
    {
        $settings = $this->settingsFor($user);
        if (! $settings->daily_digest_enabled) {
            return false;
        }

        $digest = $this->compileDigest($user);
        if ($digest['submitted'] + $digest['needs_review'] + $digest['failed'] === 0) {
            return false;
        }

        Mail::to($user->email)->send(new CopilotDailyDigestMail($user, $digest));

        $settings->update(['last_digest_at' => now()]);

        return true;
    }

    public function sendDueDigests(): int
    {
        if (! config('copilot.daily_digest.enabled', true)) {
            return 0;
        }

        $hour = (int) now()->format('G');
        $sent = 0;

        User::query()
            ->where('plan', '!=', 'free')
            ->whereIn('subscription_status', ['active', 'trialing'])
            ->chunkById(100, function ($users) use ($hour, &$sent) {
                foreach ($users as $user) {
                    $settings = $this->settingsFor($user);
                    if (! $settings->daily_digest_enabled) {
                        continue;
                    }
                    if ((int) $settings->daily_digest_hour !== $hour) {
                        continue;
                    }
                    if ($settings->last_digest_at?->isToday()) {
                        continue;
                    }
                    if ($this->sendDigest($user)) {
                        $sent++;
                    }
                }
            });

        return $sent;
    }
}
