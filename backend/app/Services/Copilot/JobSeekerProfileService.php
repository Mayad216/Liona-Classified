<?php

namespace App\Services\Copilot;

class JobSeekerProfileService
{
    /** @var list<string> */
    private const COMPLETION_FIELDS = [
        'full_name',
        'phone',
        'location',
        'country',
        'current_job_title',
        'target_job_titles',
        'preferred_locations',
        'remote_preference',
        'work_authorization',
        'years_of_experience',
        'professional_summary',
    ];

    /**
     * @param  array<string, mixed>  $data
     */
    public function calculateCompletion(array $data): float
    {
        $filled = 0;

        foreach (self::COMPLETION_FIELDS as $field) {
            $value = $data[$field] ?? null;

            if ($field === 'remote_preference') {
                if ($value && $value !== 'any') {
                    $filled++;
                } elseif ($value === 'any') {
                    $filled += 0.5;
                }
                continue;
            }

            if (is_array($value) && count($value) > 0) {
                $filled++;
            } elseif (is_string($value) && trim($value) !== '') {
                $filled++;
            } elseif (is_int($value) && $value >= 0) {
                $filled++;
            }
        }

        $total = count(self::COMPLETION_FIELDS);

        return $total > 0 ? round(min(1, $filled / $total), 2) : 0;
    }

    /**
     * @return list<string>
     */
    public function missingFields(array $data): array
    {
        $missing = [];

        foreach (self::COMPLETION_FIELDS as $field) {
            $value = $data[$field] ?? null;
            $isFilled = false;

            if (is_array($value) && count($value) > 0) {
                $isFilled = true;
            } elseif (is_string($value) && trim($value) !== '') {
                $isFilled = true;
            } elseif (is_int($value)) {
                $isFilled = true;
            } elseif ($field === 'remote_preference' && $value && $value !== 'any') {
                $isFilled = true;
            }

            if (! $isFilled) {
                $missing[] = $field;
            }
        }

        return $missing;
    }
}
