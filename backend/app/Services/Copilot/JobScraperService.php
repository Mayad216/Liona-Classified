<?php

namespace App\Services\Copilot;

use App\Models\CopilotJob;
use App\Models\CopilotScrapeRun;
use App\Models\JobSource;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class JobScraperService
{
    /**
     * @return array{ok: bool, run?: CopilotScrapeRun, message?: string}
     */
    public function scrapeSource(JobSource $source): array
    {
        if (! $source->scraping_enabled || $source->status !== 'active') {
            return ['ok' => false, 'message' => 'Source is not active for scraping.'];
        }

        $run = CopilotScrapeRun::create([
            'job_source_id' => $source->id,
            'status' => 'running',
            'started_at' => now(),
        ]);

        try {
            $rows = $this->fetchJobs($source);
            $imported = 0;
            $updated = 0;
            $skipped = 0;

            foreach ($rows as $row) {
                $externalId = $row['external_job_id'] ?? md5(($row['title'] ?? '').($row['source_url'] ?? ''));
                if (! $externalId) {
                    $skipped++;

                    continue;
                }

                $payload = [
                    'job_source_id' => $source->id,
                    'external_job_id' => $externalId,
                    'company_name' => $row['company_name'] ?? 'Unknown',
                    'title' => $row['title'] ?? 'Untitled role',
                    'description' => $row['description'] ?? '',
                    'requirements' => $row['requirements'] ?? null,
                    'location' => $row['location'] ?? null,
                    'country' => $row['country'] ?? $source->country ?? 'UAE',
                    'remote_type' => $row['remote_type'] ?? 'unknown',
                    'employment_type' => $row['employment_type'] ?? 'unknown',
                    'salary_min' => $row['salary_min'] ?? null,
                    'salary_max' => $row['salary_max'] ?? null,
                    'currency' => $row['currency'] ?? config('copilot.countries.'.($source->country ?? 'UAE').'.currency', 'AED'),
                    'application_url' => $row['application_url'] ?? null,
                    'source_url' => $row['source_url'] ?? null,
                    'posted_at' => $row['posted_at'] ?? now(),
                    'status' => 'active',
                    'raw_data' => $row,
                ];

                $existing = CopilotJob::query()
                    ->where('job_source_id', $source->id)
                    ->where('external_job_id', $externalId)
                    ->first();

                if ($existing) {
                    $existing->update($payload);
                    $updated++;
                } else {
                    CopilotJob::create($payload);
                    $imported++;
                }
            }

            $run->update([
                'status' => 'completed',
                'jobs_found' => count($rows),
                'jobs_imported' => $imported,
                'jobs_updated' => $updated,
                'jobs_skipped' => $skipped,
                'finished_at' => now(),
            ]);

            $source->update([
                'last_scraped_at' => now(),
                'last_scrape_status' => 'completed',
                'last_scrape_error' => null,
                'jobs_imported_total' => (int) $source->jobs_imported_total + $imported,
            ]);

            return ['ok' => true, 'run' => $run->fresh()];
        } catch (\Throwable $e) {
            $run->update([
                'status' => 'failed',
                'error_message' => Str::limit($e->getMessage(), 2000),
                'finished_at' => now(),
            ]);

            $source->update([
                'last_scrape_status' => 'failed',
                'last_scrape_error' => Str::limit($e->getMessage(), 2000),
            ]);

            return ['ok' => false, 'run' => $run->fresh(), 'message' => $e->getMessage()];
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fetchJobs(JobSource $source): array
    {
        $config = $source->scrape_config ?? [];
        $type = $config['type'] ?? 'demo';

        return match ($type) {
            'json' => $this->fetchJson($source),
            'rss' => $this->fetchRss($source),
            default => $this->fetchDemo($source),
        };
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fetchJson(JobSource $source): array
    {
        $url = $source->base_url;
        if (! $url) {
            throw new \RuntimeException('JSON source missing base_url.');
        }

        $response = Http::withHeaders([
            'User-Agent' => config('copilot.scraping.user_agent'),
        ])->timeout(30)->get($url);

        if (! $response->successful()) {
            throw new \RuntimeException('JSON fetch failed: '.$response->status());
        }

        $data = $response->json();
        $jobs = $data['jobs'] ?? $data['data'] ?? $data;

        return is_array($jobs) ? array_values($jobs) : [];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fetchRss(JobSource $source): array
    {
        $url = $source->base_url;
        if (! $url) {
            throw new \RuntimeException('RSS source missing base_url.');
        }

        $response = Http::withHeaders([
            'User-Agent' => config('copilot.scraping.user_agent'),
        ])->timeout(30)->get($url);

        if (! $response->successful()) {
            throw new \RuntimeException('RSS fetch failed: '.$response->status());
        }

        $xml = @simplexml_load_string($response->body());
        if ($xml === false) {
            throw new \RuntimeException('Invalid RSS XML.');
        }

        $items = [];
        foreach ($xml->channel->item ?? [] as $item) {
            $items[] = [
                'external_job_id' => (string) ($item->guid ?? $item->link ?? md5((string) $item->title)),
                'title' => (string) $item->title,
                'company_name' => (string) ($item->author ?? $source->name),
                'description' => strip_tags((string) ($item->description ?? '')),
                'source_url' => (string) ($item->link ?? ''),
                'application_url' => (string) ($item->link ?? ''),
                'location' => (string) ($item->location ?? $source->country),
                'country' => $source->country,
                'posted_at' => isset($item->pubDate) ? date('Y-m-d H:i:s', strtotime((string) $item->pubDate)) : now(),
            ];
        }

        return $items;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fetchDemo(JobSource $source): array
    {
        $country = $source->country ?? 'UAE';
        $currency = config('copilot.countries.'.$country.'.currency', 'AED');

        return [
            [
                'external_job_id' => 'demo-'.$source->id.'-1',
                'company_name' => $source->name.' Partner',
                'title' => 'Senior Software Engineer',
                'description' => 'Build scalable products for the '.$country.' market. PHP, React, cloud experience required.',
                'requirements' => '5+ years experience, team leadership',
                'location' => $country === 'UAE' ? 'Dubai' : 'Capital City',
                'country' => $country,
                'remote_type' => 'hybrid',
                'employment_type' => 'full_time',
                'salary_min' => 25000,
                'salary_max' => 35000,
                'currency' => $currency,
                'application_url' => $source->base_url,
                'source_url' => $source->base_url,
            ],
            [
                'external_job_id' => 'demo-'.$source->id.'-2',
                'company_name' => $source->name.' Partner',
                'title' => 'Product Manager',
                'description' => 'Own roadmap for B2B SaaS hiring tools across '.$country.'.',
                'location' => $country === 'UAE' ? 'Abu Dhabi' : 'Metro',
                'country' => $country,
                'remote_type' => 'onsite',
                'employment_type' => 'full_time',
                'salary_min' => 30000,
                'salary_max' => 45000,
                'currency' => $currency,
                'application_url' => $source->base_url,
                'source_url' => $source->base_url,
            ],
        ];
    }

    public function scrapeDueSources(): int
    {
        $count = 0;
        JobSource::query()
            ->where('scraping_enabled', true)
            ->where('status', 'active')
            ->each(function (JobSource $source) use (&$count) {
                $due = ! $source->last_scraped_at
                    || $source->last_scraped_at->lte(now()->subHours($source->scrape_interval_hours ?? 24));

                if ($due && $this->scrapeSource($source)['ok']) {
                    $count++;
                }
            });

        return $count;
    }
}
