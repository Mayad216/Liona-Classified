<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Services\ResumeBuilderTemplateService;
use App\Services\ResumeDataSanitizer;
use App\Services\ResumePdfService;
use App\Services\ResumeTemplateRenderer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResumeController extends Controller
{
    use ValidatesResumeTemplate;

    public function index(Request $request)
    {
        $resumes = Resume::query()
            ->where('user_id', $request->user()->id)
            ->latest('updated_at')
            ->get();

        return response()->json(['data' => $resumes]);
    }

    public function store(Request $request, ResumeDataSanitizer $sanitizer)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:120'],
            'template' => $this->resumeTemplateRules(required: false),
            'data' => ['nullable', 'array'],
        ]);

        $data = array_replace_recursive(
            Resume::emptyData(),
            $validated['data'] ?? []
        );

        $resume = Resume::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'] ?? 'Untitled Resume',
            'template' => $validated['template'] ?? 'modern',
            'data' => $sanitizer->sanitize($data),
        ]);

        return response()->json(['data' => $resume], 201);
    }

    public function show(Request $request, Resume $resume)
    {
        $this->authorize('view', $resume);

        return response()->json(['data' => $resume]);
    }

    public function update(Request $request, Resume $resume, ResumeDataSanitizer $sanitizer)
    {
        $this->authorize('update', $resume);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:120'],
            'template' => ['sometimes', ...array_slice($this->resumeTemplateRules(), 1)],
            'data' => ['sometimes', 'array'],
            'is_public' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['data'])) {
            $validated['data'] = $sanitizer->sanitize(
                array_replace_recursive($resume->data, $validated['data'])
            );
        }

        $resume->update($validated);

        return response()->json(['data' => $resume->fresh()]);
    }

    public function destroy(Request $request, Resume $resume)
    {
        $this->authorize('delete', $resume);
        $resume->delete();

        return response()->json(['message' => 'Resume deleted']);
    }

    public function preview(Request $request, Resume $resume, ResumeTemplateRenderer $renderer)
    {
        $this->authorize('view', $resume);

        return response($renderer->render($resume), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    public function download(Request $request, Resume $resume, ResumePdfService $pdf)
    {
        $this->authorize('view', $resume);

        return $pdf->download($resume);
    }

    public function publish(Request $request, Resume $resume)
    {
        $this->authorize('update', $resume);

        $validated = $request->validate([
            'is_public' => ['required', 'boolean'],
        ]);

        $resume->update($validated);

        return response()->json([
            'data' => $resume,
            'share_url' => url("/resume/share/{$resume->share_token}"),
        ]);
    }

    public function guestStore(Request $request, ResumeDataSanitizer $sanitizer)
    {
        $guestToken = (string) Str::uuid();

        $resume = Resume::create([
            'guest_token' => $guestToken,
            'title' => 'Untitled Resume',
            'template' => 'modern',
            'data' => $sanitizer->sanitize(Resume::emptyData()),
        ]);

        return response()->json([
            'data' => $resume,
            'guest_token' => $guestToken,
        ], 201);
    }

    public function guestShow(Request $request, Resume $resume)
    {
        $this->ensureGuestAccess($request, $resume);

        return response()->json(['data' => $resume]);
    }

    public function guestUpdate(Request $request, Resume $resume, ResumeDataSanitizer $sanitizer)
    {
        $this->ensureGuestAccess($request, $resume);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:120'],
            'template' => ['sometimes', ...array_slice($this->resumeTemplateRules(), 1)],
            'data' => ['sometimes', 'array'],
        ]);

        if (isset($validated['data'])) {
            $validated['data'] = $sanitizer->sanitize(
                array_replace_recursive($resume->data, $validated['data'])
            );
        }

        $resume->update($validated);

        return response()->json(['data' => $resume->fresh()]);
    }

    public function guestDownload(Request $request, Resume $resume, ResumePdfService $pdf)
    {
        $this->ensureGuestAccess($request, $resume);

        return $pdf->download($resume);
    }

    public function publicShow(string $shareToken, ResumeTemplateRenderer $renderer)
    {
        $resume = Resume::where('share_token', $shareToken)
            ->where('is_public', true)
            ->firstOrFail();

        return response($renderer->render($resume), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    public function publicJson(string $shareToken)
    {
        $resume = Resume::where('share_token', $shareToken)
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json(['data' => $resume]);
    }

    public function publicDownload(string $shareToken, ResumePdfService $pdf)
    {
        $resume = Resume::where('share_token', $shareToken)
            ->where('is_public', true)
            ->firstOrFail();

        return $pdf->download($resume);
    }

    public function claimGuest(Request $request)
    {
        $validated = $request->validate([
            'guest_token' => ['required', 'uuid'],
        ]);

        Resume::query()
            ->where('guest_token', $validated['guest_token'])
            ->whereNull('user_id')
            ->update([
                'user_id' => $request->user()->id,
                'guest_token' => null,
            ]);

        return response()->json(['message' => 'Guest resumes linked to your account']);
    }

    public function subscribePro(Request $request)
    {
        Resume::query()
            ->where('user_id', $request->user()->id)
            ->update(['watermark' => false]);

        return response()->json([
            'message' => 'Resume Pro activated',
            'plan' => 'pro',
        ]);
    }

    public function resumeBuilderTemplates(ResumeBuilderTemplateService $service)
    {
        return response()->json(['data' => $service->catalog()]);
    }

    private function ensureGuestAccess(Request $request, Resume $resume): void
    {
        $token = $request->header('X-Guest-Token');

        if (! $resume->ownedBy(null, $token)) {
            abort(403, 'Invalid guest token');
        }
    }
}
