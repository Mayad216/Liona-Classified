<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Models\CopilotApplication;
use App\Services\Copilot\AutoApplyService;
use App\Services\Copilot\ScreenshotStorageService;
use Illuminate\Http\Request;

class CopilotAutoApplyWorkerController extends Controller
{
    public function __construct(
        protected AutoApplyService $autoApply,
        protected ScreenshotStorageService $screenshots
    ) {
    }

    /** POST /api/v1/copilot/auto-apply/worker/report */
    public function report(Request $request)
    {
        $request->validate([
            'application_id' => 'required|integer|exists:copilot_applications,id',
            'status' => 'required|string|in:submitted,needs_review,failed',
            'confidence_score' => 'nullable|numeric|min:0|max:1',
            'cover_letter' => 'nullable|string',
            'error_message' => 'nullable|string',
            'confidence_breakdown' => 'nullable|array',
            'detected_screening' => 'nullable|array',
            'logs' => 'nullable|array',
        ]);

        $application = CopilotApplication::query()->findOrFail($request->integer('application_id'));

        if ($application->isTerminal()) {
            return response()->json(['message' => 'Application already finalized.'], 409);
        }

        $updated = $this->autoApply->handleWorkerReport($application, $request->all());

        return response()->json([
            'message' => 'Worker report accepted.',
            'data' => $this->autoApply->transformApplication($updated),
        ]);
    }

    /** GET /api/v1/copilot/auto-apply/worker/pending */
    public function pending(Request $request)
    {
        $limit = min(10, (int) $request->input('limit', 5));

        $apps = CopilotApplication::query()
            ->with(['user.jobSeekerProfile', 'user.screeningAnswers', 'resume', 'jobMatch.matchable'])
            ->where('status', 'running')
            ->where('application_type', 'auto')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (CopilotApplication $app) {
                return [
                    'application_id' => $app->id,
                    'apply_url' => $app->apply_url,
                    'profile' => $app->user->jobSeekerProfile?->toArray(),
                    'resume' => $app->resume?->data,
                    'screening_answers' => $app->user->screeningAnswers->map(fn ($a) => [
                        'question_key' => $a->question_key,
                        'question_text' => $a->question_text,
                        'answer_text' => $a->answer_text,
                    ])->values()->all(),
                ];
            });

        return response()->json(['data' => $apps]);
    }

    /** POST /api/v1/copilot/auto-apply/worker/screenshot */
    public function screenshot(Request $request)
    {
        $request->validate([
            'application_id' => 'required|integer|exists:copilot_applications,id',
            'step' => 'nullable|string|max:64',
            'image_base64' => 'required|string',
        ]);

        $application = CopilotApplication::query()->findOrFail($request->integer('application_id'));
        $path = $this->screenshots->storeBase64(
            $application,
            $request->string('image_base64')->toString(),
            $request->string('step')->toString() ?: 'screenshot'
        );

        $this->autoApply->log(
            $application,
            $request->string('step')->toString() ?: 'screenshot',
            'Screenshot captured by worker.',
            null,
            'info',
            $path
        );

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => $this->screenshots->url($path, $application),
            ],
        ]);
    }
}
