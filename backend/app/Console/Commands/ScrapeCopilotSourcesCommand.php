<?php

namespace App\Console\Commands;

use App\Services\Copilot\JobScraperService;
use Illuminate\Console\Command;

class ScrapeCopilotSourcesCommand extends Command
{
    protected $signature = 'copilot:scrape-sources {--source= : Scrape a single job source ID}';

    protected $description = 'Scrape enabled Jobs Copilot job sources';

    public function handle(JobScraperService $scraper): int
    {
        if ($id = $this->option('source')) {
            $source = \App\Models\JobSource::query()->find($id);
            if (! $source) {
                $this->error('Job source not found.');

                return self::FAILURE;
            }
            $result = $scraper->scrapeSource($source);
            $this->info($result['ok'] ? 'Scrape completed.' : ($result['message'] ?? 'Scrape failed.'));

            return $result['ok'] ? self::SUCCESS : self::FAILURE;
        }

        $count = $scraper->scrapeDueSources();
        $this->info("Scraped {$count} due source(s).");

        return self::SUCCESS;
    }
}
