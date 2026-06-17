<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->uuid('guest_token')->nullable()->index();
            $table->string('title')->default('Untitled Resume');
            $table->string('template', 32)->default('modern');
            $table->json('data');
            $table->uuid('share_token')->nullable()->unique();
            $table->boolean('is_public')->default(false);
            $table->boolean('watermark')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resumes');
    }
};
