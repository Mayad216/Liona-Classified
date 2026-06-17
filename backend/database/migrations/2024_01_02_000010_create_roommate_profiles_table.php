<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roommate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();

            // Display fields (mirror what the React side stores).
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('occupation')->nullable();
            $table->text('bio')->nullable();
            $table->foreignId('listing_id')->nullable()->constrained()->nullOnDelete();

            // The actual preference answers, keyed by dimension.key.
            $table->json('preferences');

            // Optional mirror of what the user is looking for in a roommate.
            $table->json('looking_for')->nullable();

            // Cached engagement metrics (updated by the engine).
            $table->unsignedInteger('match_views')->default(0);
            $table->float('completion')->default(0); // 0..1

            $table->timestamps();
        });

        // Optional: cache of computed pairwise scores so the UI is snappy.
        Schema::create('roommate_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seeker_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('score'); // 0..100
            $table->json('breakdown'); // per-dimension DimensionScore[]
            $table->timestamp('computed_at')->useCurrent();
            $table->unique(['seeker_id', 'candidate_id']);
            $table->index(['seeker_id', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roommate_matches');
        Schema::dropIfExists('roommate_profiles');
    }
};
