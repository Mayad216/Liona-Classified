<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Job extends Model
{
    use HasFactory;

    protected $table = 'job_posts';

    protected $fillable = [
        'employer_id',
        'title',
        'company',
        'company_logo',
        'description',
        'responsibilities',
        'requirements',
        'benefits',
        'emirate',
        'area',
        'industry',
        'employment_type',
        'experience_level',
        'salary_min',
        'salary_max',
        'remote',
        'is_featured',
        'status',
        'application_method',
        'application_contact',
        'start_date',
        'application_questions',
    ];

    protected function casts(): array
    {
        return [
            'responsibilities' => 'array',
            'requirements' => 'array',
            'benefits' => 'array',
            'application_questions' => 'array',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'remote' => 'boolean',
            'is_featured' => 'boolean',
            'start_date' => 'date:Y-m-d',
        ];
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function copilotMatches(): MorphMany
    {
        return $this->morphMany(JobMatch::class, 'matchable');
    }

    public function copilotSaves(): MorphMany
    {
        return $this->morphMany(SavedJob::class, 'saveable');
    }

    public function isRemote(): bool
    {
        return (bool) $this->remote;
    }

    public function matchTextBlob(): string
    {
        $requirements = is_array($this->requirements)
            ? implode(' ', $this->requirements)
            : (string) $this->requirements;

        return strtolower(implode(' ', array_filter([
            $this->title,
            $this->company,
            $this->description,
            $requirements,
            $this->industry,
            $this->emirate,
            $this->area,
        ])));
    }
}
