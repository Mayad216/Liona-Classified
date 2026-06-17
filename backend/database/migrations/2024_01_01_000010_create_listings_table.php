<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('emirate')->index();
            $table->string('area')->index();
            $table->decimal('price', 10, 2)->index();
            $table->decimal('deposit', 10, 2)->default(0);
            $table->string('room_type')->index();
            $table->unsignedInteger('size_sqft')->nullable();
            $table->unsignedTinyInteger('tenants_count')->default(1);
            $table->boolean('attached_bathroom')->default(false);
            $table->boolean('balcony')->default(false);
            $table->float('distance_to_metro_km')->nullable();
            $table->string('gender_preference')->default('Any');
            $table->string('nationality_preference')->nullable();
            $table->string('listed_by')->default('Tenant');
            $table->json('amenities')->nullable();
            $table->json('photos')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_published')->default(false);
            $table->string('status')->default('pending')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
