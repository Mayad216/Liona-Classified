<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copilot_automation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('copilot_application_id')->constrained('copilot_applications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('step', 64);
            $table->string('level', 16)->default('info');
            $table->text('message');
            $table->json('payload')->nullable();
            $table->string('screenshot_path')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['copilot_application_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copilot_automation_logs');
    }
};
