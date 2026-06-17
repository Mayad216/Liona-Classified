<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uae_emirates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->unsignedInteger('dubizzle_city_id')->nullable()->index();
            $table->string('dubizzle_subdomain')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('uae_neighborhoods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emirate_id')->constrained('uae_emirates')->cascadeOnDelete();
            $table->unsignedInteger('dubizzle_id')->nullable();
            $table->unsignedInteger('propertyfinder_id')->nullable();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('slug')->nullable();
            $table->unsignedTinyInteger('level')->nullable();
            $table->string('location_type')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('source')->default('dubizzle');
            $table->timestamps();

            $table->unique(['emirate_id', 'dubizzle_id']);
            $table->unique(['emirate_id', 'name_en']);
            $table->index(['emirate_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uae_neighborhoods');
        Schema::dropIfExists('uae_emirates');
    }
};
