<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('matchable');
            $table->decimal('match_score', 5, 2)->default(0);
            $table->text('match_reason')->nullable();
            $table->json('missing_skills')->nullable();
            $table->json('matched_skills')->nullable();
            $table->boolean('salary_match')->default(false);
            $table->boolean('location_match')->default(false);
            $table->boolean('experience_match')->default(false);
            $table->boolean('work_authorization_match')->default(true);
            $table->enum('recommendation_status', ['recommended', 'hidden', 'saved', 'dismissed'])
                ->default('recommended');
            $table->timestamps();

            $table->unique(['user_id', 'matchable_type', 'matchable_id']);
            $table->index(['user_id', 'match_score']);
            $table->index(['user_id', 'recommendation_status']);
        });

        Schema::create('saved_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('saveable');
            $table->timestamps();

            $table->unique(['user_id', 'saveable_type', 'saveable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_jobs');
        Schema::dropIfExists('job_matches');
    }
};
