<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\Copilot\JobMatchingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CalculateJobMatchesJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $userId)
    {
    }

    public function handle(JobMatchingService $matcher): void
    {
        $user = User::query()->with('jobSeekerProfile')->find($this->userId);
        if (! $user?->jobSeekerProfile) {
            return;
        }

        try {
            $count = $matcher->recalculateForUser($user);
            Log::info('CalculateJobMatchesJob completed', [
                'user_id' => $this->userId,
                'matches' => $count,
            ]);
        } catch (\Throwable $e) {
            Log::warning('CalculateJobMatchesJob failed', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
