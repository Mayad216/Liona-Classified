<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copilot_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_match_id')->nullable()->constrained('job_matches')->nullOnDelete();
            $table->nullableMorphs('matchable');
            $table->foreignId('resume_id')->nullable()->constrained('resumes')->nullOnDelete();
            $table->string('application_type', 16)->default('auto');
            $table->string('status', 32)->default('queued')->index();
            $table->decimal('confidence_score', 5, 4)->nullable();
            $table->string('apply_url', 2048)->nullable();
            $table->text('cover_letter')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copilot_applications');
    }
};
