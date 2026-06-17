<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ScrapeJobSourceJob;
use App\Models\CopilotJob;
use App\Models\CopilotScrapeRun;
use App\Models\JobSource;
use Illuminate\Http\Request;

class CopilotJobAdminController extends Controller
{
    /** GET /api/v1/admin/copilot/job-sources */
    public function jobSources()
    {
        return response()->json(['data' => JobSource::query()->latest()->get()]);
    }

    /** POST /api/v1/admin/copilot/job-sources */
    public function storeJobSource(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'source_type' => ['required', 'in:job_board,company_career_page,ats,manual'],
            'base_url' => ['nullable', 'url'],
            'country' => ['nullable', 'string', 'max:64'],
            'scrape_config' => ['nullable', 'array'],
            'scrape_interval_hours' => ['nullable', 'integer', 'min:1', 'max:168'],
            'scraping_enabled' => ['boolean'],
            'status' => ['nullable', 'in:active,paused,failed'],
        ]);

        $source = JobSource::create($data);

        return response()->json(['data' => $source], 201);
    }

    /** POST /api/v1/admin/copilot/jobs/import */
    public function importJobs(Request $request)
    {
        $validated = $request->validate([
            'job_source_id' => ['nullable', 'exists:job_sources,id'],
            'jobs' => ['required', 'array', 'min:1'],
            'jobs.*.company_name' => ['required', 'string', 'max:160'],
            'jobs.*.title' => ['required', 'string', 'max:160'],
            'jobs.*.description' => ['required', 'string'],
            'jobs.*.requirements' => ['nullable', 'string'],
            'jobs.*.location' => ['nullable', 'string'],
            'jobs.*.country' => ['nullable', 'string', 'max:64'],
            'jobs.*.remote_type' => ['nullable', 'in:remote,hybrid,onsite,unknown'],
            'jobs.*.employment_type' => ['nullable', 'string'],
            'jobs.*.salary_min' => ['nullable', 'integer'],
            'jobs.*.salary_max' => ['nullable', 'integer'],
            'jobs.*.application_url' => ['nullable', 'url'],
            'jobs.*.source_url' => ['nullable', 'url'],
            'jobs.*.external_job_id' => ['nullable', 'string'],
        ]);

        $created = [];
        foreach ($validated['jobs'] as $row) {
            $created[] = CopilotJob::create([
                ...$row,
                'job_source_id' => $validated['job_source_id'] ?? null,
                'status' => 'active',
                'posted_at' => now(),
            ]);
        }

        return response()->json([
            'message' => count($created).' jobs imported.',
            'data' => $created,
        ], 201);
    }

    /** GET /api/v1/admin/copilot/jobs */
    public function indexJobs(Request $request)
    {
        $jobs = CopilotJob::query()
            ->with('source:id,name')
            ->latest()
            ->paginate(30);

        return response()->json($jobs);
    }

    /** PATCH /api/v1/admin/copilot/job-sources/{jobSource} */
    public function updateJobSource(Request $request, JobSource $jobSource)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'base_url' => ['nullable', 'url'],
            'country' => ['sometimes', 'string', 'max:64'],
            'scrape_config' => ['nullable', 'array'],
            'scrape_interval_hours' => ['sometimes', 'integer', 'min:1', 'max:168'],
            'scraping_enabled' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:active,paused,failed'],
        ]);

        $jobSource->update($data);

        return response()->json(['data' => $jobSource->fresh()]);
    }

    /** POST /api/v1/admin/copilot/job-sources/{jobSource}/scrape */
    public function scrapeJobSource(Request $request, JobSource $jobSource)
    {
        if ($request->boolean('sync')) {
            $result = app(\App\Services\Copilot\JobScraperService::class)->scrapeSource($jobSource);

            return response()->json([
                'message' => $result['ok'] ? 'Scrape completed.' : ($result['message'] ?? 'Scrape failed.'),
                'data' => $result['run'] ?? null,
            ], $result['ok'] ? 200 : 422);
        }

        ScrapeJobSourceJob::dispatch($jobSource->id);

        return response()->json(['message' => 'Scrape queued.']);
    }

    /** GET /api/v1/admin/copilot/scrape-runs */
    public function scrapeRuns()
    {
        $runs = CopilotScrapeRun::query()
            ->with('source:id,name,country')
            ->latest('started_at')
            ->paginate(30);

        return response()->json($runs);
    }
}
