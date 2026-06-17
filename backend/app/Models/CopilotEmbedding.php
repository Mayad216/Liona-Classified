<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CopilotEmbedding extends Model
{
    protected $fillable = ['embeddable_type', 'embeddable_id', 'model', 'text_hash', 'vector'];

    protected function casts(): array
    {
        return ['vector' => 'array'];
    }

    public function embeddable()
    {
        return $this->morphTo();
    }
}
