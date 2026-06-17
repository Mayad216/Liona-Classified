<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('emirates_id_last4', 4)->nullable()->after('is_verified');
            $table->timestamp('emirates_id_verified_at')->nullable()->after('emirates_id_last4');
            $table->string('emirates_id_status', 20)->default('none')->after('emirates_id_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['emirates_id_last4', 'emirates_id_verified_at', 'emirates_id_status']);
        });
    }
};
