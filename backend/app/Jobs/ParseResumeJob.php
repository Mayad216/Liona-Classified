<?php

namespace App\Jobs;

use App\Jobs\CalculateJobMatchesJob;
use App\Models\Resume;
use App\Services\Copilot\ResumeParserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ParseResumeJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public function __construct(public int $resumeId)
    {
    }

    public function handle(ResumeParserService $parser): void
    {
        $resume = Resume::query()->find($this->resumeId);
        if (! $resume) {
            return;
        }

        try {
            $parser->parse($resume);
            if ($resume->user_id) {
                CalculateJobMatchesJob::dispatch($resume->user_id);
            }
        } catch (\Throwable $e) {
            Log::warning('ParseResumeJob failed', [
                'resume_id' => $this->resumeId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
