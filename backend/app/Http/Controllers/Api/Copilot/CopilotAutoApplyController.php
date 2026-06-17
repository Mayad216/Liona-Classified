<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Models\CopilotApplication;
use App\Models\JobMatch;
use App\Services\Copilot\AutoApplyService;
use Illuminate\Http\Request;

class CopilotAutoApplyController extends Controller
{
    public function __construct(protected AutoApplyService $autoApply)
    {
    }

    /** GET /api/v1/copilot/auto-apply/consent */
    public function consentStatus(Request $request)
    {
        $user = $request->user();
        $latest = $this->autoApply->latestConsent($user);

        return response()->json([
            'data' => [
                'has_consent' => $this->autoApply->hasActiveConsent($user),
                'consent_version' => $this->autoApply->consentVersion(),
                'consent_text' => $this->autoApply->consentText(),
                'latest' => $latest ? [
                    'consented_at' => $latest->consented_at?->toIso8601String(),
                    'ip_address' => $latest->ip_address,
                    'revoked_at' => $latest->revoked_at?->toIso8601String(),
                ] : null,
            ],
        ]);
    }

    /** POST /api/v1/copilot/auto-apply/consent */
    public function grantConsent(Request $request)
    {
        $request->validate([
            'accepted' => 'required|accepted',
        ]);

        $consent = $this->autoApply->recordConsent($request->user(), $request);

        return response()->json([
            'message' => 'Auto-apply consent recorded.',
            'data' => [
                'consented_at' => $consent->consented_at?->toIso8601String(),
                'consent_version' => $consent->consent_version,
            ],
        ], 201);
    }

    /** DELETE /api/v1/copilot/auto-apply/consent */
    public function revokeConsent(Request $request)
    {
        $this->autoApply->revokeConsent($request->user());

        return response()->json(['message' => 'Auto-apply consent revoked.']);
    }

    /** POST /api/v1/copilot/jobs/matches/{jobMatch}/auto-apply */
    public function queue(Request $request, JobMatch $jobMatch)
    {
        $result = $this->autoApply->queueForMatch($request->user(), $jobMatch);

        if (! $result['ok']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => 'Auto-apply queued.',
            'data' => $this->autoApply->transformApplication($result['application']),
        ], 202);
    }

    /** GET /api/v1/copilot/auto-apply/applications */
    public function applications(Request $request)
    {
        $apps = CopilotApplication::query()
            ->with(['jobMatch.matchable', 'resume:id,title'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate((int) $request->input('per_page', 20));

        $apps->getCollection()->transform(
            fn (CopilotApplication $app) => $this->autoApply->transformApplication($app)
        );

        return response()->json($apps);
    }

    /** GET /api/v1/copilot/auto-apply/applications/{copilotApplication} */
    public function show(Request $request, CopilotApplication $copilotApplication)
    {
        abort_unless($copilotApplication->user_id === $request->user()->id, 403);

        return response()->json([
            'data' => $this->autoApply->transformApplication(
                $copilotApplication->load(['jobMatch.matchable', 'resume:id,title'])
            ),
        ]);
    }

    /** GET /api/v1/copilot/auto-apply/applications/{copilotApplication}/logs */
    public function logs(Request $request, CopilotApplication $copilotApplication)
    {
        abort_unless($copilotApplication->user_id === $request->user()->id, 403);

        $logs = $copilotApplication->logs()
            ->orderBy('created_at')
            ->get()
            ->map(fn ($log) => $this->autoApply->transformLog($log));

        return response()->json(['data' => $logs]);
    }

    /** POST /api/v1/copilot/auto-apply/applications/{copilotApplication}/approve */
    public function approve(Request $request, CopilotApplication $copilotApplication)
    {
        $updated = $this->autoApply->approveApplication($request->user(), $copilotApplication);

        return response()->json([
            'message' => 'Application approved and marked as submitted.',
            'data' => $this->autoApply->transformApplication($updated),
        ]);
    }

    /** POST /api/v1/copilot/auto-apply/applications/{copilotApplication}/cancel */
    public function cancel(Request $request, CopilotApplication $copilotApplication)
    {
        $updated = $this->autoApply->cancelApplication($request->user(), $copilotApplication);

        return response()->json([
            'message' => 'Application cancelled.',
            'data' => $this->autoApply->transformApplication($updated),
        ]);
    }
}
