import { Link } from "react-router-dom";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopilotBilling } from "@/lib/copilot/useCopilotBilling";

export function CopilotBillingPage() {
  const {
    billing,
    creditPacks,
    stripeEnabled,
    loading,
    checkoutLoading,
    buyCreditPack,
    cancel,
    resume,
  } = useCopilotBilling();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!billing) {
    return (
      <p className="text-sm text-slate-600">Sign in to manage your Jobs Copilot subscription.</p>
    );
  }

  const { plan, usage, credit_balances } = billing;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Billing & usage</h2>
        <p className="text-sm text-slate-500">
          {stripeEnabled ? "Stripe checkout enabled." : "Demo mode — plans activate instantly without payment."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Current plan" value={plan.name} sub={plan.subscription_status} />
        <Stat
          label="AI credits"
          value={String(usage.ai.ai_credits_remaining)}
          sub={`${usage.ai.ai_credits_used} used of ${usage.ai.ai_credits_limit}`}
        />
        <Stat
          label="Auto-apply"
          value={usage.auto_apply.can_auto_apply ? String(usage.auto_apply.remaining) : "—"}
          sub={
            usage.auto_apply.can_auto_apply
              ? `${usage.auto_apply.auto_applications_used} used this month`
              : "Premium only"
          }
        />
        <Stat
          label="Credit balance"
          value={String(credit_balances.auto_applications)}
          sub={`+ ${credit_balances.ai_credits} bonus AI credits`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Subscription actions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/jobs/copilot/pricing">
            <Button size="sm">Change plan</Button>
          </Link>
          {plan.is_premium && plan.subscription_status === "active" && (
            <Button size="sm" variant="outline" onClick={cancel}>
              Cancel subscription
            </Button>
          )}
          {plan.subscription_status === "cancelled" && (
            <Button size="sm" variant="outline" onClick={resume}>
              <RefreshCw className="h-4 w-4" />
              Resume subscription
            </Button>
          )}
        </div>
        {plan.subscription_ends_at && (
          <p className="mt-2 text-xs text-slate-500">
            Renews / ends: {new Date(plan.subscription_ends_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">One-time credit packs</h3>
        <p className="mt-1 text-sm text-slate-500">Extra auto-application credits (Phase 5 uses these).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Object.entries(creditPacks).map(([slug, pack]) => (
            <div key={slug} className="rounded-xl border border-slate-200 p-4">
              <p className="font-medium">{pack.name}</p>
              <p className="text-lg font-bold">AED {pack.price_aed}</p>
              <Button
                className="mt-2"
                size="sm"
                variant="outline"
                disabled={checkoutLoading === slug}
                onClick={() => buyCreditPack(slug)}
              >
                {checkoutLoading === slug ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Buy
              </Button>
            </div>
          ))}
        </div>
      </div>

      {billing.recent_events.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Recent billing events</h3>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {billing.recent_events.map((e, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>{e.event_type.replace(/_/g, " ")}</span>
                <span className="text-slate-500">
                  {e.amount_aed ? `AED ${e.amount_aed}` : ""}{" "}
                  {new Date(e.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CopilotBillingSuccessPage() {
  return (
    <div className="container max-w-lg py-16 text-center">
      <CreditCard className="mx-auto h-12 w-12 text-brand-600" />
      <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
      <p className="mt-2 text-slate-600">Your plan should be active shortly. Return to the dashboard to confirm.</p>
      <Link to="/jobs/copilot/billing" className="mt-6 inline-block">
        <Button>View billing</Button>
      </Link>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
