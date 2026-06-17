<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company');
            $table->string('company_logo')->nullable();
            $table->text('description');
            $table->json('responsibilities')->nullable();
            $table->json('requirements')->nullable();
            $table->json('benefits')->nullable();
            $table->string('emirate')->index();
            $table->string('area');
            $table->string('industry')->index();
            $table->string('employment_type')->index();
            $table->string('experience_level')->index();
            $table->unsignedInteger('salary_min')->default(0);
            $table->unsignedInteger('salary_max')->default(0);
            $table->boolean('remote')->default(false);
            $table->boolean('is_featured')->default(false)->index();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('job_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('cv_url');
            $table->text('cover_letter')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_posts');
    }
};
