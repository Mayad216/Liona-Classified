<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CopilotAutomationLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'copilot_application_id',
        'user_id',
        'step',
        'level',
        'message',
        'payload',
        'screenshot_path',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(CopilotApplication::class, 'copilot_application_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
