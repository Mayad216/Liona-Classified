<?php

namespace App\Services\Copilot;

use Illuminate\Support\Str;

class ScreeningDetectionService
{
    /**
     * Detect likely screening questions from job description text.
     *
     * @return list<array{key: string, text: string, source: string, confidence: float}>
     */
    public function detectFromText(string $text): array
    {
        $text = trim($text);
        if ($text === '') {
            return [];
        }

        $detected = [];
        $patterns = config('copilot.auto_apply.screening_patterns', []);

        foreach ($patterns as $pattern) {
            if (preg_match($pattern['regex'], $text, $matches)) {
                $question = trim($matches[0]);
                $detected[] = [
                    'key' => $pattern['key'],
                    'text' => $question,
                    'source' => 'pattern',
                    'confidence' => (float) ($pattern['confidence'] ?? 0.8),
                ];
            }
        }

        $lines = preg_split('/[\r\n]+/', $text) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (str_ends_with($line, '?') && strlen($line) >= 12 && strlen($line) <= 240) {
                $key = 'detected_'.substr(md5(Str::lower($line)), 0, 8);
                $duplicate = collect($detected)->contains(fn ($d) => Str::lower($d['text']) === Str::lower($line));
                if (! $duplicate) {
                    $detected[] = [
                        'key' => $key,
                        'text' => $line,
                        'source' => 'question_mark',
                        'confidence' => 0.65,
                    ];
                }
            }
        }

        return collect($detected)
            ->unique(fn ($item) => Str::lower($item['text']))
            ->sortByDesc('confidence')
            ->values()
            ->all();
    }

    /**
     * @param  list<array{needs_review: bool}>  $answers
     */
    public function unresolvedCount(array $answers): int
    {
        return collect($answers)->where('needs_review', true)->count();
    }
}
