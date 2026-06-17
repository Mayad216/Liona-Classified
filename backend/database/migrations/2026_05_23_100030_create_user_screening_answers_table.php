<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_screening_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('question_key', 64);
            $table->text('question_text');
            $table->text('answer_text');
            $table->string('answer_type', 32)->default('text');
            $table->timestamps();

            $table->unique(['user_id', 'question_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_screening_answers');
    }
};
