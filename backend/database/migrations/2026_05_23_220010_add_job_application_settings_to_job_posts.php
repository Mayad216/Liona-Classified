<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->string('application_method', 32)->default('platform')->after('status');
            $table->string('application_contact')->nullable()->after('application_method');
            $table->date('start_date')->nullable()->after('application_contact');
            $table->json('application_questions')->nullable()->after('start_date');
        });

        Schema::table('job_applications', function (Blueprint $table) {
            $table->json('answers')->nullable()->after('cover_letter');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('answers');
        });

        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropColumn([
                'application_method',
                'application_contact',
                'start_date',
                'application_questions',
            ]);
        });
    }
};
