<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResumeScreeningQuestionService
{
    /**
     * @return array<string, mixed>
     */
    public function catalog(): array
    {
        $config = config('resume_builder_screening', []);
        $platformChecks = [
            'jobcopilot' => 'https://jobcopilot.com',
            'resumebuilder' => 'https://app.resumebuilder.com',
        ];

        $platformStatus = [];
        foreach ($platformChecks as $key => $url) {
            $platformStatus[$key] = $this->probePlatform($url);
        }

        return [
            'sources' => $config['sources'] ?? [],
            'questions' => $config['questions'] ?? [],
            'platform_status' => $platformStatus,
            'fetched_at' => now()->toIso8601String(),
            'note' => 'Questions are curated from public JobCopilot and ResumeBuilder.com onboarding flows. '
                . 'Those platforms do not expose a public question API.',
        ];
    }

    /**
     * @param  array<string, string|array<int, string>>  $answers
     * @return list<string> Missing required question ids
     */
    public function missingRequired(array $answers): array
    {
        $missing = [];
        foreach (config('resume_builder_screening.questions', []) as $question) {
            if (empty($question['required'])) {
                continue;
            }
            $id = $question['id'] ?? null;
            if (! $id) {
                continue;
            }
            $value = $answers[$id] ?? null;
            if ($value === null || $value === '' || $value === []) {
                $missing[] = $id;
            }
        }

        return $missing;
    }

    /** @return array{reachable: bool, message: string} */
    private function probePlatform(string $url): array
    {
        try {
            $response = Http::timeout(6)->head($url);

            return [
                'reachable' => $response->successful() || $response->status() === 405,
                'message' => $response->successful() || $response->status() === 405
                    ? 'Platform reachable — using curated question catalog.'
                    : 'HTTP '.$response->status(),
            ];
        } catch (\Throwable $e) {
            Log::debug('Resume screening platform probe failed', ['url' => $url, 'error' => $e->getMessage()]);

            return [
                'reachable' => false,
                'message' => 'Using bundled catalog (platform not reachable from server).',
            ];
        }
    }
}
