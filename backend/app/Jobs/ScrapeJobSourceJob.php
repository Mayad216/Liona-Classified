<?php

namespace App\Jobs;

use App\Models\JobSource;
use App\Services\Copilot\JobScraperService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ScrapeJobSourceJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $jobSourceId)
    {
    }

    public function handle(JobScraperService $scraper): void
    {
        $source = JobSource::query()->find($this->jobSourceId);
        if ($source) {
            $scraper->scrapeSource($source);
        }
    }
}
