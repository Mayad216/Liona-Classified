<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityTopic extends Model
{
    protected $fillable = ['user_id', 'title', 'tag', 'replies_count', 'last_activity_at', 'pinned'];

    protected function casts(): array
    {
        return [
            'last_activity_at' => 'datetime',
            'pinned' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
