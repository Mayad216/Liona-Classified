<?php

namespace App\Services\Copilot;

use App\Models\User;
use App\Models\UserUsageLimit;

class UsageLimitService
{
    public function currentRecord(User $user): UserUsageLimit
    {
        $now = now();

        $record = UserUsageLimit::firstOrCreate(
            [
                'user_id' => $user->id,
                'month' => (int) $now->format('n'),
                'year' => (int) $now->format('Y'),
            ],
            [
                'job_recommendations_used' => 0,
                'ai_credits_used' => 0,
                'auto_applications_used' => 0,
                'auto_applications_today' => 0,
                'auto_applications_day' => $now->toDateString(),
            ]
        );

        return $this->resetDailyAutoCounterIfNeeded($record);
    }

    private function resetDailyAutoCounterIfNeeded(UserUsageLimit $record): UserUsageLimit
    {
        $today = now()->toDateString();
        if ($record->auto_applications_day?->toDateString() !== $today) {
            $record->update([
                'auto_applications_today' => 0,
                'auto_applications_day' => $today,
            ]);
        }

        return $record->fresh();
    }

    public function monthlyAiLimit(User $user): int
    {
        $planLimit = (int) ($user->copilotPlanConfig()['ai_credits_monthly'] ?? 10);

        return $planLimit + (int) $user->copilot_ai_credit_balance;
    }

    public function remainingAiCredits(User $user): int
    {
        $limit = $this->monthlyAiLimit($user);
        $used = $this->currentRecord($user)->ai_credits_used;

        return max(0, $limit - $used);
    }

    public function canUseAiCredits(User $user, int $cost = 1): bool
    {
        return $this->remainingAiCredits($user) >= $cost;
    }

    public function consumeAiCredits(User $user, int $cost = 1): UserUsageLimit
    {
        $record = $this->currentRecord($user);
        $record->increment('ai_credits_used', $cost);

        return $record->fresh();
    }

    public function monthlyAutoLimit(User $user): int
    {
        $planLimit = (int) ($user->copilotPlanConfig()['monthly_auto_applications'] ?? 0);

        return $planLimit + (int) $user->copilot_auto_credit_balance;
    }

    public function dailyAutoLimit(User $user): int
    {
        return (int) ($user->copilotPlanConfig()['daily_auto_applications'] ?? 0);
    }

    public function remainingAutoApplications(User $user): int
    {
        $record = $this->currentRecord($user);
        $monthlyRemaining = max(0, $this->monthlyAutoLimit($user) - $record->auto_applications_used);
        $dailyLimit = $this->dailyAutoLimit($user);
        $dailyRemaining = $dailyLimit > 0
            ? max(0, $dailyLimit - $record->auto_applications_today)
            : $monthlyRemaining;

        return min($monthlyRemaining, $dailyRemaining);
    }

    public function canUseAutoApply(User $user): bool
    {
        if (! $user->isPremium()) {
            return false;
        }

        $config = $user->copilotPlanConfig();

        return (bool) ($config['auto_apply'] ?? false);
    }

    public function hasRemainingApplicationCredits(User $user): bool
    {
        return $this->canUseAutoApply($user) && $this->remainingAutoApplications($user) > 0;
    }

    public function consumeAutoApplication(User $user): UserUsageLimit
    {
        $record = $this->currentRecord($user);
        $record->increment('auto_applications_used');
        $record->increment('auto_applications_today');

        return $record->fresh();
    }

    public function aiUsageSummary(User $user): array
    {
        $record = $this->currentRecord($user);
        $limit = $this->monthlyAiLimit($user);

        return [
            'ai_credits_used' => $record->ai_credits_used,
            'ai_credits_limit' => $limit,
            'ai_credits_remaining' => max(0, $limit - $record->ai_credits_used),
            'month' => $record->month,
            'year' => $record->year,
        ];
    }

    public function autoUsageSummary(User $user): array
    {
        $record = $this->currentRecord($user);

        return [
            'auto_applications_used' => $record->auto_applications_used,
            'auto_applications_today' => $record->auto_applications_today,
            'monthly_limit' => $this->monthlyAutoLimit($user),
            'daily_limit' => $this->dailyAutoLimit($user),
            'remaining' => $this->remainingAutoApplications($user),
            'can_auto_apply' => $this->canUseAutoApply($user),
        ];
    }

    public function fullUsageSummary(User $user): array
    {
        return [
            'ai' => $this->aiUsageSummary($user),
            'auto_apply' => $this->autoUsageSummary($user),
        ];
    }
}
