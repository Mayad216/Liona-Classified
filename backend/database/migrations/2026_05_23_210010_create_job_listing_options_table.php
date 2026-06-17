<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_listing_options', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 20);
            $table->string('name');
            $table->string('normalized_name');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('usage_count')->default(1);
            $table->timestamps();

            $table->unique(['kind', 'normalized_name']);
            $table->index(['kind', 'usage_count']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listing_options');
    }
};
