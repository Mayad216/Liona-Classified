<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UaeEmirate extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'dubizzle_city_id',
        'dubizzle_subdomain',
        'sort_order',
    ];

    public function neighborhoods(): HasMany
    {
        return $this->hasMany(UaeNeighborhood::class, 'emirate_id');
    }
}
