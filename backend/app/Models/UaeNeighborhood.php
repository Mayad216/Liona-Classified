<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UaeNeighborhood extends Model
{
    protected $fillable = [
        'emirate_id',
        'dubizzle_id',
        'propertyfinder_id',
        'name_en',
        'name_ar',
        'slug',
        'level',
        'location_type',
        'latitude',
        'longitude',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'dubizzle_id' => 'integer',
            'propertyfinder_id' => 'integer',
            'level' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function emirate(): BelongsTo
    {
        return $this->belongsTo(UaeEmirate::class, 'emirate_id');
    }
}
