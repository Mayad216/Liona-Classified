<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copilot_blacklist_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 16)->index();
            $table->string('value')->index();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'type', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copilot_blacklist_entries');
    }
};
