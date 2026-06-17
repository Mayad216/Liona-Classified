<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Models\CopilotApplication;
use App\Models\JobMatch;
use App\Models\Resume;
use App\Services\Copilot\AutoApplyService;
use App\Services\Copilot\JobSeekerProfileService;
use App\Services\Copilot\UsageLimitService;
use Illuminate\Http\Request;

class CopilotDashboardController extends Controller
{
    public function __construct(
        protected JobSeekerProfileService $profiles,
        protected UsageLimitService $usage,
        protected AutoApplyService $autoApply
    ) {
    }

    /** GET /api/v1/copilot/dashboard */
    public function index(Request $request)
    {
        $user = $request->user();
        $profile = $user->jobSeekerProfile;
        $planConfig = $user->copilotPlanConfig();

        $resumes = Resume::query()
            ->where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'is_default', 'parse_status', 'ats_score', 'updated_at']);

        $defaultResume = $resumes->firstWhere('is_default', true) ?? $resumes->first();

        $applications = CopilotApplication::query()
            ->with(['jobMatch.matchable', 'resume:id,title'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (CopilotApplication $app) => $this->autoApply->transformApplication($app));

        $profileData = $profile?->toArray() ?? [];
        $completion = $profile?->completion ?? 0;
        $missing = $this->profiles->missingFields($profileData);

        $nextSteps = [];
        if ($completion < 0.5) {
            $nextSteps[] = 'Complete your job seeker profile to unlock better matches.';
        }
        if ($resumes->isEmpty()) {
            $nextSteps[] = 'Upload a resume or build one in the Resume Builder.';
        } elseif ($resumes->where('parse_status', 'completed')->isEmpty()) {
            $nextSteps[] = 'Wait for resume parsing to finish or retry parsing.';
        }
        if ($applications->isEmpty()) {
            $nextSteps[] = $user->canUseAutoApply()
                ? 'Enable auto-apply on recommended jobs or apply manually.'
                : 'Browse recommended jobs and apply manually while auto-apply is unavailable on Free.';
        }

        $topMatches = JobMatch::query()
            ->with('matchable')
            ->where('user_id', $user->id)
            ->where('recommendation_status', 'recommended')
            ->orderByDesc('match_score')
            ->limit(5)
            ->get()
            ->map(function (JobMatch $m) {
                $job = $m->matchable;
                $title = 'Job';
                $company = '';

                if ($job instanceof \App\Models\Job) {
                    $title = $job->title;
                    $company = $job->company;
                } elseif ($job instanceof \App\Models\CopilotJob) {
                    $title = $job->title;
                    $company = $job->company_name;
                }

                return [
                    'id' => $m->id,
                    'match_score' => $m->match_score,
                    'match_reason' => $m->match_reason,
                    'title' => $title,
                    'company' => $company,
                ];
            });

        if ($topMatches->isEmpty() && $completion >= 0.3) {
            $nextSteps[] = 'Recalculate job matches from the Recommended Jobs page.';
        }

        return response()->json([
            'data' => [
                'plan' => [
                    'slug' => $user->plan,
                    'name' => $planConfig['name'] ?? 'Free',
                    'subscription_status' => $user->subscription_status,
                    'is_premium' => $user->isPremium(),
                    'auto_apply_enabled' => (bool) ($planConfig['auto_apply'] ?? false),
                ],
                'profile' => [
                    'completion' => $completion,
                    'missing_fields' => $missing,
                    'record' => $profile,
                ],
                'resumes' => [
                    'count' => $resumes->count(),
                    'default' => $defaultResume,
                    'items' => $resumes,
                ],
                'applications' => [
                    'total' => CopilotApplication::where('user_id', $user->id)->count(),
                    'recent' => $applications,
                ],
                'auto_apply' => [
                    'has_consent' => $this->autoApply->hasActiveConsent($user),
                    'can_auto_apply' => $user->hasRemainingApplicationCredits(),
                ],
                'top_matches' => $topMatches,
                'ai_usage' => $this->usage->aiUsageSummary($user),
                'usage' => $this->usage->fullUsageSummary($user),
                'next_steps' => $nextSteps,
            ],
        ]);
    }

    /** GET /api/v1/copilot/applications */
    public function applications(Request $request)
    {
        $items = CopilotApplication::query()
            ->with(['jobMatch.matchable', 'resume:id,title'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        $items->getCollection()->transform(
            fn (CopilotApplication $app) => $this->autoApply->transformApplication($app)
        );

        return response()->json($items);
    }

    /** GET /api/v1/copilot/pricing */
    public function pricing()
    {
        $plans = \App\Models\SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price_monthly')
            ->get();

        return response()->json([
            'data' => [
                'plans' => $plans,
                'credit_packs' => config('copilot.credit_packs'),
                'currency' => 'AED',
                'stripe_enabled' => app(\App\Services\Copilot\SubscriptionService::class)->stripeEnabled(),
            ],
        ]);
    }
}
