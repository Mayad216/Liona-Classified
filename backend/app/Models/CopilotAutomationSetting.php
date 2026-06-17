<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CopilotAutomationSetting extends Model
{
    protected $fillable = [
        'user_id',
        'daily_digest_enabled',
        'daily_digest_hour',
        'last_digest_at',
    ];

    protected function casts(): array
    {
        return [
            'daily_digest_enabled' => 'boolean',
            'last_digest_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
