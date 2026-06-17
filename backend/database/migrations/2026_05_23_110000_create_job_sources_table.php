<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('source_type', ['job_board', 'company_career_page', 'ats', 'manual'])->default('manual');
            $table->string('base_url')->nullable();
            $table->boolean('scraping_enabled')->default(false);
            $table->timestamp('last_scraped_at')->nullable();
            $table->enum('status', ['active', 'paused', 'failed'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_sources');
    }
};
