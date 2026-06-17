<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_sources', function (Blueprint $table) {
            $table->string('country', 64)->default('UAE')->after('base_url');
            $table->json('scrape_config')->nullable()->after('country');
            $table->unsignedSmallInteger('scrape_interval_hours')->default(24)->after('scrape_config');
            $table->string('last_scrape_status', 32)->nullable()->after('last_scraped_at');
            $table->text('last_scrape_error')->nullable()->after('last_scrape_status');
            $table->unsignedInteger('jobs_imported_total')->default(0)->after('last_scrape_error');
        });

        Schema::table('copilot_jobs', function (Blueprint $table) {
            $table->unique(['job_source_id', 'external_job_id'], 'copilot_jobs_source_external_unique');
        });
    }

    public function down(): void
    {
        Schema::table('copilot_jobs', function (Blueprint $table) {
            $table->dropUnique('copilot_jobs_source_external_unique');
        });

        Schema::table('job_sources', function (Blueprint $table) {
            $table->dropColumn([
                'country',
                'scrape_config',
                'scrape_interval_hours',
                'last_scrape_status',
                'last_scrape_error',
                'jobs_imported_total',
            ]);
        });
    }
};
