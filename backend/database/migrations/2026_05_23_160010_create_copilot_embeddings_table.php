<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copilot_embeddings', function (Blueprint $table) {
            $table->id();
            $table->morphs('embeddable');
            $table->string('model', 64);
            $table->string('text_hash', 64);
            $table->json('vector');
            $table->timestamps();

            $table->unique(['embeddable_type', 'embeddable_id', 'model']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copilot_embeddings');
    }
};
