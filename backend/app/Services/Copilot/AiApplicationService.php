<?php

namespace App\Services\Copilot;

class AiApplicationService extends CopilotAiClient
{
    public function generateCoverLetter(
        ?array $profile,
        ?array $resumeData,
        string $jobDescription,
        ?string $jobTitle = null,
        ?string $company = null
    ): string {
        $system = config('copilot.prompts.cover_letter_system');
        $user = $this->renderTemplate(config('copilot.prompts.cover_letter_user'), [
            'user_profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
            'resume_data' => json_encode($resumeData, JSON_UNESCAPED_UNICODE),
            'job_description' => $jobDescription,
            'job_title' => $jobTitle ?? 'the role',
            'company' => $company ?? 'the company',
        ]);

        $letter = $this->chat($system, $user);
        if ($letter) {
            return $letter;
        }

        $name = $profile['full_name'] ?? ($resumeData['personal_info']['full_name'] ?? 'Applicant');
        $role = $jobTitle ?? 'the position';

        return "Dear Hiring Manager,\n\n"
            ."I am writing to express my interest in the {$role} role. "
            ."My background, as outlined in my resume, aligns with the requirements described in your posting. "
            ."I would welcome the opportunity to contribute my experience to your team.\n\n"
            ."Thank you for your consideration.\n\n"
            ."Sincerely,\n{$name}";
    }

    /**
     * @param  list<array<string, string>>  $screeningAnswers
     */
    public function generateScreeningAnswer(
        string $question,
        ?array $profile,
        ?array $resumeData,
        array $screeningAnswers = []
    ): string {
        $system = config('copilot.prompts.screening_system');
        $user = $this->renderTemplate(config('copilot.prompts.screening_user'), [
            'question' => $question,
            'user_profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
            'resume_data' => json_encode($resumeData, JSON_UNESCAPED_UNICODE),
            'screening_answers' => json_encode($screeningAnswers, JSON_UNESCAPED_UNICODE),
        ]);

        $answer = $this->chat($system, $user, temperature: 0.2);
        if ($answer) {
            return trim($answer);
        }

        return $this->fallbackScreeningAnswer($question, $profile, $screeningAnswers);
    }

    /**
     * @return array{
     *   match_score: float,
     *   matched_skills: string[],
     *   missing_skills: string[],
     *   match_reason: string,
     *   risks: string[],
     *   recommendation: string
     * }
     */
    public function explainMatch(
        ?array $profile,
        ?array $resumeData,
        string $jobDescription,
        ?float $deterministicScore = null
    ): array {
        $system = config('copilot.prompts.match_explain_system');
        $user = $this->renderTemplate(config('copilot.prompts.match_explain_user'), [
            'user_profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
            'resume_data' => json_encode($resumeData, JSON_UNESCAPED_UNICODE),
            'job_description' => $jobDescription,
            'deterministic_score' => (string) ($deterministicScore ?? ''),
        ]);

        $raw = $this->chat($system, $user, json: true);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return [
                    'match_score' => (float) ($parsed['match_score'] ?? $deterministicScore ?? 0),
                    'matched_skills' => (array) ($parsed['matched_skills'] ?? []),
                    'missing_skills' => (array) ($parsed['missing_skills'] ?? []),
                    'match_reason' => (string) ($parsed['match_reason'] ?? ''),
                    'risks' => (array) ($parsed['risks'] ?? []),
                    'recommendation' => (string) ($parsed['recommendation'] ?? 'maybe'),
                ];
            }
        }

        return [
            'match_score' => $deterministicScore ?? 50.0,
            'matched_skills' => [],
            'missing_skills' => [],
            'match_reason' => 'AI explanation unavailable — review the job description against your verified profile.',
            'risks' => [],
            'recommendation' => 'maybe',
        ];
    }

    /**
     * @param  list<array<string, string>>  $screeningAnswers
     */
    private function fallbackScreeningAnswer(string $question, ?array $profile, array $screeningAnswers): string
    {
        $q = strtolower($question);
        foreach ($screeningAnswers as $row) {
            if (str_contains($q, strtolower($row['question_key'] ?? ''))) {
                return $row['answer_text'] ?? 'NEEDS_USER_REVIEW';
            }
        }

        if (str_contains($q, 'salary') && ! empty($profile['expected_salary_min'])) {
            $min = $profile['expected_salary_min'];
            $max = $profile['expected_salary_max'] ?? $min;

            return "My expected salary range is AED {$min}".($max !== $min ? " – {$max}" : '').' per month.';
        }

        if (str_contains($q, 'visa') || str_contains($q, 'sponsorship')) {
            return ($profile['requires_visa_sponsorship'] ?? false)
                ? 'Yes, I require visa sponsorship.'
                : 'No, I do not require visa sponsorship.';
        }

        if (str_contains($q, 'authorized') || str_contains($q, 'legal')) {
            return $profile['work_authorization']
                ? (string) $profile['work_authorization']
                : 'NEEDS_USER_REVIEW';
        }

        if (str_contains($q, 'experience') && isset($profile['years_of_experience'])) {
            return 'I have '.$profile['years_of_experience'].' years of relevant experience.';
        }

        return 'NEEDS_USER_REVIEW';
    }
}
