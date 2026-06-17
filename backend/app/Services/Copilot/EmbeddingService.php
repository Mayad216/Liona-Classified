<?php

namespace App\Services\Copilot;

use App\Models\CopilotEmbedding;
use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\JobSeekerProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EmbeddingService
{
    public function enabled(): bool
    {
        return (bool) config('copilot.embeddings.enabled', true)
            && (bool) config('copilot.openai_api_key');
    }

    public function model(): string
    {
        return (string) config('copilot.embeddings.model', 'text-embedding-3-small');
    }

    public function blendWeight(): float
    {
        return (float) config('copilot.embeddings.blend_weight', 0.3);
    }

    /**
     * @return list<float>|null
     */
    public function embedText(string $text): ?array
    {
        $key = config('copilot.openai_api_key');
        if (! $key || trim($text) === '') {
            return null;
        }

        $response = Http::withToken($key)
            ->timeout(30)
            ->post('https://api.openai.com/v1/embeddings', [
                'model' => $this->model(),
                'input' => Str::limit($text, 8000, ''),
            ]);

        if (! $response->successful()) {
            return null;
        }

        $vector = $response->json('data.0.embedding');

        return is_array($vector) ? array_map('floatval', $vector) : null;
    }

    public function embedModel(Model $model, string $text): ?CopilotEmbedding
    {
        $hash = hash('sha256', $text);
        $existing = CopilotEmbedding::query()
            ->where('embeddable_type', $model->getMorphClass())
            ->where('embeddable_id', $model->getKey())
            ->where('model', $this->model())
            ->first();

        if ($existing && $existing->text_hash === $hash) {
            return $existing;
        }

        $vector = $this->embedText($text);
        if (! $vector) {
            return $existing;
        }

        return CopilotEmbedding::updateOrCreate(
            [
                'embeddable_type' => $model->getMorphClass(),
                'embeddable_id' => $model->getKey(),
                'model' => $this->model(),
            ],
            [
                'text_hash' => $hash,
                'vector' => $vector,
            ]
        );
    }

    public function similarityForMatch(JobSeekerProfile $profile, ?array $resumeData, Job|CopilotJob $job): ?float
    {
        if (! $this->enabled()) {
            return null;
        }

        $candidateText = $this->candidateText($profile, $resumeData);
        $jobText = $job instanceof Job
            ? trim("{$job->title} {$job->company} {$job->description}")
            : $job->matchTextBlob();

        $candidateVector = $this->embedModel($profile, $candidateText)?->vector;
        $jobVector = $this->embedModel($job, $jobText)?->vector;

        if (! $candidateVector || ! $jobVector) {
            return null;
        }

        return $this->cosineSimilarity($candidateVector, $jobVector);
    }

    public function candidateText(JobSeekerProfile $profile, ?array $resumeData): string
    {
        $parts = array_filter([
            $profile->professional_summary,
            $profile->current_job_title,
            implode(' ', (array) ($profile->target_job_titles ?? [])),
            implode(' ', (array) ($profile->target_industries ?? [])),
        ]);

        if ($resumeData) {
            $parts[] = implode(' ', (array) ($resumeData['skills'] ?? []));
            $parts[] = (string) ($resumeData['summary'] ?? '');
        }

        return Str::limit(implode("\n", $parts), 8000, '');
    }

    /**
     * @param  list<float>  $a
     * @param  list<float>  $b
     */
    public function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;
        $len = min(count($a), count($b));

        for ($i = 0; $i < $len; $i++) {
            $dot += $a[$i] * $b[$i];
            $normA += $a[$i] ** 2;
            $normB += $b[$i] ** 2;
        }

        if ($normA <= 0 || $normB <= 0) {
            return 0.0;
        }

        $sim = $dot / (sqrt($normA) * sqrt($normB));

        return max(0, min(1, $sim));
    }
}
