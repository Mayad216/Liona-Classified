<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Services\Copilot\SubscriptionService;
use Illuminate\Http\Request;

class CopilotStripeWebhookController extends Controller
{
    public function __invoke(Request $request, SubscriptionService $subscriptions)
    {
        $subscriptions->handleStripeWebhook(
            $request->getContent(),
            $request->header('Stripe-Signature')
        );

        return response()->json(['received' => true]);
    }
}
