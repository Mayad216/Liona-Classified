<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('category')->index();
            $table->decimal('price_from', 10, 2);
            $table->string('unit')->default('visit');
            $table->string('emirate')->index();
            $table->json('photos')->nullable();
            $table->string('response_time')->nullable();
            $table->unsignedInteger('completed_jobs')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->float('rating')->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->timestamps();
        });

        Schema::create('service_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('scheduled_for');
            $table->string('status')->default('confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_bookings');
        Schema::dropIfExists('services');
    }
};
