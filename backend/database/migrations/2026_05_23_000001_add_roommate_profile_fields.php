<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roommate_profiles', function (Blueprint $table) {
            $table->unsignedInteger('monthly_budget_aed')->nullable()->after('bio');
            $table->date('move_in_date')->nullable()->after('monthly_budget_aed');
            $table->string('lease_duration')->nullable()->after('move_in_date');
            $table->json('dealbreakers')->nullable()->after('looking_for');
            $table->boolean('is_discoverable')->default(false)->after('dealbreakers');
        });
    }

    public function down(): void
    {
        Schema::table('roommate_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'monthly_budget_aed',
                'move_in_date',
                'lease_duration',
                'dealbreakers',
                'is_discoverable',
            ]);
        });
    }
};
