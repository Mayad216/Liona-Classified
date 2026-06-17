<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobSeekerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'location',
        'country',
        'linkedin_url',
        'portfolio_url',
        'github_url',
        'years_of_experience',
        'current_job_title',
        'target_job_titles',
        'target_industries',
        'preferred_locations',
        'remote_preference',
        'expected_salary_min',
        'expected_salary_max',
        'currency',
        'work_authorization',
        'requires_visa_sponsorship',
        'notice_period',
        'availability_date',
        'professional_summary',
        'completion',
    ];

    protected function casts(): array
    {
        return [
            'target_job_titles' => 'array',
            'target_industries' => 'array',
            'preferred_locations' => 'array',
            'requires_visa_sponsorship' => 'boolean',
            'years_of_experience' => 'integer',
            'expected_salary_min' => 'integer',
            'expected_salary_max' => 'integer',
            'availability_date' => 'date',
            'completion' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function screeningAnswers(): HasMany
    {
        return $this->hasMany(UserScreeningAnswer::class, 'user_id', 'user_id');
    }
}
