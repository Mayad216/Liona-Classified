<?php

namespace App\Services\Copilot;

use App\Models\CopilotApplication;
use App\Models\CopilotEmbedding;
use App\Models\CopilotJob;
use App\Models\CopilotScrapeRun;
use App\Models\JobMatch;
use App\Models\JobSource;
use App\Models\User;
use App\Models\UserUsageLimit;

class CopilotMonitoringService
{
    public function dashboard(): array
    {
        $jobsByCountry = CopilotJob::query()
            ->selectRaw('country, count(*) as total')
            ->where('status', 'active')
            ->groupBy('country')
            ->pluck('total', 'country');

        $recentRuns = CopilotScrapeRun::query()
            ->with('source:id,name,country')
            ->latest('started_at')
            ->limit(10)
            ->get()
            ->map(fn (CopilotScrapeRun $run) => [
                'id' => $run->id,
                'source' => $run->source?->name,
                'country' => $run->source?->country,
                'status' => $run->status,
                'jobs_found' => $run->jobs_found,
                'jobs_imported' => $run->jobs_imported,
                'jobs_updated' => $run->jobs_updated,
                'error_message' => $run->error_message,
                'started_at' => $run->started_at?->toIso8601String(),
                'finished_at' => $run->finished_at?->toIso8601String(),
            ]);

        $totalJobs = (int) CopilotJob::where('status', 'active')->count();
        $embeddedJobs = (int) CopilotEmbedding::query()
            ->where('embeddable_type', (new CopilotJob)->getMorphClass())
            ->count();

        return [
            'totals' => [
                'copilot_jobs' => $totalJobs,
                'job_sources' => JobSource::count(),
                'active_sources' => JobSource::where('status', 'active')->where('scraping_enabled', true)->count(),
                'premium_users' => User::query()->where('plan', '!=', 'free')->whereIn('subscription_status', ['active', 'trialing'])->count(),
                'applications_24h' => CopilotApplication::where('created_at', '>=', now()->subDay())->count(),
                'matches_total' => JobMatch::count(),
                'embedding_coverage_pct' => $totalJobs > 0 ? round(($embeddedJobs / $totalJobs) * 100, 1) : 0,
            ],
            'jobs_by_country' => $jobsByCountry,
            'ai_usage_today' => (int) UserUsageLimit::query()
                ->where('auto_applications_day', now()->toDateString())
                ->sum('auto_applications_today'),
            'recent_scrape_runs' => $recentRuns,
            'sources' => JobSource::query()->latest()->limit(20)->get(),
        ];
    }
}
