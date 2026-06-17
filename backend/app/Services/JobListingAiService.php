<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class JobListingAiService
{
    private const SYSTEM = <<<'TXT'
You are an executive HR copywriter specialising in premium UAE job listings for a high-trust classifieds platform.
Write polished, inclusive, employer-brand-quality content suitable for senior candidates and regulated industries.
Tone: professional, specific, confident — never casual or generic.
Each bullet must start with a strong action verb and stand alone as a complete line.
Do not invent employer names, guaranteed visa outcomes, or unverifiable statistics.
Return valid JSON only when asked. No markdown fences.
TXT;

    /**
     * @return array{
     *     description: string,
     *     responsibilities: array<int, string>,
     *     qualifications: array<int, string>,
     *     benefits: array<int, string>,
     *     salary_min?: int|null,
     *     salary_max?: int|null,
     *     experience?: string|null
     * }
     */
    public function suggestListing(
        string $role,
        string $industry,
        ?string $employmentType = null,
        ?string $experienceLevel = null,
        ?string $workArrangement = null,
        ?string $company = null
    ): array {
        $experienceLevel = $this->normalizeExperience($experienceLevel);
        $companyLine = $company ? "Company: {$company}\n" : '';
        $employmentLine = $employmentType ? "Employment type: {$employmentType}\n" : '';
        $experienceLine = "Experience level (must shape tone, years, scope, and salary): {$experienceLevel}\n";
        $arrangementLine = $workArrangement ? "Work arrangement: {$workArrangement}\n" : '';

        $prompt = <<<TXT
Draft a premium UAE job listing.

Role: {$role}
Industry: {$industry}
{$companyLine}{$employmentLine}{$experienceLine}{$arrangementLine}
Experience level guidance:
- Entry (0–2 years): foundational scope, learning-oriented bullets, lower salary band
- Mid (3–5 years): independent contributor, solid ownership
- Senior (6–8 years): subject-matter expert, cross-team influence, mentoring
- Lead (8–12 years): people/process leadership, accountability for team outcomes
- Executive (12+ years): strategy, P&L or function ownership, executive stakeholder management

Return valid JSON with keys:
- description (string, 3–5 sentences, executive-quality prose tailored to the experience level)
- responsibilities (array of exactly 8–10 strings; each a single bullet starting with a strong action verb)
- qualifications (array of exactly 8–10 strings; each a single requirement bullet reflecting the experience level)
- benefits (array of exactly 8–10 strings; each a single benefit bullet; include UAE-relevant perks)
- salary_min (integer AED monthly, realistic for role + industry + experience level in UAE)
- salary_max (integer AED monthly, realistic upper band)
- experience (must equal "{$experienceLevel}")

Do not mention Khaleej, AI, or chatbots. Do not use markdown bullet characters inside strings.
TXT;

        $raw = $this->chat($prompt, true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return $this->normalizePayload($parsed, $role, $industry, $experienceLevel, $employmentType, $workArrangement, $company);
            }
        }

        return $this->fallbackListing($role, $industry, $experienceLevel, $employmentType, $workArrangement, $company);
    }

    private function normalizeExperience(?string $level): string
    {
        $allowed = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];

        return in_array($level, $allowed, true) ? $level : 'Mid';
    }

    /**
     * @param  array<string, mixed>  $parsed
     * @return array{
     *     description: string,
     *     responsibilities: array<int, string>,
     *     qualifications: array<int, string>,
     *     benefits: array<int, string>,
     *     salary_min?: int|null,
     *     salary_max?: int|null,
     *     experience?: string|null
     * }
     */
    private function normalizePayload(
        array $parsed,
        string $role,
        string $industry,
        string $experienceLevel,
        ?string $employmentType,
        ?string $workArrangement,
        ?string $company
    ): array {
        $description = trim((string) ($parsed['description'] ?? ''));
        $responsibilities = $this->stringList($parsed['responsibilities'] ?? [], 8, 10);
        $qualifications = $this->stringList($parsed['qualifications'] ?? [], 8, 10);
        $benefits = $this->stringList($parsed['benefits'] ?? [], 8, 10);

        if ($description === '' || count($responsibilities) < 6 || count($qualifications) < 6) {
            return $this->fallbackListing($role, $industry, $experienceLevel, $employmentType, $workArrangement, $company);
        }

        $salary = $this->estimateSalary($role, $industry, $experienceLevel);

        return [
            'description' => $description,
            'responsibilities' => $responsibilities,
            'qualifications' => $qualifications,
            'benefits' => $benefits !== [] ? $benefits : $this->defaultBenefits($industry, $experienceLevel, $workArrangement),
            'salary_min' => isset($parsed['salary_min']) ? (int) $parsed['salary_min'] : $salary['min'],
            'salary_max' => isset($parsed['salary_max']) ? (int) $parsed['salary_max'] : $salary['max'],
            'experience' => $experienceLevel,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function stringList(mixed $value, int $min = 1, int $max = 12): array
    {
        if (! is_array($value)) {
            return [];
        }

        $out = [];
        foreach ($value as $item) {
            $text = trim(ltrim(trim((string) $item), "•-\t "));
            if ($text !== '') {
                $out[] = $text;
            }
            if (count($out) >= $max) {
                break;
            }
        }

        return $out;
    }

    /**
     * @return array{min: int, max: int}
     */
    private function estimateSalary(string $role, string $industry, string $experienceLevel): array
    {
        $roleLower = strtolower($role);
        $industryLower = strtolower($industry);

        $baseMin = 9000;
        $baseMax = 17000;

        if (preg_match('/chief|ceo|coo|cto|cmo|cfo|vice president|director|general manager|country manager/', $roleLower)) {
            $baseMin = 32000;
            $baseMax = 65000;
        } elseif (preg_match('/software|developer|engineer|devops|cloud|architect|data scientist|machine learning/', $roleLower)) {
            $baseMin = 16000;
            $baseMax = 28000;
        } elseif (preg_match('/product manager|product owner/', $roleLower)) {
            $baseMin = 20000;
            $baseMax = 36000;
        } elseif (preg_match('/marketing|brand|communications/', $roleLower)) {
            $baseMin = 9000;
            $baseMax = 17000;
        } elseif (preg_match('/sales|business development|account manager/', $roleLower)) {
            $baseMin = 7000;
            $baseMax = 14000;
        } elseif (preg_match('/accountant|finance|audit|controller/', $roleLower)) {
            $baseMin = 11000;
            $baseMax = 22000;
        } elseif (preg_match('/nurse|doctor|pharmacist|clinical/', $roleLower)) {
            $baseMin = 8000;
            $baseMax = 16000;
        } elseif (preg_match('/chef|hotel|waiter|hospitality/', $roleLower)) {
            $baseMin = 4500;
            $baseMax = 9000;
        }

        $industryFactor = 1.0;
        if (str_contains($industryLower, 'bank') || str_contains($industryLower, 'fintech') || str_contains($industryLower, 'investment')) {
            $industryFactor = 1.15;
        } elseif (str_contains($industryLower, 'technology') || str_contains($industryLower, 'software')) {
            $industryFactor = 1.1;
        } elseif (str_contains($industryLower, 'hospitality') || str_contains($industryLower, 'restaurant') || str_contains($industryLower, 'hotel')) {
            $industryFactor = 0.88;
        } elseif (str_contains($industryLower, 'oil') || str_contains($industryLower, 'energy')) {
            $industryFactor = 1.12;
        }

        $expFactor = match ($experienceLevel) {
            'Entry' => 0.72,
            'Senior' => 1.42,
            'Lead' => 1.78,
            'Executive' => 2.35,
            default => 1.0,
        };

        $round = fn (float $v) => (int) (round($v / 500) * 500);

        return [
            'min' => $round($baseMin * $industryFactor * $expFactor),
            'max' => $round($baseMax * $industryFactor * $expFactor),
        ];
    }

    /**
     * @return array{
     *     description: string,
     *     responsibilities: array<int, string>,
     *     qualifications: array<int, string>,
     *     benefits: array<int, string>,
     *     salary_min?: int|null,
     *     salary_max?: int|null,
     *     experience?: string|null
     * }
     */
    private function fallbackListing(
        string $role,
        string $industry,
        string $experienceLevel,
        ?string $employmentType,
        ?string $workArrangement,
        ?string $company
    ): array {
        $years = match ($experienceLevel) {
            'Entry' => '0–2 years',
            'Senior' => '6–8 years',
            'Lead' => '8–12 years',
            'Executive' => '12+ years',
            default => '3–5 years',
        };

        $employer = $company ? trim($company) : "our {$industry} organisation";
        $employment = strtolower($employmentType ?? 'full-time');
        $arrangement = $workArrangement ? " This role is offered on a {$employment} {$workArrangement} basis in the UAE." : " This role is offered on a {$employment} basis in the UAE.";

        $description = "{$employer} is seeking an accomplished {$role} ({$years} of experience) to strengthen our {$industry} team."
            ." The successful candidate will deliver with the professionalism, accountability, and quality expected in the UAE market."
            .$arrangement
            .' We value candidates who combine technical or functional excellence with collaboration and integrity.';

        $responsibilities = [
            "Deliver core {$role} outcomes to defined quality, timeline, and service standards",
            'Collaborate with cross-functional stakeholders to align priorities and remove blockers',
            'Maintain accurate documentation, reporting, and communication with management',
            'Identify process improvements that enhance efficiency, quality, or customer experience',
            'Uphold company policies, compliance requirements, and professional conduct at all times',
            'Support team objectives through reliable execution and proactive problem-solving',
            'Monitor performance indicators and recommend corrective actions when needed',
            'Represent the organisation professionally with clients, partners, and colleagues',
        ];

        if (in_array($experienceLevel, ['Senior', 'Lead', 'Executive'], true)) {
            $responsibilities[] = 'Mentor colleagues and raise standards through coaching and structured feedback';
            $responsibilities[] = 'Lead initiatives that deliver measurable business or operational impact';
        } else {
            $responsibilities[] = 'Learn internal systems, standards, and workflows under senior guidance';
            $responsibilities[] = 'Execute assigned tasks accurately while building role-specific expertise';
        }

        $qualifications = [
            "{$years} of relevant experience as a {$role} or in a comparable {$industry} function",
            "Demonstrated success in {$industry} or a closely related sector",
            'Bachelor\'s degree in a relevant discipline or equivalent professional qualification',
            'Excellent written and verbal communication skills in English',
            'Strong organisational skills, attention to detail, and professional integrity',
            'Ability to manage priorities, deadlines, and stakeholder expectations effectively',
            'Proficiency with role-relevant tools, systems, and reporting standards',
            'Eligible to work in the UAE; visa sponsorship may be available for qualified candidates',
        ];

        if ($experienceLevel === 'Executive') {
            $qualifications[] = 'Proven executive leadership experience with strategic planning and governance accountability';
        } elseif ($experienceLevel === 'Lead') {
            $qualifications[] = 'Experience leading teams, workflows, or multi-stakeholder initiatives';
        }

        $salary = $this->estimateSalary($role, $industry, $experienceLevel);

        return [
            'description' => $description,
            'responsibilities' => array_slice($responsibilities, 0, 10),
            'qualifications' => array_slice($qualifications, 0, 10),
            'benefits' => $this->defaultBenefits($industry, $experienceLevel, $workArrangement),
            'salary_min' => $salary['min'],
            'salary_max' => $salary['max'],
            'experience' => $experienceLevel,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function defaultBenefits(string $industry, string $experienceLevel, ?string $workArrangement): array
    {
        $benefits = [
            'Competitive tax-free salary aligned with UAE market benchmarks',
            'Comprehensive medical insurance',
            'Annual leave and public holidays as per UAE labour law',
            'End-of-service benefits in accordance with UAE regulations',
            'Visa sponsorship and Emirates ID processing for eligible candidates',
            'Structured onboarding and professional development support',
            'Performance-driven culture with clear expectations and growth pathways',
            "Opportunity to build a career with a reputable {$industry} employer",
        ];

        if (in_array($experienceLevel, ['Senior', 'Lead', 'Executive'], true)) {
            $benefits[] = 'Performance bonus or incentive scheme';
            $benefits[] = 'Annual flight allowance or ticket benefit where applicable';
        }

        if (in_array($workArrangement, ['Hybrid', 'Remote'], true)) {
            $benefits[] = 'Flexible or hybrid working arrangement';
        }

        return array_slice($benefits, 0, 10);
    }

    private function chat(string $userPrompt, bool $json = false): ?string
    {
        $key = config('resume.openai_api_key');
        if (! $key) {
            return null;
        }

        $response = Http::withToken($key)
            ->timeout(45)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('resume.openai_model', 'gpt-4o-mini'),
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
}
