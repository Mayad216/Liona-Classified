<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copilot_scrape_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_source_id')->constrained('job_sources')->cascadeOnDelete();
            $table->string('status', 32)->default('running');
            $table->unsignedInteger('jobs_found')->default(0);
            $table->unsignedInteger('jobs_imported')->default(0);
            $table->unsignedInteger('jobs_updated')->default(0);
            $table->unsignedInteger('jobs_skipped')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index(['job_source_id', 'started_at']);
        });

        Schema::table('job_matches', function (Blueprint $table) {
            $table->decimal('semantic_score', 5, 2)->nullable()->after('match_score');
            $table->string('scoring_method', 32)->default('deterministic')->after('semantic_score');
        });
    }

    public function down(): void
    {
        Schema::table('job_matches', function (Blueprint $table) {
            $table->dropColumn(['semantic_score', 'scoring_method']);
        });

        Schema::dropIfExists('copilot_scrape_runs');
    }
};
