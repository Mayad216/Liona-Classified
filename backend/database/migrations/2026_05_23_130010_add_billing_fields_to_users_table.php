<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('trial_ends_at');
            $table->string('stripe_subscription_id')->nullable()->after('stripe_customer_id');
            $table->timestamp('subscription_ends_at')->nullable()->after('stripe_subscription_id');
            $table->unsignedInteger('copilot_auto_credit_balance')->default(0)->after('subscription_ends_at');
            $table->unsignedInteger('copilot_ai_credit_balance')->default(0)->after('copilot_auto_credit_balance');
        });

        Schema::table('user_usage_limits', function (Blueprint $table) {
            $table->unsignedInteger('auto_applications_today')->default(0)->after('auto_applications_used');
            $table->date('auto_applications_day')->nullable()->after('auto_applications_today');
        });

        Schema::create('copilot_billing_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event_type', 64);
            $table->string('plan_slug', 64)->nullable();
            $table->string('stripe_event_id')->nullable()->unique();
            $table->unsignedInteger('amount_aed')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copilot_billing_events');
        Schema::table('user_usage_limits', function (Blueprint $table) {
            $table->dropColumn(['auto_applications_today', 'auto_applications_day']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'stripe_subscription_id',
                'subscription_ends_at',
                'copilot_auto_credit_balance',
                'copilot_ai_credit_balance',
            ]);
        });
    }
};
