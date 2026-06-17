<?php

namespace App\Services\Copilot;

use App\Jobs\RunAutoApplyJob;
use App\Models\AutoApplyConsent;
use App\Models\CopilotApplication;
use App\Models\CopilotAutomationLog;
use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\JobMatch;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AutoApplyService
{
    public function __construct(
        protected UsageLimitService $usage,
        protected AiApplicationService $ai,
        protected BlacklistService $blacklist,
        protected ConfidenceScoringService $confidenceScoring,
        protected ScreeningDetectionService $screeningDetection,
        protected ScreenshotStorageService $screenshots,
    ) {
    }

    public function consentText(): string
    {
        return config('copilot.auto_apply.consent_text');
    }

    public function consentVersion(): string
    {
        return (string) config('copilot.auto_apply.consent_version', '1.0');
    }

    public function hasActiveConsent(User $user): bool
    {
        return AutoApplyConsent::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->where('consent_version', $this->consentVersion())
            ->exists();
    }

    public function latestConsent(User $user): ?AutoApplyConsent
    {
        return AutoApplyConsent::query()
            ->where('user_id', $user->id)
            ->latest('consented_at')
            ->first();
    }

    public function recordConsent(User $user, Request $request): AutoApplyConsent
    {
        AutoApplyConsent::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        return AutoApplyConsent::create([
            'user_id' => $user->id,
            'consent_version' => $this->consentVersion(),
            'consent_text' => $this->consentText(),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
            'consented_at' => now(),
        ]);
    }

    public function revokeConsent(User $user): void
    {
        AutoApplyConsent::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * @return array{ok: bool, message?: string, application?: CopilotApplication}
     */
    public function queueForMatch(User $user, JobMatch $match): array
    {
        if ($match->user_id !== $user->id) {
            return ['ok' => false, 'message' => 'Job match not found.'];
        }

        if (! $this->hasActiveConsent($user)) {
            return ['ok' => false, 'message' => 'Auto-apply consent is required.'];
        }

        if (! $user->hasRemainingApplicationCredits()) {
            return ['ok' => false, 'message' => 'No auto-application credits remaining.'];
        }

        $minScore = (float) config('copilot.auto_apply.min_match_score', 50);
        if ($match->match_score < $minScore) {
            return ['ok' => false, 'message' => "Match score must be at least {$minScore}% for auto-apply."];
        }

        $resume = $user->resumes()->where('is_default', true)->first()
            ?? $user->resumes()->latest('updated_at')->first();

        if (! $resume) {
            return ['ok' => false, 'message' => 'Upload a resume before using auto-apply.'];
        }

        $applyUrl = $this->resolveApplyUrl($match);
        if (! $applyUrl) {
            return ['ok' => false, 'message' => 'This job has no apply URL for automation.'];
        }

        $blacklist = $this->blacklist->check($user, $match->matchable, $applyUrl);
        if ($blacklist['blocked']) {
            return ['ok' => false, 'message' => $blacklist['reason'] ?? 'This job is blacklisted.'];
        }

        $duplicate = CopilotApplication::query()
            ->where('user_id', $user->id)
            ->where('job_match_id', $match->id)
            ->whereIn('status', ['queued', 'running', 'submitted', 'needs_review'])
            ->exists();

        if ($duplicate) {
            return ['ok' => false, 'message' => 'An application for this job is already in progress or submitted.'];
        }

        $application = CopilotApplication::create([
            'user_id' => $user->id,
            'job_match_id' => $match->id,
            'matchable_type' => $match->matchable_type,
            'matchable_id' => $match->matchable_id,
            'resume_id' => $resume->id,
            'application_type' => 'auto',
            'status' => 'queued',
            'apply_url' => $applyUrl,
            'metadata' => [
                'mode' => config('copilot.auto_apply.mode', 'demo'),
                'match_score' => $match->match_score,
            ],
        ]);

        $this->log($application, 'queued', 'Auto-apply queued.', [
            'apply_url' => $applyUrl,
            'match_score' => $match->match_score,
        ]);

        RunAutoApplyJob::dispatch($application->id);

        return ['ok' => true, 'application' => $application->fresh()];
    }

    public function execute(CopilotApplication $application): CopilotApplication
    {
        $application->load(['user.jobSeekerProfile', 'user.screeningAnswers', 'resume', 'jobMatch.matchable']);

        if ($application->isTerminal()) {
            return $application;
        }

        $application->update(['status' => 'running']);
        $this->log($application, 'started', 'Auto-apply run started.');

        try {
            $mode = config('copilot.auto_apply.mode', 'demo');

            if ($mode === 'playwright') {
                return $this->dispatchToWorker($application);
            }

            return $this->executeDemo($application);
        } catch (\Throwable $e) {
            $application->update([
                'status' => 'failed',
                'error_message' => Str::limit($e->getMessage(), 1000),
            ]);
            $this->log($application, 'failed', $e->getMessage(), level: 'error');

            return $application->fresh();
        }
    }

    public function handleWorkerReport(CopilotApplication $application, array $payload): CopilotApplication
    {
        $status = $payload['status'] ?? 'failed';
        $confidence = isset($payload['confidence_score']) ? (float) $payload['confidence_score'] : null;

        $application->update([
            'status' => $status,
            'confidence_score' => $confidence,
            'cover_letter' => $payload['cover_letter'] ?? $application->cover_letter,
            'error_message' => $payload['error_message'] ?? null,
            'submitted_at' => in_array($status, ['submitted', 'needs_review'], true) ? now() : null,
            'metadata' => array_merge($application->metadata ?? [], [
                'worker_report' => $payload,
                'confidence_breakdown' => $payload['confidence_breakdown'] ?? null,
                'detected_screening' => $payload['detected_screening'] ?? null,
            ]),
        ]);

        foreach ($payload['logs'] ?? [] as $entry) {
            $this->log(
                $application,
                $entry['step'] ?? 'worker',
                $entry['message'] ?? '',
                $entry['payload'] ?? null,
                $entry['level'] ?? 'info',
                $entry['screenshot_path'] ?? null
            );
        }

        if (in_array($status, ['submitted', 'needs_review'], true)) {
            $this->usage->consumeAutoApplication($application->user);
        }

        return $application->fresh();
    }

    private function executeDemo(CopilotApplication $application): CopilotApplication
    {
        $user = $application->user;
        $match = $application->jobMatch;
        $profile = $user->jobSeekerProfile?->toArray() ?? [];
        $resumeData = $application->resume?->data ?? [];
        $job = $match?->matchable;

        $this->log($application, 'validate', 'Validating profile and resume.');

        $jobDescription = $this->jobDescription($job);
        $jobTitle = $this->jobTitle($job);
        $company = $this->jobCompany($job);

        $detectedScreening = $this->screeningDetection->detectFromText($jobDescription);
        $this->log($application, 'screening_detect', 'Screening questions detected from job description.', [
            'count' => count($detectedScreening),
            'questions' => $detectedScreening,
        ]);

        $confidenceResult = $this->confidenceScoring->score(
            $user,
            $match,
            $application->resume,
            $application->apply_url,
            $this->hasCaptchaRisk($jobDescription, $application->apply_url)
        );
        $confidence = $confidenceResult['score'];
        $this->log($application, 'confidence', 'Confidence calculated.', [
            'score' => $confidence,
            'breakdown' => $confidenceResult['breakdown'],
        ]);

        $this->log($application, 'cover_letter', 'Generating cover letter.');
        $coverLetter = $this->ai->generateCoverLetter(
            $profile,
            is_array($resumeData) ? $resumeData : [],
            $jobDescription,
            $jobTitle,
            $company
        );

        $screening = $this->resolveScreeningAnswers($user, $profile, $resumeData);
        $needsReview = $this->screeningNeedsReview($screening);

        $this->log($application, 'screening', 'Screening answers prepared.', [
            'needs_review' => $needsReview,
            'answers' => $screening,
        ]);

        $threshold = (float) config('copilot.auto_apply.confidence_threshold', 0.75);
        $status = ($confidence >= $threshold && ! $needsReview) ? 'submitted' : 'needs_review';

        $this->log($application, 'submit', $status === 'submitted'
            ? 'Demo mode: application marked as submitted.'
            : 'Demo mode: application held for user review.', [
                'confidence' => $confidence,
                'threshold' => $threshold,
            ]);

        $application->update([
            'status' => $status,
            'confidence_score' => $confidence,
            'cover_letter' => $coverLetter,
            'submitted_at' => now(),
            'metadata' => array_merge($application->metadata ?? [], [
                'screening_answers' => $screening,
                'detected_screening' => $detectedScreening,
                'confidence_breakdown' => $confidenceResult['breakdown'],
                'needs_review_reason' => $needsReview
                    ? 'One or more screening answers require your review.'
                    : ($confidence < $threshold ? 'Confidence below automatic submit threshold.' : null),
            ]),
        ]);

        $this->usage->consumeAutoApplication($user);

        return $application->fresh();
    }

    private function dispatchToWorker(CopilotApplication $application): CopilotApplication
    {
        $workerUrl = config('copilot.auto_apply.worker_url');
        if (! $workerUrl) {
            throw new \RuntimeException('COPILOT_AUTO_APPLY_WORKER_URL is not configured.');
        }

        $this->log($application, 'worker', 'Dispatching to Playwright worker.');

        $response = Http::withHeaders([
            'X-Copilot-Worker-Secret' => config('copilot.auto_apply.worker_secret'),
        ])->timeout(15)->post(rtrim($workerUrl, '/').'/apply', [
            'application_id' => $application->id,
            'apply_url' => $application->apply_url,
            'profile' => $application->user->jobSeekerProfile?->toArray(),
            'resume' => $application->resume?->data,
            'screening_answers' => $application->user->screeningAnswers
                ->map(fn ($a) => [
                    'question_key' => $a->question_key,
                    'question_text' => $a->question_text,
                    'answer_text' => $a->answer_text,
                ])->values()->all(),
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Playwright worker rejected the job: '.$response->body());
        }

        $application->update([
            'status' => 'running',
            'metadata' => array_merge($application->metadata ?? [], [
                'worker_dispatched_at' => now()->toIso8601String(),
            ]),
        ]);

        return $application->fresh();
    }

    public function resolveApplyUrl(?JobMatch $match): ?string
    {
        if (! $match) {
            return null;
        }

        $job = $match->matchable;
        if ($job instanceof Job) {
            return url("/jobs/{$job->id}");
        }

        if ($job instanceof CopilotJob) {
            return $job->application_url ?? $job->source_url;
        }

        return null;
    }

    public function approveApplication(User $user, CopilotApplication $application): CopilotApplication
    {
        abort_unless($application->user_id === $user->id, 403);
        abort_unless($application->status === 'needs_review', 422, 'Only needs_review applications can be approved.');

        $application->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'metadata' => array_merge($application->metadata ?? [], [
                'approved_by_user_at' => now()->toIso8601String(),
            ]),
        ]);

        $this->log($application, 'approved', 'User approved application after review.');

        return $application->fresh();
    }

    public function cancelApplication(User $user, CopilotApplication $application): CopilotApplication
    {
        abort_unless($application->user_id === $user->id, 403);
        abort_unless(in_array($application->status, ['needs_review', 'queued', 'running'], true), 422);

        $application->update(['status' => 'cancelled']);
        $this->log($application, 'cancelled', 'Application cancelled by user.');

        return $application->fresh();
    }

    private function hasCaptchaRisk(string $jobDescription, ?string $applyUrl): bool
    {
        $haystack = Str::lower($jobDescription.' '.$applyUrl);

        return Str::contains($haystack, ['captcha', 'recaptcha', 'hcaptcha']);
    }

    /**
     * @return list<array{question_key: string, question_text: string, answer: string, needs_review: bool}>
     */
    private function resolveScreeningAnswers(User $user, array $profile, mixed $resumeData): array
    {
        $stored = $user->screeningAnswers->keyBy('question_key');
        $questions = config('copilot.screening_questions', []);
        $resumeArray = is_array($resumeData) ? $resumeData : [];
        $results = [];

        foreach ($questions as $question) {
            $key = $question['key'];
            $text = $question['text'];
            $storedAnswer = $stored->get($key);

            if ($storedAnswer && trim((string) $storedAnswer->answer_text) !== '') {
                $results[] = [
                    'question_key' => $key,
                    'question_text' => $text,
                    'answer' => $storedAnswer->answer_text,
                    'needs_review' => false,
                ];

                continue;
            }

            $generated = $this->ai->generateScreeningAnswer(
                $text,
                $profile,
                $resumeArray,
                $stored->map(fn ($a) => [
                    'question_key' => $a->question_key,
                    'answer_text' => $a->answer_text,
                ])->values()->all()
            );

            $needsReview = strtoupper(trim($generated)) === 'NEEDS_USER_REVIEW';

            $results[] = [
                'question_key' => $key,
                'question_text' => $text,
                'answer' => $needsReview ? '' : $generated,
                'needs_review' => $needsReview,
            ];
        }

        return $results;
    }

    /**
     * @param  list<array{needs_review: bool}>  $screening
     */
    private function screeningNeedsReview(array $screening): bool
    {
        foreach ($screening as $item) {
            if ($item['needs_review']) {
                return true;
            }
        }

        return false;
    }

    private function jobDescription(mixed $job): string
    {
        if ($job instanceof Job || $job instanceof CopilotJob) {
            return (string) ($job->description ?? '');
        }

        return '';
    }

    private function jobTitle(mixed $job): string
    {
        if ($job instanceof Job || $job instanceof CopilotJob) {
            return (string) ($job->title ?? 'the role');
        }

        return 'the role';
    }

    private function jobCompany(mixed $job): string
    {
        if ($job instanceof Job) {
            return (string) ($job->company ?? 'the company');
        }
        if ($job instanceof CopilotJob) {
            return (string) ($job->company_name ?? 'the company');
        }

        return 'the company';
    }

    public function log(
        CopilotApplication $application,
        string $step,
        string $message,
        ?array $payload = null,
        string $level = 'info',
        ?string $screenshotPath = null
    ): CopilotAutomationLog {
        return CopilotAutomationLog::create([
            'copilot_application_id' => $application->id,
            'user_id' => $application->user_id,
            'step' => $step,
            'level' => $level,
            'message' => $message,
            'payload' => $payload,
            'screenshot_path' => $screenshotPath,
            'created_at' => now(),
        ]);
    }

    public function transformApplication(CopilotApplication $application): array
    {
        $application->loadMissing(['jobMatch.matchable', 'resume:id,title']);

        $job = $application->jobMatch?->matchable;
        $jobPayload = null;

        if ($job instanceof Job) {
            $jobPayload = [
                'source' => 'platform',
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->company,
                'emirate' => $job->emirate,
            ];
        } elseif ($job instanceof CopilotJob) {
            $jobPayload = [
                'source' => 'external',
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->company_name,
                'location' => $job->location,
            ];
        }

        return [
            'id' => $application->id,
            'job_match_id' => $application->job_match_id,
            'application_type' => $application->application_type,
            'status' => $application->status,
            'confidence_score' => $application->confidence_score,
            'confidence_breakdown' => ($application->metadata ?? [])['confidence_breakdown'] ?? null,
            'detected_screening' => ($application->metadata ?? [])['detected_screening'] ?? null,
            'apply_url' => $application->apply_url,
            'cover_letter' => $application->cover_letter,
            'error_message' => $application->error_message,
            'metadata' => $application->metadata,
            'submitted_at' => $application->submitted_at?->toIso8601String(),
            'created_at' => $application->created_at?->toIso8601String(),
            'job' => $jobPayload,
            'resume' => $application->resume ? [
                'id' => $application->resume->id,
                'title' => $application->resume->title,
            ] : null,
        ];
    }

    public function transformLog(CopilotAutomationLog $log): array
    {
        $application = $log->application ?? CopilotApplication::query()->find($log->copilot_application_id);

        return [
            'id' => $log->id,
            'step' => $log->step,
            'level' => $log->level,
            'message' => $log->message,
            'payload' => $log->payload,
            'screenshot_path' => $log->screenshot_path,
            'screenshot_url' => $application
                ? $this->screenshots->url($log->screenshot_path, $application)
                : null,
            'created_at' => $log->created_at?->toIso8601String(),
        ];
    }
}
