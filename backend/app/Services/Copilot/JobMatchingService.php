<?php

namespace App\Services\Copilot;

use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\JobMatch;
use App\Models\JobSeekerProfile;
use App\Models\Resume;
use App\Models\User;

class JobMatchingService
{
    /** @var array<string, int> */
    private array $weights;

    public function __construct(protected EmbeddingService $embeddings)
    {
        $this->weights = config('copilot.matching.weights', [
            'title' => 20,
            'skills' => 25,
            'experience' => 15,
            'location' => 15,
            'salary' => 10,
            'industry' => 10,
            'work_authorization' => 5,
        ]);
    }

    /**
     * @return array{
     *   match_score: float,
     *   matched_skills: list<string>,
     *   missing_skills: list<string>,
     *   match_reason: string,
     *   salary_match: bool,
     *   location_match: bool,
     *   experience_match: bool,
     *   work_authorization_match: bool,
     *   semantic_score: float|null,
     *   scoring_method: string
     * }
     */
    public function score(JobSeekerProfile $profile, ?array $resumeData, Job|CopilotJob $job): array
    {
        $resumeSkills = $this->extractResumeSkills($resumeData);
        $jobSkills = $this->extractJobSkills($job);
        $matchedSkills = array_values(array_intersect(
            array_map('strtolower', $resumeSkills),
            array_map('strtolower', $jobSkills)
        ));
        $missingSkills = array_values(array_diff(
            array_map('strtolower', $jobSkills),
            array_map('strtolower', $resumeSkills)
        ));
        $missingSkills = array_slice($missingSkills, 0, 8);

        $titleScore = $this->scoreTitle($profile, $job);
        $skillsScore = $this->scoreSkills($resumeSkills, $jobSkills, $matchedSkills);
        $experienceScore = $this->scoreExperience($profile, $job);
        $locationScore = $this->scoreLocation($profile, $job);
        $salaryMatch = $this->checkSalaryMatch($profile, $job);
        $salaryScore = $salaryMatch ? 1.0 : 0.35;
        $industryScore = $this->scoreIndustry($profile, $job);
        $workAuthMatch = $this->checkWorkAuthorization($profile, $job);

        $total = (
            ($titleScore * $this->weights['title']) +
            ($skillsScore * $this->weights['skills']) +
            ($experienceScore * $this->weights['experience']) +
            ($locationScore * $this->weights['location']) +
            ($salaryScore * $this->weights['salary']) +
            ($industryScore * $this->weights['industry']) +
            (($workAuthMatch ? 1.0 : 0.0) * $this->weights['work_authorization'])
        ) / array_sum($this->weights) * 100;

        $matchScore = round(min(100, max(0, $total)), 1);
        $semantic = $this->embeddings->similarityForMatch($profile, $resumeData, $job);
        $scoringMethod = 'deterministic';

        if ($semantic !== null) {
            $blend = $this->embeddings->blendWeight();
            $matchScore = round($matchScore * (1 - $blend) + ($semantic * 100) * $blend, 1);
            $scoringMethod = 'hybrid';
        }

        $reason = $this->buildMatchReason(
            $matchScore,
            $titleScore,
            $skillsScore,
            $matchedSkills,
            $locationScore,
            $salaryMatch
        );

        return [
            'match_score' => $matchScore,
            'semantic_score' => $semantic !== null ? round($semantic * 100, 1) : null,
            'scoring_method' => $scoringMethod,
            'matched_skills' => array_slice($matchedSkills, 0, 10),
            'missing_skills' => $missingSkills,
            'match_reason' => $reason,
            'salary_match' => $salaryMatch,
            'location_match' => $locationScore >= 0.6,
            'experience_match' => $experienceScore >= 0.6,
            'work_authorization_match' => $workAuthMatch,
        ];
    }

    public function upsertMatch(User $user, Job|CopilotJob $job, array $result): JobMatch
    {
        $existing = JobMatch::query()
            ->where('user_id', $user->id)
            ->where('matchable_type', $job->getMorphClass())
            ->where('matchable_id', $job->getKey())
            ->first();

        $status = $existing?->recommendation_status ?? 'recommended';
        if ($existing && in_array($status, ['saved', 'dismissed'], true)) {
            // preserve user actions
        } elseif ($existing && $status === 'hidden') {
            // preserve
        } else {
            $status = 'recommended';
        }

        return JobMatch::updateOrCreate(
            [
                'user_id' => $user->id,
                'matchable_type' => $job->getMorphClass(),
                'matchable_id' => $job->getKey(),
            ],
            [
                'match_score' => $result['match_score'],
                'semantic_score' => $result['semantic_score'] ?? null,
                'scoring_method' => $result['scoring_method'] ?? 'deterministic',
                'match_reason' => $result['match_reason'],
                'matched_skills' => $result['matched_skills'],
                'missing_skills' => $result['missing_skills'],
                'salary_match' => $result['salary_match'],
                'location_match' => $result['location_match'],
                'experience_match' => $result['experience_match'],
                'work_authorization_match' => $result['work_authorization_match'],
                'recommendation_status' => $status,
            ]
        );
    }

    public function recalculateForUser(User $user): int
    {
        $profile = $user->jobSeekerProfile;
        if (! $profile) {
            return 0;
        }

        $resume = Resume::query()
            ->where('user_id', $user->id)
            ->where('is_default', true)
            ->first();

        $resumeData = $resume?->data;
        $count = 0;
        $minScore = (float) config('copilot.matching.min_score', 25);
        $countries = $this->targetCountries($profile);

        Job::query()->where('status', 'active')->chunkById(100, function ($jobs) use ($user, $profile, $resumeData, &$count, $minScore) {
            foreach ($jobs as $job) {
                $result = $this->score($profile, $resumeData, $job);
                if ($result['match_score'] >= $minScore) {
                    $this->upsertMatch($user, $job, $result);
                    $count++;
                }
            }
        });

        CopilotJob::query()
            ->where('status', 'active')
            ->when($countries !== [], fn ($q) => $q->whereIn('country', $countries))
            ->chunkById(100, function ($jobs) use ($user, $profile, $resumeData, &$count, $minScore) {
            foreach ($jobs as $job) {
                $result = $this->score($profile, $resumeData, $job);
                if ($result['match_score'] >= $minScore) {
                    $this->upsertMatch($user, $job, $result);
                    $count++;
                }
            }
        });

        return $count;
    }

    /**
     * @return list<string>
     */
    private function extractResumeSkills(?array $resumeData): array
    {
        if (! $resumeData) {
            return [];
        }

        $skills = (array) ($resumeData['skills'] ?? []);
        $fromText = [];

        foreach ($resumeData['experiences'] ?? [] as $exp) {
            foreach ($exp['bullets'] ?? [] as $bullet) {
                $fromText = array_merge($fromText, $this->tokenizeImportantWords((string) $bullet));
            }
        }

        return array_values(array_unique(array_filter(array_merge($skills, $fromText))));
    }

    /**
     * @return list<string>
     */
    private function extractJobSkills(Job|CopilotJob $job): array
    {
        $blob = $job->matchTextBlob();
        $skills = $this->tokenizeImportantWords($blob);

        if ($job instanceof Job && is_array($job->requirements)) {
            foreach ($job->requirements as $req) {
                $skills = array_merge($skills, $this->tokenizeImportantWords((string) $req));
            }
        }

        if ($job instanceof CopilotJob && $job->requirements) {
            $skills = array_merge($skills, $this->tokenizeImportantWords($job->requirements));
        }

        return array_values(array_unique(array_filter($skills)));
    }

    /**
     * @return list<string>
     */
    private function tokenizeImportantWords(string $text): array
    {
        $text = strtolower($text);
        preg_match_all('/\b[a-z][a-z0-9+#.-]{2,}\b/', $text, $matches);
        $stop = ['the', 'and', 'for', 'with', 'you', 'your', 'our', 'will', 'have', 'from', 'this', 'that', 'are', 'was', 'been'];

        return array_values(array_filter($matches[0] ?? [], fn ($w) => ! in_array($w, $stop, true) && strlen($w) >= 3));
    }

    private function scoreTitle(JobSeekerProfile $profile, Job|CopilotJob $job): float
    {
        $jobTitle = strtolower($job instanceof Job ? $job->title : $job->title);
        $targets = array_map('strtolower', (array) ($profile->target_job_titles ?? []));
        if ($profile->current_job_title) {
            $targets[] = strtolower($profile->current_job_title);
        }

        if ($targets === []) {
            return 0.4;
        }

        $best = 0.0;
        foreach ($targets as $target) {
            similar_text($target, $jobTitle, $pct);
            $best = max($best, $pct / 100);
            if (str_contains($jobTitle, $target) || str_contains($target, $jobTitle)) {
                $best = max($best, 0.85);
            }
        }

        return min(1.0, $best);
    }

    /**
     * @param  list<string>  $resumeSkills
     * @param  list<string>  $jobSkills
     * @param  list<string>  $matchedSkills
     */
    private function scoreSkills(array $resumeSkills, array $jobSkills, array $matchedSkills): float
    {
        if ($jobSkills === []) {
            return $resumeSkills === [] ? 0.5 : 0.65;
        }

        return min(1.0, count($matchedSkills) / max(3, min(10, count($jobSkills))));
    }

    private function scoreExperience(JobSeekerProfile $profile, Job|CopilotJob $job): float
    {
        $years = (int) ($profile->years_of_experience ?? 0);

        if ($job instanceof Job) {
            $level = strtolower($job->experience_level ?? '');
            $expected = match (true) {
                str_contains($level, 'entry') => 2,
                str_contains($level, 'mid') => 5,
                str_contains($level, 'senior') => 8,
                str_contains($level, 'lead') => 12,
                default => 5,
            };

            if ($years >= $expected) {
                return 1.0;
            }
            if ($years >= $expected - 2) {
                return 0.75;
            }

            return max(0.2, $years / max(1, $expected));
        }

        return $years > 0 ? 0.7 : 0.5;
    }

    private function scoreLocation(JobSeekerProfile $profile, Job|CopilotJob $job): float
    {
        $pref = $profile->remote_preference ?? 'any';
        $isRemote = $job instanceof Job ? $job->isRemote() : $job->isRemote();

        if ($pref === 'remote' && $isRemote) {
            return 1.0;
        }
        if ($pref === 'remote' && ! $isRemote) {
            return 0.2;
        }

        $locations = array_map('strtolower', (array) ($profile->preferred_locations ?? []));
        $jobLocation = strtolower($job instanceof Job
            ? ($job->emirate.' '.$job->area)
            : ($job->location ?? ''));

        if ($locations === []) {
            return 0.6;
        }

        foreach ($locations as $loc) {
            if ($loc !== '' && str_contains($jobLocation, $loc)) {
                return 1.0;
            }
        }

        return $isRemote && in_array($pref, ['hybrid', 'any'], true) ? 0.75 : 0.35;
    }

    private function checkSalaryMatch(JobSeekerProfile $profile, Job|CopilotJob $job): bool
    {
        $min = (int) ($profile->expected_salary_min ?? 0);
        $max = (int) ($profile->expected_salary_max ?? 0);
        if ($min === 0 && $max === 0) {
            return true;
        }

        $jobMin = (int) ($job->salary_min ?? 0);
        $jobMax = (int) ($job->salary_max ?? 0);
        if ($jobMin === 0 && $jobMax === 0) {
            return true;
        }

        $userMid = $max > 0 ? ($min + $max) / 2 : $min;

        return $userMid >= $jobMin * 0.85 && ($jobMax === 0 || $userMid <= $jobMax * 1.15);
    }

    private function scoreIndustry(JobSeekerProfile $profile, Job|CopilotJob $job): float
    {
        $targets = array_map('strtolower', (array) ($profile->target_industries ?? []));
        if ($targets === []) {
            return 0.6;
        }

        $industry = strtolower($job instanceof Job ? ($job->industry ?? '') : '');

        foreach ($targets as $target) {
            if ($target !== '' && str_contains($industry, $target)) {
                return 1.0;
            }
        }

        return 0.35;
    }

    private function checkWorkAuthorization(JobSeekerProfile $profile, Job|CopilotJob $job): bool
    {
        if (! $profile->work_authorization) {
            return true;
        }

        $blob = $job->matchTextBlob();
        if ($profile->requires_visa_sponsorship && str_contains($blob, 'no sponsorship')) {
            return false;
        }

        return true;
    }

    /**
     * @param  list<string>  $matchedSkills
     */
    private function buildMatchReason(
        float $score,
        float $titleScore,
        float $skillsScore,
        array $matchedSkills,
        float $locationScore,
        bool $salaryMatch
    ): string {
        $parts = [];

        if ($titleScore >= 0.7) {
            $parts[] = 'Strong title alignment with your target roles';
        } elseif ($titleScore >= 0.4) {
            $parts[] = 'Partial title match with your preferences';
        }

        if ($skillsScore >= 0.6 && count($matchedSkills) > 0) {
            $parts[] = 'Skills overlap: '.implode(', ', array_slice($matchedSkills, 0, 4));
        } elseif (count($matchedSkills) > 0) {
            $parts[] = 'Some matching skills: '.implode(', ', array_slice($matchedSkills, 0, 3));
        }

        if ($locationScore >= 0.7) {
            $parts[] = 'Fits your location or remote preference';
        }

        if ($salaryMatch) {
            $parts[] = 'Salary range appears compatible';
        }

        if ($parts === []) {
            return $score >= 50
                ? 'Moderate overall fit based on your profile and resume'
                : 'Limited overlap — review details before applying';
        }

        return implode('. ', $parts).'.';
    }

    /**
     * @return list<string>
     */
    public function targetCountries(JobSeekerProfile $profile): array
    {
        $countries = array_filter([
            $profile->country,
            ...((array) ($profile->preferred_locations ?? [])),
        ]);

        $supported = array_keys(config('copilot.countries', []));
        $filtered = [];
        foreach ($countries as $country) {
            $code = strtoupper((string) $country);
            if (in_array($code, $supported, true)) {
                $filtered[] = $code;
            }
        }

        return array_values(array_unique($filtered));
    }
}
