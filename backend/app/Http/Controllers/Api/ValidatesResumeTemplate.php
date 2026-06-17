<?php

namespace App\Http\Controllers\Api;

use Illuminate\Validation\Rule;

trait ValidatesResumeTemplate
{
    /** @return array<int, mixed> */
    protected function resumeTemplateRules(bool $required = false): array
    {
        $keys = array_keys(config('resume_templates', []));

        $rule = Rule::in($keys);

        return [$required ? 'required' : 'nullable', 'string', $rule];
    }

    public function templates()
    {
        $atsConfig = config('ats_platforms', []);
        $threshold = (int) ($atsConfig['approval_threshold'] ?? 90);

        $items = collect(config('resume_templates', []))->map(function ($meta, $id) use ($threshold) {
            $optimizedFor = $meta['optimized_for'] ?? null;
            $approvedPlatforms = $meta['approved_platforms'] ?? [];

            return [
                'id' => $id,
                'label' => $meta['label'] ?? $id,
                'blurb' => $meta['blurb'] ?? null,
                'optimized_for' => $optimizedFor,
                'ats_approved' => count($approvedPlatforms) > 0,
                'approved_platforms' => $approvedPlatforms,
                'average_score' => $meta['average_score'] ?? null,
                'recommended_export' => $meta['recommended_export'] ?? null,
            ];
        })->values();

        return response()->json([
            'data' => $items,
            'platforms' => $atsConfig['platforms'] ?? [],
            'approval_threshold' => $threshold,
        ]);
    }
}
