<?php

namespace App\Services\Copilot;

use App\Models\Resume;
use App\Services\ResumeDataSanitizer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AiResumeParserService
{
    public function __construct(protected ResumeDataSanitizer $sanitizer)
    {
    }

    /**
     * @return array<string, mixed>|null
     */
    public function parseTextToStructuredData(string $resumeText): ?array
    {
        $resumeText = trim($resumeText);
        if ($resumeText === '') {
            return null;
        }

        $system = config('copilot.prompts.resume_parse_system');
        $userTemplate = config('copilot.prompts.resume_parse_user');
        $user = str_replace('{{resume_text}}', mb_substr($resumeText, 0, 12000), $userTemplate);

        $raw = $this->chat($system, $user);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return $this->sanitizer->sanitize($this->normalizeParsed($parsed));
            }
        }

        return $this->sanitizer->sanitize($this->heuristicParse($resumeText));
    }

    /**
     * @param  array<string, mixed>  $parsed
     * @return array<string, mixed>
     */
    private function normalizeParsed(array $parsed): array
    {
        $base = Resume::emptyData();

        $pi = (array) ($parsed['personal_info'] ?? []);
        $base['personal_info'] = array_merge($base['personal_info'], [
            'full_name' => (string) ($pi['full_name'] ?? ''),
            'email' => (string) ($pi['email'] ?? ''),
            'phone' => (string) ($pi['phone'] ?? ''),
            'location' => (string) ($pi['location'] ?? ''),
            'linkedin' => (string) ($pi['linkedin'] ?? ''),
            'website' => (string) ($pi['website'] ?? ''),
        ]);
        $base['summary'] = (string) ($parsed['summary'] ?? '');

        $base['experiences'] = $this->mapWithIds($parsed['experiences'] ?? [], function ($row) {
            return [
                'job_title' => (string) ($row['job_title'] ?? ''),
                'company' => (string) ($row['company'] ?? ''),
                'location' => (string) ($row['location'] ?? ''),
                'start_date' => (string) ($row['start_date'] ?? ''),
                'end_date' => (string) ($row['end_date'] ?? ''),
                'is_current' => (bool) ($row['is_current'] ?? false),
                'bullets' => array_values(array_filter((array) ($row['bullets'] ?? []))),
            ];
        });

        $base['education'] = $this->mapWithIds($parsed['education'] ?? [], function ($row) {
            return [
                'degree' => (string) ($row['degree'] ?? ''),
                'school' => (string) ($row['school'] ?? ''),
                'location' => (string) ($row['location'] ?? ''),
                'start_date' => (string) ($row['start_date'] ?? ''),
                'end_date' => (string) ($row['end_date'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
            ];
        });

        $base['skills'] = array_values(array_filter(array_map('strval', (array) ($parsed['skills'] ?? []))));

        $base['languages'] = array_values(array_map(function ($row) {
            $row = (array) $row;

            return [
                'name' => (string) ($row['name'] ?? ''),
                'level' => (string) ($row['level'] ?? ''),
            ];
        }, (array) ($parsed['languages'] ?? [])));

        $base['projects'] = $this->mapWithIds($parsed['projects'] ?? [], function ($row) {
            return [
                'name' => (string) ($row['name'] ?? ''),
                'url' => (string) ($row['url'] ?? ''),
                'description' => (string) ($row['description'] ?? ''),
                'technologies' => array_values(array_filter((array) ($row['technologies'] ?? []))),
            ];
        });

        $base['certifications'] = $this->mapWithIds($parsed['certifications'] ?? [], function ($row) {
            return [
                'name' => (string) ($row['name'] ?? ''),
                'issuer' => (string) ($row['issuer'] ?? ''),
                'date' => (string) ($row['date'] ?? ''),
            ];
        });

        return $base;
    }

    /**
     * @param  array<int, mixed>  $rows
     * @param  callable(array<string, mixed>): array<string, mixed>  $mapper
     * @return array<int, array<string, mixed>>
     */
    private function mapWithIds(array $rows, callable $mapper): array
    {
        return array_values(array_map(function ($row) use ($mapper) {
            $mapped = $mapper((array) $row);
            $mapped['id'] = (string) Str::uuid();

            return $mapped;
        }, $rows));
    }

    /**
     * @return array<string, mixed>
     */
    private function heuristicParse(string $text): array
    {
        $lines = preg_split('/\R+/', $text) ?: [];
        $name = trim($lines[0] ?? '');

        $data = Resume::emptyData();
        $data['personal_info']['full_name'] = $name;
        $data['summary'] = mb_substr($text, 0, 600);

        if (preg_match('/[\w.+-]+@[\w.-]+\.\w+/', $text, $email)) {
            $data['personal_info']['email'] = $email[0];
        }
        if (preg_match('/(\+?\d[\d\s\-()]{7,}\d)/', $text, $phone)) {
            $data['personal_info']['phone'] = trim($phone[0]);
        }

        return $data;
    }

    private function chat(string $system, string $user): ?string
    {
        $key = config('copilot.openai_api_key');
        if (! $key) {
            return null;
        }

        $response = Http::withToken($key)
            ->timeout(45)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('copilot.openai_model'),
                'temperature' => 0.1,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if (! $response->successful()) {
            return null;
        }

        return $response->json('choices.0.message.content');
    }
}
