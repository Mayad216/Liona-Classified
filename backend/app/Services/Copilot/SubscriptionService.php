<?php

namespace App\Services\Copilot;

use App\Models\CopilotBillingEvent;
use App\Models\Resume;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Stripe\Checkout\Session as StripeCheckoutSession;
use Stripe\Stripe;
use Stripe\Webhook;

class SubscriptionService
{
    public function __construct(protected UsageLimitService $usage)
    {
    }

    public function stripeEnabled(): bool
    {
        return (bool) config('copilot.stripe.secret');
    }

    /**
     * @return array{mode: string, url?: string, activated?: bool, plan?: string}
     */
    public function createCheckout(User $user, string $planSlug, string $interval = 'monthly'): array
    {
        $plan = $this->findPlan($planSlug);
        if ($plan->slug === 'free') {
            abort(422, 'Cannot checkout the free plan.');
        }

        if (! $this->stripeEnabled()) {
            $this->activatePlan($user, $plan->slug, $interval, demo: true);

            return [
                'mode' => 'demo',
                'activated' => true,
                'plan' => $plan->slug,
                'message' => 'Demo mode: plan activated without payment (configure STRIPE_SECRET for live billing).',
            ];
        }

        Stripe::setApiKey(config('copilot.stripe.secret'));

        $priceId = $interval === 'yearly'
            ? $plan->stripe_price_yearly_id
            : $plan->stripe_price_monthly_id;

        if (! $priceId) {
            abort(422, 'Stripe price ID not configured for this plan.');
        }

        $customerId = $this->ensureStripeCustomer($user);

        $session = StripeCheckoutSession::create([
            'mode' => 'subscription',
            'customer' => $customerId,
            'line_items' => [['price' => $priceId, 'quantity' => 1]],
            'success_url' => config('copilot.stripe.success_url').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('copilot.stripe.cancel_url'),
            'metadata' => [
                'user_id' => (string) $user->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval,
            ],
        ]);

        return [
            'mode' => 'stripe',
            'url' => $session->url,
        ];
    }

    /**
     * @return array{mode: string, url?: string, activated?: bool}
     */
    public function purchaseCreditPack(User $user, string $packSlug): array
    {
        $pack = config('copilot.credit_packs.'.$packSlug);
        if (! $pack) {
            abort(422, 'Unknown credit pack.');
        }

        if (! $this->stripeEnabled()) {
            $this->applyCreditPack($user, $packSlug, demo: true);

            return [
                'mode' => 'demo',
                'activated' => true,
                'message' => 'Demo mode: credits added without payment.',
            ];
        }

        Stripe::setApiKey(config('copilot.stripe.secret'));
        $priceId = $pack['stripe_price_id'] ?? null;
        if (! $priceId) {
            abort(422, 'Stripe price ID not configured for this credit pack.');
        }

        $session = StripeCheckoutSession::create([
            'mode' => 'payment',
            'customer' => $this->ensureStripeCustomer($user),
            'line_items' => [['price' => $priceId, 'quantity' => 1]],
            'success_url' => config('copilot.stripe.success_url').'?pack='.$packSlug,
            'cancel_url' => config('copilot.stripe.cancel_url'),
            'metadata' => [
                'user_id' => (string) $user->id,
                'credit_pack' => $packSlug,
            ],
        ]);

        return ['mode' => 'stripe', 'url' => $session->url];
    }

    public function activatePlan(User $user, string $planSlug, string $interval = 'monthly', bool $demo = false): User
    {
        $plan = $this->findPlan($planSlug);

        $endsAt = $interval === 'yearly' ? now()->addYear() : now()->addMonth();

        $user->update([
            'plan' => $plan->slug,
            'subscription_status' => $demo ? 'active' : 'active',
            'subscription_ends_at' => $endsAt,
        ]);

        Resume::query()
            ->where('user_id', $user->id)
            ->update(['watermark' => false]);

        CopilotBillingEvent::create([
            'user_id' => $user->id,
            'event_type' => $demo ? 'demo_subscription_activated' : 'subscription_activated',
            'plan_slug' => $plan->slug,
            'amount_aed' => $interval === 'yearly' ? $plan->price_yearly : $plan->price_monthly,
            'payload' => ['interval' => $interval, 'demo' => $demo],
        ]);

        return $user->fresh();
    }

    public function applyCreditPack(User $user, string $packSlug, bool $demo = false): User
    {
        $pack = config('copilot.credit_packs.'.$packSlug);
        if (! $pack) {
            abort(422, 'Unknown credit pack.');
        }

        $user->update([
            'copilot_auto_credit_balance' => $user->copilot_auto_credit_balance + (int) ($pack['auto_credits'] ?? 0),
            'copilot_ai_credit_balance' => $user->copilot_ai_credit_balance + (int) ($pack['ai_credits'] ?? 0),
        ]);

        CopilotBillingEvent::create([
            'user_id' => $user->id,
            'event_type' => $demo ? 'demo_credit_pack' : 'credit_pack_purchased',
            'amount_aed' => (int) ($pack['price_aed'] ?? 0),
            'payload' => ['pack' => $packSlug, 'demo' => $demo],
        ]);

        return $user->fresh();
    }

    public function cancelSubscription(User $user): User
    {
        if ($this->stripeEnabled() && $user->stripe_subscription_id) {
            Stripe::setApiKey(config('copilot.stripe.secret'));
            \Stripe\Subscription::update($user->stripe_subscription_id, [
                'cancel_at_period_end' => true,
            ]);
        }

        $user->update(['subscription_status' => 'cancelled']);

        CopilotBillingEvent::create([
            'user_id' => $user->id,
            'event_type' => 'subscription_cancelled',
            'plan_slug' => $user->plan,
        ]);

        return $user->fresh();
    }

    public function resumeSubscription(User $user): User
    {
        if ($user->plan === 'free') {
            abort(422, 'No paid subscription to resume.');
        }

        if ($this->stripeEnabled() && $user->stripe_subscription_id) {
            Stripe::setApiKey(config('copilot.stripe.secret'));
            \Stripe\Subscription::update($user->stripe_subscription_id, [
                'cancel_at_period_end' => false,
            ]);
        }

        $user->update(['subscription_status' => 'active']);

        CopilotBillingEvent::create([
            'user_id' => $user->id,
            'event_type' => 'subscription_resumed',
            'plan_slug' => $user->plan,
        ]);

        return $user->fresh();
    }

    public function downgradeToFree(User $user): User
    {
        $user->update([
            'plan' => 'free',
            'subscription_status' => 'inactive',
            'subscription_ends_at' => null,
            'stripe_subscription_id' => null,
        ]);

        return $user->fresh();
    }

    public function handleStripeWebhook(string $payload, ?string $signature): void
    {
        $secret = config('copilot.stripe.webhook_secret');
        if (! $secret) {
            abort(400, 'Webhook secret not configured.');
        }

        $event = Webhook::constructEvent($payload, $signature ?? '', $secret);

        if (CopilotBillingEvent::query()->where('stripe_event_id', $event->id)->exists()) {
            return;
        }

        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($event->data->object, $event->id),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object, $event->id),
            default => null,
        };
    }

    private function handleCheckoutCompleted(object $session, string $eventId): void
    {
        $userId = (int) ($session->metadata->user_id ?? 0);
        $user = User::find($userId);
        if (! $user) {
            return;
        }

        if (! empty($session->metadata->credit_pack)) {
            $this->applyCreditPack($user, (string) $session->metadata->credit_pack);
            CopilotBillingEvent::create([
                'user_id' => $user->id,
                'event_type' => 'stripe_credit_pack',
                'stripe_event_id' => $eventId,
                'payload' => ['session' => $session->id],
            ]);

            return;
        }

        $planSlug = (string) ($session->metadata->plan_slug ?? 'premium_starter');
        $interval = (string) ($session->metadata->interval ?? 'monthly');

        $user->update([
            'stripe_subscription_id' => $session->subscription ?? $user->stripe_subscription_id,
        ]);

        $this->activatePlan($user, $planSlug, $interval);

        CopilotBillingEvent::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first()
            ?->update(['stripe_event_id' => $eventId]);
    }

    private function handleSubscriptionDeleted(object $subscription, string $eventId): void
    {
        $user = User::query()->where('stripe_subscription_id', $subscription->id)->first();
        if (! $user) {
            return;
        }

        $this->downgradeToFree($user);

        CopilotBillingEvent::create([
            'user_id' => $user->id,
            'event_type' => 'stripe_subscription_deleted',
            'stripe_event_id' => $eventId,
        ]);
    }

    private function ensureStripeCustomer(User $user): string
    {
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        Stripe::setApiKey(config('copilot.stripe.secret'));
        $customer = \Stripe\Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => ['user_id' => (string) $user->id],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    private function findPlan(string $slug): SubscriptionPlan
    {
        return SubscriptionPlan::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    public function billingSummary(User $user): array
    {
        $plan = SubscriptionPlan::query()->where('slug', $user->plan)->first();
        $usage = $this->usage->fullUsageSummary($user);

        return [
            'plan' => [
                'slug' => $user->plan,
                'name' => $plan?->name ?? 'Free',
                'subscription_status' => $user->subscription_status,
                'subscription_ends_at' => $user->subscription_ends_at,
                'is_premium' => $user->isPremium(),
                'auto_apply_enabled' => (bool) ($plan?->auto_apply_enabled ?? false),
                'price_monthly' => $plan?->price_monthly ?? 0,
                'price_yearly' => $plan?->price_yearly ?? 0,
            ],
            'usage' => $usage,
            'credit_balances' => [
                'auto_applications' => $user->copilot_auto_credit_balance,
                'ai_credits' => $user->copilot_ai_credit_balance,
            ],
            'stripe_enabled' => $this->stripeEnabled(),
            'recent_events' => CopilotBillingEvent::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(10)
                ->get(['event_type', 'plan_slug', 'amount_aed', 'created_at']),
        ];
    }
}
