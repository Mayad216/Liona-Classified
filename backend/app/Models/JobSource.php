<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobSource extends Model
{
    protected $fillable = [
        'name',
        'source_type',
        'base_url',
        'country',
        'scrape_config',
        'scrape_interval_hours',
        'scraping_enabled',
        'last_scraped_at',
        'last_scrape_status',
        'last_scrape_error',
        'jobs_imported_total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'scraping_enabled' => 'boolean',
            'last_scraped_at' => 'datetime',
            'scrape_config' => 'array',
            'jobs_imported_total' => 'integer',
        ];
    }

    public function scrapeRuns()
    {
        return $this->hasMany(CopilotScrapeRun::class);
    }

    public function copilotJobs(): HasMany
    {
        return $this->hasMany(CopilotJob::class);
    }
}
