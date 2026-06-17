<?php

namespace App\Services\Copilot;

use Illuminate\Support\Str;

class AiResumeService extends CopilotAiClient
{
    public function generateSummary(?array $profile, ?array $resumeData, ?string $targetRole = null): string
    {
        $system = config('copilot.prompts.summary_system');
        $user = $this->renderTemplate(config('copilot.prompts.summary_user'), [
            'user_profile' => $this->profileContext($profile, $resumeData),
            'target_role' => $targetRole ?? ($profile['current_job_title'] ?? 'Professional'),
        ]);

        return $this->chat($system, $user) ?? $this->fallbackSummary($profile, $resumeData, $targetRole);
    }

    /**
     * @return list<string>
     */
    public function improveBullet(string $bullet, ?string $role = null): array
    {
        $system = config('copilot.prompts.bullet_system');
        $user = $this->renderTemplate(config('copilot.prompts.bullet_user'), [
            'bullet' => $bullet,
            'role' => $role ?? 'Professional',
        ]);

        $raw = $this->chat($system, $user, json: true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && ! empty($parsed['versions'])) {
                return array_values(array_filter(array_map('strval', (array) $parsed['versions'])));
            }
            if (is_array($parsed) && isset($parsed[0])) {
                return array_values(array_map('strval', $parsed));
            }
        }

        return $this->fallbackBullets($bullet);
    }

    /**
     * @return array{
     *   tailored_summary: string,
     *   tailored_experience_bullets: array<int, array{experience_index: int, bullet_index: int, suggested_text: string}>,
     *   suggested_keywords: string[],
     *   missing_information: string[]
     * }
     */
    public function tailorResume(?array $profile, array $resumeData, string $jobDescription): array
    {
        $system = config('copilot.prompts.tailor_system');
        $user = $this->renderTemplate(config('copilot.prompts.tailor_user'), [
            'user_profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
            'resume_data' => json_encode($resumeData, JSON_UNESCAPED_UNICODE),
            'job_description' => $jobDescription,
        ]);

        $raw = $this->chat($system, $user, json: true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return [
                    'tailored_summary' => (string) ($parsed['tailored_summary'] ?? ''),
                    'tailored_experience_bullets' => (array) ($parsed['tailored_experience_bullets'] ?? []),
                    'suggested_keywords' => (array) ($parsed['suggested_keywords'] ?? []),
                    'missing_information' => (array) ($parsed['missing_information'] ?? []),
                ];
            }
        }

        return $this->fallbackTailor($resumeData, $jobDescription);
    }

    /**
     * @return array{missing_keywords: string[], already_present: string[]}
     */
    public function extractJobKeywords(array $resumeData, string $jobDescription): array
    {
        $system = config('copilot.prompts.keywords_system');
        $user = $this->renderTemplate(config('copilot.prompts.keywords_user'), [
            'resume_data' => json_encode($resumeData, JSON_UNESCAPED_UNICODE),
            'job_description' => $jobDescription,
        ]);

        $raw = $this->chat($system, $user, json: true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return [
                    'missing_keywords' => (array) ($parsed['missing_keywords'] ?? []),
                    'already_present' => (array) ($parsed['already_present'] ?? []),
                ];
            }
        }

        return $this->fallbackKeywords($resumeData, $jobDescription);
    }

    private function fallbackSummary(?array $profile, ?array $resumeData, ?string $targetRole): string
    {
        $role = $targetRole ?? ($profile['current_job_title'] ?? 'Professional');
        $existing = $resumeData['summary'] ?? ($profile['professional_summary'] ?? '');

        if ($existing) {
            return Str::limit(trim($existing), 400);
        }

        $years = (int) ($profile['years_of_experience'] ?? 0);

        return "{$role} with ".($years > 0 ? "{$years}+ years of " : '')."experience seeking opportunities in the UAE. "
            .'Focused on delivering results using verified skills and background documented in my profile.';
    }

    /** @return list<string> */
    private function fallbackBullets(string $bullet): array
    {
        $clean = trim($bullet);
        if ($clean === '') {
            return [];
        }

        $base = rtrim($clean, '.');

        return [
            "Delivered {$base} while collaborating with cross-functional stakeholders.",
            "Contributed to team outcomes by {$base}.",
            ucfirst($base).', supporting operational excellence and quality standards.',
        ];
    }

    /** @return array<string, mixed> */
    private function fallbackTailor(array $resumeData, string $jd): array
    {
        $keywords = $this->extractWords($jd);
        $resumeText = strtolower(json_encode($resumeData));
        $missing = array_values(array_filter($keywords, fn ($k) => ! str_contains($resumeText, strtolower($k))));

        return [
            'tailored_summary' => (string) ($resumeData['summary'] ?? ''),
            'tailored_experience_bullets' => [],
            'suggested_keywords' => array_slice($missing, 0, 8),
            'missing_information' => [],
        ];
    }

    /** @return array{missing_keywords: string[], already_present: string[]} */
    private function fallbackKeywords(array $resumeData, string $jd): array
    {
        $keywords = $this->extractWords($jd);
        $resumeText = strtolower(json_encode($resumeData));
        $missing = [];
        $present = [];

        foreach ($keywords as $k) {
            if (str_contains($resumeText, strtolower($k))) {
                $present[] = $k;
            } else {
                $missing[] = $k;
            }
        }

        return [
            'missing_keywords' => array_slice($missing, 0, 10),
            'already_present' => array_slice($present, 0, 10),
        ];
    }

    /** @return string[] */
    private function extractWords(string $text): array
    {
        preg_match_all('/\b[A-Za-z]{4,}\b/', $text, $matches);
        $stop = ['with', 'that', 'this', 'from', 'your', 'will', 'have', 'been', 'their', 'about'];

        return array_values(array_unique(array_filter(
            $matches[0] ?? [],
            fn ($w) => ! in_array(strtolower($w), $stop, true)
        )));
    }
}
