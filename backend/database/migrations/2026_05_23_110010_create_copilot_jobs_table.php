<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copilot_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_source_id')->nullable()->constrained('job_sources')->nullOnDelete();
            $table->string('external_job_id')->nullable()->index();
            $table->string('company_name');
            $table->string('title');
            $table->longText('description');
            $table->longText('requirements')->nullable();
            $table->longText('responsibilities')->nullable();
            $table->string('location')->nullable();
            $table->string('country', 64)->default('UAE');
            $table->enum('remote_type', ['remote', 'hybrid', 'onsite', 'unknown'])->default('unknown');
            $table->enum('employment_type', [
                'full_time', 'part_time', 'contract', 'internship', 'temporary', 'unknown',
            ])->default('unknown');
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('currency', 8)->default('AED');
            $table->string('application_url')->nullable();
            $table->string('source_url')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['active', 'expired', 'duplicate', 'hidden'])->default('active')->index();
            $table->json('raw_data')->nullable();
            $table->timestamps();

            $table->index(['status', 'posted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copilot_jobs');
    }
};
