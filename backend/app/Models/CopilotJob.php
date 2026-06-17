<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CopilotJob extends Model
{
    protected $fillable = [
        'job_source_id',
        'external_job_id',
        'company_name',
        'title',
        'description',
        'requirements',
        'responsibilities',
        'location',
        'country',
        'remote_type',
        'employment_type',
        'salary_min',
        'salary_max',
        'currency',
        'application_url',
        'source_url',
        'posted_at',
        'expires_at',
        'status',
        'raw_data',
    ];

    protected function casts(): array
    {
        return [
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'posted_at' => 'datetime',
            'expires_at' => 'datetime',
            'raw_data' => 'array',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(JobSource::class, 'job_source_id');
    }

    public function matches(): MorphMany
    {
        return $this->morphMany(JobMatch::class, 'matchable');
    }

    public function saves(): MorphMany
    {
        return $this->morphMany(SavedJob::class, 'saveable');
    }

    public function isRemote(): bool
    {
        return in_array($this->remote_type, ['remote', 'hybrid'], true);
    }

    public function matchTextBlob(): string
    {
        return strtolower(implode(' ', array_filter([
            $this->title,
            $this->company_name,
            $this->description,
            $this->requirements,
            $this->responsibilities,
            $this->location,
        ])));
    }
}
