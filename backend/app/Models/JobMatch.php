<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JobMatch extends Model
{
    protected $fillable = [
        'user_id',
        'matchable_type',
        'matchable_id',
        'match_score',
        'semantic_score',
        'scoring_method',
        'match_reason',
        'missing_skills',
        'matched_skills',
        'salary_match',
        'location_match',
        'experience_match',
        'work_authorization_match',
        'recommendation_status',
    ];

    protected function casts(): array
    {
        return [
            'match_score' => 'float',
            'semantic_score' => 'float',
            'missing_skills' => 'array',
            'matched_skills' => 'array',
            'salary_match' => 'boolean',
            'location_match' => 'boolean',
            'experience_match' => 'boolean',
            'work_authorization_match' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matchable(): MorphTo
    {
        return $this->morphTo();
    }
}
