<?php

namespace Database\Seeders;

use App\Models\JobSource;
use Illuminate\Database\Seeder;

class CopilotJobSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            [
                'name' => 'Khaleej Jobs Demo (UAE)',
                'source_type' => 'job_board',
                'base_url' => 'https://khaleej.ae/jobs',
                'country' => 'UAE',
                'scrape_config' => ['type' => 'demo'],
                'scraping_enabled' => true,
                'scrape_interval_hours' => 24,
                'status' => 'active',
            ],
            [
                'name' => 'Gulf Careers Demo (SA)',
                'source_type' => 'job_board',
                'base_url' => 'https://example.com/sa-jobs',
                'country' => 'SA',
                'scrape_config' => ['type' => 'demo'],
                'scraping_enabled' => true,
                'scrape_interval_hours' => 24,
                'status' => 'active',
            ],
        ];

        foreach ($sources as $source) {
            JobSource::updateOrCreate(
                ['name' => $source['name']],
                $source
            );
        }
    }
}
