<?php

namespace App\Jobs;

use App\Models\CopilotApplication;
use App\Services\Copilot\AutoApplyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class RunAutoApplyJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public function __construct(public int $applicationId)
    {
    }

    public function handle(AutoApplyService $autoApply): void
    {
        $application = CopilotApplication::query()->find($this->applicationId);
        if (! $application || $application->isTerminal()) {
            return;
        }

        try {
            $autoApply->execute($application);
        } catch (\Throwable $e) {
            Log::warning('RunAutoApplyJob failed', [
                'application_id' => $this->applicationId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
