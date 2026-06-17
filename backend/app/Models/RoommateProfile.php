<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoommateProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'age',
        'gender',
        'occupation',
        'bio',
        'listing_id',
        'monthly_budget_aed',
        'move_in_date',
        'lease_duration',
        'preferences',
        'looking_for',
        'dealbreakers',
        'is_discoverable',
        'match_views',
        'completion',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'looking_for' => 'array',
            'dealbreakers' => 'array',
            'age' => 'integer',
            'monthly_budget_aed' => 'integer',
            'move_in_date' => 'date:Y-m-d',
            'is_discoverable' => 'boolean',
            'match_views' => 'integer',
            'completion' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
