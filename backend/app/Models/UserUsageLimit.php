<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserUsageLimit extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'year',
        'job_recommendations_used',
        'ai_credits_used',
        'auto_applications_used',
        'auto_applications_today',
        'auto_applications_day',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'job_recommendations_used' => 'integer',
            'ai_credits_used' => 'integer',
            'auto_applications_used' => 'integer',
            'auto_applications_today' => 'integer',
            'auto_applications_day' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
