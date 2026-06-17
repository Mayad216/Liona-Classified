<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserScreeningAnswer extends Model
{
    protected $fillable = [
        'user_id',
        'question_key',
        'question_text',
        'answer_text',
        'answer_type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
