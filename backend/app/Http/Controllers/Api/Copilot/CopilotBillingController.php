<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\Copilot\SubscriptionService;
use Illuminate\Http\Request;

class CopilotBillingController extends Controller
{
    public function __construct(protected SubscriptionService $subscriptions)
    {
    }

    /** GET /api/v1/copilot/billing */
    public function show(Request $request)
    {
        return response()->json([
            'data' => $this->subscriptions->billingSummary($request->user()),
        ]);
    }

    /** GET /api/v1/copilot/billing/plans */
    public function plans()
    {
        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price_monthly')
            ->get();

        return response()->json([
            'data' => [
                'plans' => $plans,
                'credit_packs' => config('copilot.credit_packs'),
                'currency' => 'AED',
                'stripe_enabled' => $this->subscriptions->stripeEnabled(),
            ],
        ]);
    }

    /** POST /api/v1/copilot/billing/checkout */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'plan_slug' => ['required', 'string', 'exists:subscription_plans,slug'],
            'interval' => ['nullable', 'in:monthly,yearly'],
        ]);

        if ($validated['plan_slug'] === 'free') {
            abort(422, 'Cannot purchase the free plan.');
        }

        $result = $this->subscriptions->createCheckout(
            $request->user(),
            $validated['plan_slug'],
            $validated['interval'] ?? 'monthly'
        );

        return response()->json(['data' => $result]);
    }

    /** POST /api/v1/copilot/billing/credit-pack */
    public function creditPack(Request $request)
    {
        $packs = array_keys(config('copilot.credit_packs', []));

        $validated = $request->validate([
            'pack_slug' => ['required', 'string', 'in:'.implode(',', $packs)],
        ]);

        $result = $this->subscriptions->purchaseCreditPack(
            $request->user(),
            $validated['pack_slug']
        );

        return response()->json(['data' => $result]);
    }

    /** POST /api/v1/copilot/billing/cancel */
    public function cancel(Request $request)
    {
        $user = $this->subscriptions->cancelSubscription($request->user());

        return response()->json([
            'data' => $this->subscriptions->billingSummary($user),
            'message' => 'Subscription will cancel at period end.',
        ]);
    }

    /** POST /api/v1/copilot/billing/resume */
    public function resume(Request $request)
    {
        $user = $this->subscriptions->resumeSubscription($request->user());

        return response()->json([
            'data' => $this->subscriptions->billingSummary($user),
            'message' => 'Subscription resumed.',
        ]);
    }
}
