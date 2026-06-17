<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('tag')->default('General')->index();
            $table->unsignedInteger('replies_count')->default(0);
            $table->timestamp('last_activity_at')->useCurrent();
            $table->boolean('pinned')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('community_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('spot')->nullable();
            $table->unsignedInteger('spots_remaining')->default(50);
            $table->boolean('verified_only')->default(false);
            $table->timestamps();
        });

        Schema::create('event_rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('community_event_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'community_event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_rsvps');
        Schema::dropIfExists('community_events');
        Schema::dropIfExists('community_topics');
    }
};
