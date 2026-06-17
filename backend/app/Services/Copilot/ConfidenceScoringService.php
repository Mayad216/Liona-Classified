<?php

namespace App\Services\Copilot;

use App\Models\JobMatch;
use App\Models\Resume;
use App\Models\User;

class ConfidenceScoringService
{
    /**
     * @return array{score: float, breakdown: array<string, array{weight: float, score: float, weighted: float, label: string}>}
     */
    public function score(User $user, ?JobMatch $match, ?Resume $resume, ?string $applyUrl, bool $hasCaptchaRisk = false): array
    {
        $weights = config('copilot.auto_apply.confidence_weights', []);
        $profile = $user->jobSeekerProfile;

        $factors = [
            'profile_completion' => [
                'label' => 'Profile completion',
                'weight' => (float) ($weights['profile_completion'] ?? 0.2),
                'score' => min(1, (float) ($profile?->completion ?? 0)),
            ],
            'match_score' => [
                'label' => 'Job match score',
                'weight' => (float) ($weights['match_score'] ?? 0.25),
                'score' => min(1, ((float) ($match?->match_score ?? 0)) / 100),
            ],
            'resume_parsed' => [
                'label' => 'Resume parsed',
                'weight' => (float) ($weights['resume_parsed'] ?? 0.15),
                'score' => ($resume && $resume->parse_status === 'completed') ? 1.0 : 0.55,
            ],
            'screening_answers' => [
                'label' => 'Screening answers',
                'weight' => (float) ($weights['screening_answers'] ?? 0.2),
                'score' => $this->screeningAnswerScore($user),
            ],
            'apply_url' => [
                'label' => 'Apply URL available',
                'weight' => (float) ($weights['apply_url'] ?? 0.1),
                'score' => $applyUrl ? 1.0 : 0.0,
            ],
            'blacklist_clear' => [
                'label' => 'Not blacklisted',
                'weight' => (float) ($weights['blacklist_clear'] ?? 0.1),
                'score' => 1.0,
            ],
        ];

        if ($hasCaptchaRisk) {
            $factors['captcha_risk'] = [
                'label' => 'No CAPTCHA detected',
                'weight' => 0.15,
                'score' => 0.0,
            ];
        }

        $totalWeight = array_sum(array_column($factors, 'weight'));
        $weightedSum = 0;
        $breakdown = [];

        foreach ($factors as $key => $factor) {
            $weighted = $factor['score'] * $factor['weight'];
            $weightedSum += $weighted;
            $breakdown[$key] = [
                'label' => $factor['label'],
                'weight' => round($factor['weight'], 2),
                'score' => round($factor['score'], 4),
                'weighted' => round($weighted, 4),
            ];
        }

        $score = $totalWeight > 0 ? round($weightedSum / $totalWeight, 4) : 0;

        return ['score' => $score, 'breakdown' => $breakdown];
    }

    private function screeningAnswerScore(User $user): float
    {
        $keys = ['work_authorization', 'visa_sponsorship', 'expected_salary', 'years_experience'];
        $answered = $user->screeningAnswers()
            ->whereIn('question_key', $keys)
            ->whereNotNull('answer_text')
            ->where('answer_text', '!=', '')
            ->count();

        return min(1, $answered / max(1, count($keys)));
    }
}
