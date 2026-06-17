<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'title',
        'description',
        'emirate',
        'area',
        'price',
        'deposit',
        'room_type',
        'size_sqft',
        'tenants_count',
        'attached_bathroom',
        'balcony',
        'distance_to_metro_km',
        'gender_preference',
        'nationality_preference',
        'listed_by',
        'amenities',
        'photos',
        'is_featured',
        'is_published',
        'status', // pending, active, rejected, expired
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'deposit' => 'decimal:2',
            'size_sqft' => 'integer',
            'tenants_count' => 'integer',
            'attached_bathroom' => 'boolean',
            'balcony' => 'boolean',
            'distance_to_metro_km' => 'float',
            'amenities' => 'array',
            'photos' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->where('status', 'active');
    }
}
