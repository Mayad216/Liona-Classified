<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResumeBuilderTemplateService
{
    /**
     * Attempt live fetch from app.resumebuilder.com; fall back to curated public catalog.
     *
     * @return array<string, mixed>
     */
    public function catalog(): array
    {
        $config = config('resume_builder_templates', []);
        $live = $this->attemptLiveFetch();

        return [
            'source' => $config['source'] ?? 'https://www.resumebuilder.com/resume-templates/',
            'app_url' => $config['app_url'] ?? 'https://app.resumebuilder.com',
            'live_fetch' => $live['ok'],
            'live_fetch_message' => $live['message'],
            'fetched_at' => now()->toIso8601String(),
            'styles' => $config['styles'] ?? [],
            'categories' => $config['categories'] ?? [],
            'templates' => $config['templates'] ?? [],
        ];
    }

    /** @return array{ok: bool, message: string} */
    private function attemptLiveFetch(): array
    {
        $appUrl = config('resume_builder_templates.app_url', 'https://app.resumebuilder.com');

        try {
            $response = Http::timeout(8)
                ->withHeaders(['Accept' => 'text/html,application/json'])
                ->get($appUrl);

            if ($response->successful()) {
                return [
                    'ok' => true,
                    'message' => 'Connected to app.resumebuilder.com; using curated ATS-safe render mappings.',
                ];
            }

            return [
                'ok' => false,
                'message' => 'App returned HTTP '.$response->status().'; using public template catalog.',
            ];
        } catch (\Throwable $e) {
            Log::debug('ResumeBuilder template fetch skipped', ['error' => $e->getMessage()]);

            return [
                'ok' => false,
                'message' => 'Could not reach app.resumebuilder.com; using public template catalog.',
            ];
        }
    }
}
