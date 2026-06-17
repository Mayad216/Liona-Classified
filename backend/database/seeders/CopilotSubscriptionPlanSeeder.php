<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class CopilotSubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'free',
                'name' => 'Free',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'auto_apply_enabled' => false,
                'monthly_application_limit' => 0,
                'daily_application_limit' => 0,
                'ai_credit_limit' => 10,
                'features' => ['Job recommendations', 'Resume upload', 'Match score', 'Manual apply', 'Limited AI'],
            ],
            [
                'slug' => 'premium_starter',
                'name' => 'Premium Starter',
                'price_monthly' => 49,
                'price_yearly' => 490,
                'auto_apply_enabled' => true,
                'monthly_application_limit' => 100,
                'daily_application_limit' => 10,
                'ai_credit_limit' => 200,
                'features' => ['Auto-apply', 'AI cover letters', 'Application tracking', '100 apps/mo'],
            ],
            [
                'slug' => 'premium_pro',
                'name' => 'Premium Pro',
                'price_monthly' => 99,
                'price_yearly' => 990,
                'auto_apply_enabled' => true,
                'monthly_application_limit' => 500,
                'daily_application_limit' => 25,
                'ai_credit_limit' => 500,
                'features' => ['Resume tailoring', 'Priority matching', '500 apps/mo', 'Weekly report'],
            ],
            [
                'slug' => 'premium_max',
                'name' => 'Premium Max',
                'price_monthly' => 199,
                'price_yearly' => 1990,
                'auto_apply_enabled' => true,
                'monthly_application_limit' => 1500,
                'daily_application_limit' => 50,
                'ai_credit_limit' => 1500,
                'features' => ['Multiple resumes', 'Advanced AI', '1,500 apps/mo', 'Priority support'],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
