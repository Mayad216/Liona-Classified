<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_seeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('full_name')->nullable();
            $table->string('phone', 32)->nullable();
            $table->string('location')->nullable();
            $table->string('country', 64)->default('UAE');
            $table->string('linkedin_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('github_url')->nullable();
            $table->unsignedTinyInteger('years_of_experience')->nullable();
            $table->string('current_job_title')->nullable();
            $table->json('target_job_titles')->nullable();
            $table->json('target_industries')->nullable();
            $table->json('preferred_locations')->nullable();
            $table->enum('remote_preference', ['remote', 'hybrid', 'onsite', 'any'])->default('any');
            $table->unsignedInteger('expected_salary_min')->nullable();
            $table->unsignedInteger('expected_salary_max')->nullable();
            $table->string('currency', 8)->default('AED');
            $table->string('work_authorization')->nullable();
            $table->boolean('requires_visa_sponsorship')->default(false);
            $table->string('notice_period')->nullable();
            $table->date('availability_date')->nullable();
            $table->text('professional_summary')->nullable();
            $table->decimal('completion', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_seeker_profiles');
    }
};
