<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Services\Jobs\JobApplicationQuestionValidator;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function __construct(
        protected JobApplicationQuestionValidator $questionValidator
    ) {
    }

    public function index(Request $request)
    {
        $q = Job::where('status', 'active')->with('employer:id,name,avatar');

        if ($emirate = $request->string('emirate')->toString()) {
            $q->where('emirate', $emirate);
        }
        if ($type = $request->string('employment_type')->toString()) {
            $q->where('employment_type', $type);
        }
        if ($industry = $request->string('industry')->toString()) {
            $q->where('industry', $industry);
        }
        if ($exp = $request->string('experience_level')->toString()) {
            $q->where('experience_level', $exp);
        }
        if ($request->boolean('remote_only')) {
            $q->where('remote', true);
        }
        if ($search = $request->string('q')->toString()) {
            $q->where(fn ($w) => $w
                ->where('title', 'like', "%{$search}%")
                ->orWhere('company', 'like', "%{$search}%"));
        }

        return $q->orderByDesc('is_featured')->latest()->paginate(24);
    }

    public function show(Job $job)
    {
        return response()->json([
            'data' => $this->serializeJob($job->load('employer:id,name,avatar')),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user()->load('businessProfile');

        if (! $user->canPostJobs()) {
            return response()->json([
                'message' => 'Job listings can only be posted from a Business Profile. Complete your business profile first.',
            ], 403);
        }

        $data = $this->validatedJobPayload($request);

        if (empty($data['company'])) {
            $data['company'] = $user->businessProfile->company_name;
        }

        $job = $user->jobs()->create([
            ...$data,
            'status' => 'active',
        ]);

        return response()->json(['data' => $this->serializeJob($job)], 201);
    }

    public function update(Request $request, Job $job)
    {
        abort_unless($job->employer_id === $request->user()->id, 403);

        $user = $request->user()->load('businessProfile');
        if (! $user->canPostJobs()) {
            return response()->json([
                'message' => 'Job listings can only be managed from a Business Profile.',
            ], 403);
        }

        $job->update($this->validatedJobPayload($request));

        return response()->json(['data' => $this->serializeJob($job)]);
    }

    public function destroy(Request $request, Job $job)
    {
        abort_unless($job->employer_id === $request->user()->id, 403);
        $job->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function apply(Request $request, Job $job)
    {
        if ($job->application_method && $job->application_method !== 'platform') {
            return response()->json([
                'message' => 'This job accepts applications externally only.',
            ], 422);
        }

        $data = $request->validate([
            'cv_url' => ['nullable', 'url', 'required_without:resume_share_token'],
            'resume_share_token' => ['nullable', 'uuid', 'required_without:cv_url'],
            'cover_letter' => ['nullable', 'string', 'max:2000'],
            'answers' => ['nullable', 'array'],
        ]);

        $questions = $job->application_questions ?? [];
        $answers = $data['answers'] ?? [];
        $errors = $this->questionValidator->validateAnswers($questions, $answers);

        if ($errors !== []) {
            return response()->json([
                'message' => 'Please complete all required screening questions.',
                'errors' => $errors,
            ], 422);
        }

        $cvUrl = $data['cv_url'] ?? null;

        if (! empty($data['resume_share_token'])) {
            $resume = \App\Models\Resume::query()
                ->where('share_token', $data['resume_share_token'])
                ->where('is_public', true)
                ->firstOrFail();

            $cvUrl = url("/api/v1/resumes/share/{$resume->share_token}/download");
        }

        $application = $job->applications()->create([
            'user_id' => $request->user()->id,
            'cv_url' => $cvUrl ?? '',
            'cover_letter' => $data['cover_letter'] ?? null,
            'answers' => $answers,
            'status' => 'submitted',
        ]);

        return response()->json(['data' => $application], 201);
    }

    /**
     * @return array<string, mixed>
     */
    protected function validatedJobPayload(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'company' => ['required', 'string'],
            'description' => ['required', 'string'],
            'emirate' => ['required', 'string'],
            'area' => ['required', 'string'],
            'industry' => ['required', 'string'],
            'employment_type' => ['required', 'string'],
            'experience_level' => ['required', 'string'],
            'salary_min' => ['nullable', 'integer'],
            'salary_max' => ['nullable', 'integer'],
            'remote' => ['boolean'],
            'responsibilities' => ['array'],
            'requirements' => ['array'],
            'benefits' => ['array'],
            'application_method' => ['nullable', 'string', 'in:platform,external_email,external_url'],
            'application_contact' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'application_questions' => ['nullable', 'array'],
            'application_questions.*.template_id' => ['required_with:application_questions', 'string', 'max:80'],
            'application_questions.*.label' => ['required_with:application_questions', 'string', 'max:255'],
            'application_questions.*.type' => ['required_with:application_questions', 'string', 'max:40'],
            'application_questions.*.required' => ['boolean'],
            'application_questions.*.options' => ['nullable', 'array'],
            'application_questions.*.help_text' => ['nullable', 'string', 'max:500'],
            'application_questions.*.placeholder' => ['nullable', 'string', 'max:160'],
            'application_questions.*.source' => ['nullable', 'string', 'max:40'],
        ]);

        $method = $data['application_method'] ?? 'platform';
        if (in_array($method, ['external_email', 'external_url'], true) && empty($data['application_contact'])) {
            abort(response()->json([
                'message' => 'Application contact is required for external applications.',
                'errors' => ['application_contact' => ['Provide an email address or application URL.']],
            ], 422));
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeJob(Job $job): array
    {
        return [
            'id' => $job->id,
            'employer_id' => $job->employer_id,
            'title' => $job->title,
            'company' => $job->company,
            'company_logo' => $job->company_logo,
            'description' => $job->description,
            'responsibilities' => $job->responsibilities ?? [],
            'requirements' => $job->requirements ?? [],
            'benefits' => $job->benefits ?? [],
            'emirate' => $job->emirate,
            'area' => $job->area,
            'industry' => $job->industry,
            'employment_type' => $job->employment_type,
            'experience_level' => $job->experience_level,
            'salary_min' => $job->salary_min,
            'salary_max' => $job->salary_max,
            'remote' => $job->remote,
            'is_featured' => $job->is_featured,
            'status' => $job->status,
            'application_method' => $job->application_method ?? 'platform',
            'application_contact' => $job->application_contact,
            'start_date' => $job->start_date?->format('Y-m-d'),
            'application_questions' => $job->application_questions ?? [],
            'created_at' => $job->created_at,
            'updated_at' => $job->updated_at,
            'employer' => $job->relationLoaded('employer') ? $job->employer : null,
        ];
    }
}
