<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CopilotBillingEvent extends Model
{
    protected $fillable = [
        'user_id',
        'event_type',
        'plan_slug',
        'stripe_event_id',
        'amount_aed',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'amount_aed' => 'integer',
            'payload' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
