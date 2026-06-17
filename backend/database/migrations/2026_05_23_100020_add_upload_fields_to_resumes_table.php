<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resumes', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('template');
            $table->string('original_file_name')->nullable()->after('file_path');
            $table->longText('parsed_text')->nullable()->after('data');
            $table->boolean('is_default')->default(false)->after('parsed_text');
            $table->unsignedTinyInteger('ats_score')->nullable()->after('is_default');
            $table->enum('parse_status', ['none', 'pending', 'completed', 'failed'])->default('none')->after('ats_score');
            $table->timestamp('parsed_at')->nullable()->after('parse_status');
        });
    }

    public function down(): void
    {
        Schema::table('resumes', function (Blueprint $table) {
            $table->dropColumn([
                'file_path',
                'original_file_name',
                'parsed_text',
                'is_default',
                'ats_score',
                'parse_status',
                'parsed_at',
            ]);
        });
    }
};
