<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CopilotApplication extends Model
{
    protected $fillable = [
        'user_id',
        'job_match_id',
        'matchable_type',
        'matchable_id',
        'resume_id',
        'application_type',
        'status',
        'confidence_score',
        'apply_url',
        'cover_letter',
        'error_message',
        'metadata',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence_score' => 'float',
            'metadata' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobMatch(): BelongsTo
    {
        return $this->belongsTo(JobMatch::class);
    }

    public function matchable(): MorphTo
    {
        return $this->morphTo();
    }

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(CopilotAutomationLog::class);
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, ['submitted', 'failed', 'cancelled'], true);
    }
}
