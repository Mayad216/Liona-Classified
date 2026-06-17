<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'title',
        'description',
        'category',
        'price_from',
        'unit',
        'emirate',
        'photos',
        'response_time',
        'completed_jobs',
        'is_verified',
        'rating',
        'review_count',
    ];

    protected function casts(): array
    {
        return [
            'price_from' => 'decimal:2',
            'photos' => 'array',
            'completed_jobs' => 'integer',
            'is_verified' => 'boolean',
            'rating' => 'float',
            'review_count' => 'integer',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(ServiceBooking::class);
    }
}
