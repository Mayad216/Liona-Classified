<?php

namespace App\Services\Jobs;

class JobApplicationQuestionValidator
{
    /**
     * @param  array<int, array<string, mixed>>  $questions
     * @param  array<string, mixed>  $answers
     * @return array<string, string>
     */
    public function validateAnswers(array $questions, array $answers): array
    {
        $errors = [];

        foreach ($questions as $question) {
            $key = (string) ($question['template_id'] ?? $question['id'] ?? '');
            if ($key === '') {
                continue;
            }

            $required = (bool) ($question['required'] ?? false);
            $value = $answers[$key] ?? null;

            if (! $required) {
                continue;
            }

            if ($value === null || $value === '' || (is_array($value) && count($value) === 0)) {
                $label = (string) ($question['label'] ?? 'This question');
                $errors[$key] = "{$label} is required.";

                continue;
            }
        }

        return $errors;
    }
}
