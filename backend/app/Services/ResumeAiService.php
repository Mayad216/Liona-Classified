<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ResumeAiService
{
    private const SYSTEM = <<<'TXT'
You are a professional resume writing assistant for the UAE job market.
NEVER invent employers, job titles, dates, degrees, tools, certifications, or metrics.
Only rewrite and improve wording using facts supplied by the user.
Return plain text only unless asked for JSON. No markdown.
TXT;

    public function generateSummary(string $jobTitle, string $rawExperience): string
    {
        $prompt = "Job title: {$jobTitle}\nExperience notes:\n{$rawExperience}\n\nWrite a 3–4 sentence professional summary.";

        return $this->chat($prompt) ?? $this->fallbackSummary($jobTitle, $rawExperience);
    }

    public function generateSummaryFromResume(array $resumeData): string
    {
        $json = json_encode($resumeData, JSON_UNESCAPED_UNICODE);
        $prompt = <<<TXT
Using ONLY facts from this resume JSON, write a professional summary of 3–4 sentences for the UAE job market.
Highlight the candidate's primary role, core strengths, and relevant skills from the data provided.
Do NOT invent employers, job titles, degrees, tools, certifications, metrics, or achievements not in the JSON.
Return plain text only. No markdown or bullet points.

Resume JSON:
{$json}
TXT;

        return $this->chat($prompt) ?? $this->fallbackSummaryFromResume($resumeData);
    }

    public function improveBullet(string $bullet, ?string $jobTitle = null): string
    {
        $ctx = $jobTitle ? "Job title context: {$jobTitle}\n" : '';
        $prompt = "{$ctx}Improve this resume bullet professionally. Keep all facts. One bullet only.\nBullet:\n{$bullet}";

        return $this->chat($prompt) ?? $this->fallbackBullet($bullet);
    }

    /**
     * @return array{summary_suggestion: string, skills_to_emphasize: string[], experience_edits: array<int, array{bullet_index: int, suggested_text: string}>, missing_keywords: string[]}
     */
    public function tailorToJobDescription(array $resumeData, string $jobDescription): array
    {
        $json = json_encode($resumeData, JSON_UNESCAPED_UNICODE);
        $prompt = <<<TXT
Compare this resume JSON to the job description.
Suggest improvements ONLY by rephrasing existing content or highlighting existing skills.
Return valid JSON with keys: summary_suggestion, skills_to_emphasize (array), experience_edits (array of {experience_index, bullet_index, suggested_text}), missing_keywords (array).
Never recommend adding experience the user does not have.

Resume JSON:
{$json}

Job description:
{$jobDescription}
TXT;

        $raw = $this->chat($prompt, true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return [
                    'summary_suggestion' => (string) ($parsed['summary_suggestion'] ?? ''),
                    'skills_to_emphasize' => (array) ($parsed['skills_to_emphasize'] ?? []),
                    'experience_edits' => (array) ($parsed['experience_edits'] ?? []),
                    'missing_keywords' => (array) ($parsed['missing_keywords'] ?? []),
                ];
            }
        }

        return $this->fallbackTailor($resumeData, $jobDescription);
    }

    /**
     * @return array{missing_keywords: string[], already_present: string[]}
     */
    public function suggestKeywords(array $resumeData, string $jobDescription): array
    {
        $json = json_encode($resumeData, JSON_UNESCAPED_UNICODE);
        $prompt = <<<TXT
Extract important keywords from the job description.
Compare against the resume JSON.
Return valid JSON: {"missing_keywords": [...], "already_present": [...]}
Do not suggest fabricating experience.

Resume JSON:
{$json}

Job description:
{$jobDescription}
TXT;

        $raw = $this->chat($prompt, true);
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

    /**
     * @return string[]
     */
    public function autocomplete(string $field, string $query): array
    {
        $query = trim($query);
        if ($query === '') {
            return [];
        }

        $catalog = config("resume.autocomplete.{$field}", []);
        $local = $this->filterCatalog($catalog, $query, 8);

        if (count($local) >= 6) {
            return $local;
        }

        $ai = $this->aiAutocompleteSuggestions($field, $query, $local);

        return $this->mergeSuggestionLists($local, $ai, 10);
    }

    /**
     * @return array<int, array{text: string, recommended: bool}>
     */
    public function suggestJobDescriptions(string $jobTitle, ?string $company = null): array
    {
        $companyLine = $company ? "Company: {$company}\n" : '';
        $prompt = <<<TXT
Job title: {$jobTitle}
{$companyLine}
Suggest 8 resume bullet points typical for this role in the UAE job market.
Return valid JSON: {"suggestions": [{"text": "...", "recommended": true/false}, ...]}
Mark exactly 3 bullets as highly recommended (recommended: true) — the most impactful bullets recruiters expect for this title.
Start each bullet with a strong action verb. Do not invent specific employers, products, revenue figures, or team sizes.
Use professional language suitable for ATS-friendly resumes.
TXT;

        $raw = $this->chat($prompt, true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && isset($parsed['suggestions']) && is_array($parsed['suggestions'])) {
                $out = [];
                foreach ($parsed['suggestions'] as $item) {
                    if (! is_array($item)) {
                        continue;
                    }
                    $text = trim((string) ($item['text'] ?? ''));
                    if ($text === '') {
                        continue;
                    }
                    $out[] = [
                        'text' => $text,
                        'recommended' => (bool) ($item['recommended'] ?? false),
                    ];
                }
                if ($out !== []) {
                    return $this->ensureRecommendedCount($out);
                }
            }
        }

        return $this->fallbackJobDescriptions($jobTitle);
    }

    /**
     * @return array<int, array{skill: string, recommended: bool}>
     */
    public function suggestSkillsForRole(
        string $jobTitle,
        ?string $company = null,
        ?string $experienceNotes = null
    ): array {
        $companyLine = $company ? "Company: {$company}\n" : '';
        $notesLine = $experienceNotes ? "Experience notes:\n{$experienceNotes}\n" : '';
        $prompt = <<<TXT
Job title: {$jobTitle}
{$companyLine}{$notesLine}
Suggest 10–14 professional resume skills appropriate for this role in the UAE job market.
Include a mix of hard skills (tools, methods, domain knowledge) and relevant soft skills.
Return valid JSON: {"suggestions": [{"skill": "...", "recommended": true/false}, ...]}
Mark the 5–6 most important skills for this title as recommended: true.
Use concise skill labels (1–4 words). Do not invent certifications the user did not mention.
Do not mention Khaleej or AI.
TXT;

        $raw = $this->chat($prompt, true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && isset($parsed['suggestions']) && is_array($parsed['suggestions'])) {
                $out = [];
                foreach ($parsed['suggestions'] as $item) {
                    if (! is_array($item)) {
                        continue;
                    }
                    $skill = trim((string) ($item['skill'] ?? ''));
                    if ($skill === '') {
                        continue;
                    }
                    $out[] = [
                        'skill' => $skill,
                        'recommended' => (bool) ($item['recommended'] ?? false),
                    ];
                }
                if ($out !== []) {
                    return $this->ensureRecommendedSkillCount($out);
                }
            }
        }

        return $this->fallbackSkillsForRole($jobTitle);
    }

    private function chat(string $userPrompt, bool $json = false): ?string
    {
        $key = config('resume.openai_api_key');
        if (! $key) {
            return null;
        }

        $response = Http::withToken($key)
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('resume.openai_model'),
                'temperature' => 0.35,
                'response_format' => $json ? ['type' => 'json_object'] : null,
                'messages' => [
                    ['role' => 'system', 'content' => self::SYSTEM],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

        if (! $response->successful()) {
            return null;
        }

        return trim($response->json('choices.0.message.content') ?? '');
    }

    private function fallbackSummary(string $jobTitle, string $raw): string
    {
        $snippet = Str::limit(trim($raw), 120);

        return "Experienced {$jobTitle} with a track record of delivering results in the UAE market. "
            .($snippet ? "Background includes {$snippet}. " : '')
            .'Seeking to contribute strong communication skills and hands-on experience to a growth-focused team.';
    }

    /** @param  array<string, mixed>  $resumeData */
    private function fallbackSummaryFromResume(array $resumeData): string
    {
        $experiences = $resumeData['experiences'] ?? [];
        $jobTitle = 'Professional';
        $snippets = [];

        if (is_array($experiences)) {
            foreach ($experiences as $exp) {
                if (! is_array($exp)) {
                    continue;
                }
                $title = trim((string) ($exp['job_title'] ?? ''));
                if ($title !== '' && $jobTitle === 'Professional') {
                    $jobTitle = $title;
                }
                foreach ($exp['bullets'] ?? [] as $bullet) {
                    $b = trim((string) $bullet);
                    if ($b !== '') {
                        $snippets[] = $b;
                    }
                }
            }
        }

        $skills = $resumeData['skills'] ?? [];
        if (is_array($skills) && $skills !== []) {
            $snippets[] = 'Skills: '.implode(', ', array_slice(array_map('strval', $skills), 0, 8));
        }

        $snippet = Str::limit(implode('; ', array_slice($snippets, 0, 4)), 200);

        return 'Results-driven '.$jobTitle.' with experience across the UAE market.'
            .($snippet ? " Background includes {$snippet}." : ' ')
            .'Brings strong communication skills and a proven ability to deliver on team and organizational goals.';
    }

    private function fallbackBullet(string $bullet): string
    {
        $clean = trim($bullet);
        if ($clean === '') {
            return $clean;
        }

        $verbs = ['Managed', 'Supported', 'Coordinated', 'Delivered', 'Handled'];
        $verb = $verbs[crc32($clean) % count($verbs)];

        return "{$verb} ".lcfirst(rtrim($clean, '.')).', contributing to team objectives and client satisfaction.';
    }

    /** @return array<string, mixed> */
    private function fallbackTailor(array $resumeData, string $jd): array
    {
        $keywords = $this->extractWords($jd);
        $resumeText = strtolower(json_encode($resumeData));
        $missing = array_values(array_filter($keywords, fn ($k) => ! str_contains($resumeText, strtolower($k))));

        return [
            'summary_suggestion' => $resumeData['summary'] ?? '',
            'skills_to_emphasize' => array_slice($missing, 0, 5),
            'experience_edits' => [],
            'missing_keywords' => array_slice($missing, 0, 8),
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

    /** @return string[] */
    private function filterCatalog(array $catalog, string $query, int $limit = 8): array
    {
        $q = strtolower(trim($query));
        if ($q === '') {
            return array_slice($catalog, 0, $limit);
        }

        $starts = [];
        $includes = [];

        foreach ($catalog as $item) {
            $lower = strtolower($item);
            if (str_starts_with($lower, $q)) {
                $starts[] = $item;
            } elseif (str_contains($lower, $q)) {
                $includes[] = $item;
            }
        }

        return array_slice(array_merge($starts, $includes), 0, $limit);
    }

    /**
     * @param  string[]  $existing
     * @return string[]
     */
    private function aiAutocompleteSuggestions(string $field, string $query, array $existing): array
    {
        $labels = [
            'job_title' => 'professional job titles common in the UAE job market',
            'degree' => 'recognized academic degrees and diplomas',
            'school' => 'real universities, colleges, or schools (especially UAE/Gulf and international)',
            'language' => 'language names',
            'language_level' => 'language proficiency levels for a resume',
        ];

        $label = $labels[$field] ?? 'resume field values';
        $exclude = $existing !== [] ? "\nDo not repeat: ".implode(', ', array_slice($existing, 0, 8)) : '';

        $prompt = <<<TXT
The user is typing in a resume {$field} field. Partial input: "{$query}"
Suggest up to 6 widely recognized {$label} that match or complete the input.
Return valid JSON: {"suggestions": ["...", ...]}
Use standard spelling. Only real, established values — never invent employers or fake institutions.{$exclude}
TXT;

        $raw = $this->chat($prompt, true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && isset($parsed['suggestions']) && is_array($parsed['suggestions'])) {
                return array_values(array_filter(array_map(
                    fn ($s) => trim((string) $s),
                    $parsed['suggestions']
                )));
            }
        }

        return [];
    }

    /**
     * @param  string[]  $local
     * @param  string[]  $ai
     * @return string[]
     */
    private function mergeSuggestionLists(array $local, array $ai, int $limit = 10): array
    {
        $seen = [];
        $out = [];

        foreach (array_merge($local, $ai) as $item) {
            $key = strtolower(trim($item));
            if ($key === '' || isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $out[] = trim($item);
            if (count($out) >= $limit) {
                break;
            }
        }

        return $out;
    }

    /**
     * @param  array<int, array{text: string, recommended: bool}>  $items
     * @return array<int, array{text: string, recommended: bool}>
     */
    private function ensureRecommendedCount(array $items): array
    {
        $out = array_slice($items, 0, 8);
        $recommendedCount = count(array_filter($out, fn ($i) => $i['recommended']));

        if ($recommendedCount >= 3) {
            return $out;
        }

        for ($i = 0; $i < count($out) && $recommendedCount < 3; $i++) {
            if (! $out[$i]['recommended']) {
                $out[$i]['recommended'] = true;
                $recommendedCount++;
            }
        }

        return $out;
    }

    /** @return array<int, array{text: string, recommended: bool}> */
    private function fallbackJobDescriptions(string $jobTitle): array
    {
        $title = strtolower(trim($jobTitle));
        $templates = [
            [
                'keys' => ['engineer', 'developer', 'devops', 'software'],
                'items' => [
                    ['text' => 'Designed, developed, and maintained applications aligned with business requirements', 'recommended' => true],
                    ['text' => 'Collaborated with cross-functional teams to deliver features on schedule', 'recommended' => true],
                    ['text' => 'Improved reliability and performance through testing, reviews, and refactoring', 'recommended' => true],
                    ['text' => 'Documented solutions and supported knowledge sharing across the team', 'recommended' => false],
                    ['text' => 'Participated in agile planning and contributed to continuous improvement', 'recommended' => false],
                ],
            ],
            [
                'keys' => ['manager', 'lead', 'director', 'supervisor'],
                'items' => [
                    ['text' => 'Led planning and execution to deliver projects on time and within budget', 'recommended' => true],
                    ['text' => 'Defined team goals and KPIs to improve productivity and accountability', 'recommended' => true],
                    ['text' => 'Coached team members through feedback, mentoring, and performance reviews', 'recommended' => true],
                    ['text' => 'Managed stakeholder communication and resolved escalations effectively', 'recommended' => false],
                    ['text' => 'Optimized workflows to improve service quality and operational efficiency', 'recommended' => false],
                ],
            ],
        ];

        foreach ($templates as $template) {
            foreach ($template['keys'] as $key) {
                if (str_contains($title, $key)) {
                    return $template['items'];
                }
            }
        }

        return [
            ['text' => 'Managed daily responsibilities while maintaining high standards of quality', 'recommended' => true],
            ['text' => 'Collaborated with colleagues to achieve team and organizational objectives', 'recommended' => true],
            ['text' => 'Identified process improvements and contributed to efficiency gains', 'recommended' => true],
            ['text' => 'Communicated clearly with stakeholders to resolve issues promptly', 'recommended' => false],
            ['text' => 'Supported special projects and additional duties as assigned', 'recommended' => false],
        ];
    }

    /**
     * @param  array<int, array{skill: string, recommended: bool}>  $items
     * @return array<int, array{skill: string, recommended: bool}>
     */
    private function ensureRecommendedSkillCount(array $items): array
    {
        $out = array_slice($items, 0, 14);
        $recommendedCount = count(array_filter($out, fn ($i) => $i['recommended']));

        if ($recommendedCount >= 4) {
            return $out;
        }

        for ($i = 0; $i < count($out) && $recommendedCount < 5; $i++) {
            if (! $out[$i]['recommended']) {
                $out[$i]['recommended'] = true;
                $recommendedCount++;
            }
        }

        return $out;
    }

    /** @return array<int, array{skill: string, recommended: bool}> */
    private function fallbackSkillsForRole(string $jobTitle): array
    {
        $title = strtolower(trim($jobTitle));
        $templates = [
            [
                'keys' => ['engineer', 'developer', 'devops', 'software', 'data', 'analyst'],
                'skills' => [
                    ['skill' => 'Problem solving', 'recommended' => true],
                    ['skill' => 'Communication', 'recommended' => true],
                    ['skill' => 'Project management', 'recommended' => true],
                    ['skill' => 'Data analysis', 'recommended' => true],
                    ['skill' => 'Documentation', 'recommended' => false],
                    ['skill' => 'Stakeholder management', 'recommended' => false],
                    ['skill' => 'Team collaboration', 'recommended' => false],
                    ['skill' => 'Process improvement', 'recommended' => false],
                ],
            ],
            [
                'keys' => ['manager', 'lead', 'director', 'head of', 'supervisor'],
                'skills' => [
                    ['skill' => 'Leadership', 'recommended' => true],
                    ['skill' => 'Team management', 'recommended' => true],
                    ['skill' => 'Strategic planning', 'recommended' => true],
                    ['skill' => 'Budgeting', 'recommended' => true],
                    ['skill' => 'Stakeholder management', 'recommended' => false],
                    ['skill' => 'Performance management', 'recommended' => false],
                    ['skill' => 'Decision making', 'recommended' => false],
                    ['skill' => 'Cross-functional collaboration', 'recommended' => false],
                ],
            ],
            [
                'keys' => ['sales', 'marketing', 'account', 'business development'],
                'skills' => [
                    ['skill' => 'Client relationship management', 'recommended' => true],
                    ['skill' => 'Negotiation', 'recommended' => true],
                    ['skill' => 'Communication', 'recommended' => true],
                    ['skill' => 'CRM tools', 'recommended' => true],
                    ['skill' => 'Pipeline management', 'recommended' => false],
                    ['skill' => 'Presentation skills', 'recommended' => false],
                    ['skill' => 'Market research', 'recommended' => false],
                    ['skill' => 'Reporting', 'recommended' => false],
                ],
            ],
        ];

        foreach ($templates as $template) {
            foreach ($template['keys'] as $key) {
                if (str_contains($title, $key)) {
                    return $template['skills'];
                }
            }
        }

        return [
            ['skill' => 'Communication', 'recommended' => true],
            ['skill' => 'Problem solving', 'recommended' => true],
            ['skill' => 'Time management', 'recommended' => true],
            ['skill' => 'Teamwork', 'recommended' => true],
            ['skill' => 'Customer service', 'recommended' => false],
            ['skill' => 'Attention to detail', 'recommended' => false],
            ['skill' => 'Adaptability', 'recommended' => false],
            ['skill' => 'Microsoft Office', 'recommended' => false],
        ];
    }
}
