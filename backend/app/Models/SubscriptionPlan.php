<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'price_monthly',
        'price_yearly',
        'currency',
        'auto_apply_enabled',
        'monthly_application_limit',
        'daily_application_limit',
        'ai_credit_limit',
        'features',
        'stripe_price_monthly_id',
        'stripe_price_yearly_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_monthly' => 'integer',
            'price_yearly' => 'integer',
            'auto_apply_enabled' => 'boolean',
            'monthly_application_limit' => 'integer',
            'daily_application_limit' => 'integer',
            'ai_credit_limit' => 'integer',
            'features' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
