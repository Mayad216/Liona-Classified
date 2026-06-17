<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Jobs\ParseResumeJob;
use App\Models\Resume;
use App\Services\Copilot\ResumeParserService;
use Illuminate\Http\Request;

class CopilotResumeController extends Controller
{
    public function __construct(protected ResumeParserService $parser)
    {
    }

    /** GET /api/v1/copilot/resumes */
    public function index(Request $request)
    {
        $resumes = Resume::query()
            ->where('user_id', $request->user()->id)
            ->latest('updated_at')
            ->get(['id', 'title', 'template', 'is_default', 'parse_status', 'ats_score', 'original_file_name', 'file_path', 'updated_at']);

        return response()->json(['data' => $resumes]);
    }

    /** POST /api/v1/copilot/resumes/upload */
    public function upload(Request $request)
    {
        $maxKb = (int) config('copilot.upload.max_kb', 5120);

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:'.$maxKb,
                'mimes:pdf,txt',
            ],
            'title' => ['nullable', 'string', 'max:120'],
        ]);

        $resume = $this->parser->storeUpload($validated['file'], $request->user()->id);

        if (! empty($validated['title'])) {
            $resume->update(['title' => $validated['title']]);
        }

        ParseResumeJob::dispatch($resume->id);

        return response()->json([
            'data' => $resume->fresh(),
            'message' => 'Resume uploaded. Parsing has started.',
        ], 201);
    }

    /** POST /api/v1/copilot/resumes/{resume}/parse */
    public function parse(Request $request, Resume $resume)
    {
        $this->authorizeResume($request, $resume);

        if ($resume->file_path) {
            ParseResumeJob::dispatch($resume->id);

            return response()->json([
                'data' => $resume->fresh(),
                'message' => 'Parsing queued.',
            ]);
        }

        $parsed = $this->parser->parse($resume);

        return response()->json(['data' => $parsed]);
    }

    /** POST /api/v1/copilot/resumes/{resume}/set-default */
    public function setDefault(Request $request, Resume $resume)
    {
        $this->authorizeResume($request, $resume);
        $this->parser->setDefault($request->user()->id, $resume);

        return response()->json(['data' => $resume->fresh()]);
    }

    /** GET /api/v1/copilot/resumes/{resume} */
    public function show(Request $request, Resume $resume)
    {
        $this->authorizeResume($request, $resume);

        return response()->json(['data' => $resume]);
    }

    private function authorizeResume(Request $request, Resume $resume): void
    {
        if ($resume->user_id !== $request->user()->id) {
            abort(403, 'You do not own this resume.');
        }
    }
}
