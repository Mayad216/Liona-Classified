<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'legal_name',
        'trade_licence_number',
        'industry',
        'emirate',
        'website',
        'contact_email',
        'contact_phone',
        'description',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isComplete(): bool
    {
        return filled($this->company_name)
            && filled($this->industry)
            && filled($this->emirate);
    }
}
