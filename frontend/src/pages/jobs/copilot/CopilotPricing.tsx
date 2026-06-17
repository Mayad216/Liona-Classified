import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCopilotBilling } from "@/lib/copilot/useCopilotBilling";
import { getStoredAuthToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function CopilotPricingPage() {
  const { user } = useAuth();
  const { plans, billing, stripeEnabled, loading, checkoutLoading, checkout } = useCopilotBilling();

  const currentSlug = billing?.plan.slug ?? "free";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Jobs Copilot plans</h2>
        <p className="text-sm text-slate-500">
          {stripeEnabled
            ? "Secure checkout via Stripe."
            : "Demo mode — upgrade activates instantly (set STRIPE_SECRET for live payments)."}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = plan.slug === currentSlug;
            const isFree = plan.slug === "free";

            return (
              <div
                key={plan.slug}
                className={`rounded-2xl border p-5 ${
                  isCurrent ? "border-brand-300 bg-brand-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.auto_apply_enabled && <Badge tone="brand">Auto-apply</Badge>}
                  {isCurrent && <Badge tone="success">Current</Badge>}
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {isFree ? "AED 0" : `AED ${plan.price_monthly}/mo`}
                </p>
                {!isFree && plan.price_yearly > 0 && (
                  <p className="text-xs text-slate-500">or AED {plan.price_yearly}/year</p>
                )}
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  <li>{plan.ai_credit_limit} AI credits / month</li>
                  {plan.auto_apply_enabled && (
                    <>
                      <li>{plan.monthly_application_limit} auto-apps / month</li>
                      <li>{plan.daily_application_limit} auto-apps / day</li>
                    </>
                  )}
                  {(plan.features ?? []).slice(0, 3).map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                {!isFree && user && getStoredAuthToken() && !isCurrent && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={checkoutLoading === plan.slug}
                      onClick={() => checkout(plan.slug, "monthly")}
                    >
                      {checkoutLoading === plan.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Upgrade monthly
                    </Button>
                    {plan.price_yearly > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={checkoutLoading === `${plan.slug}-yearly`}
                        onClick={() => checkout(plan.slug, "yearly")}
                      >
                        Yearly
                      </Button>
                    )}
                  </div>
                )}
                {!user && !isFree && (
                  <Link to="/auth/login" className="mt-4 inline-block">
                    <Button size="sm" variant="outline">
                      Sign in to upgrade
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Link to={user ? "/jobs/copilot/billing" : "/jobs/copilot/dashboard"}>
        <Button variant="outline">{user ? "Manage billing" : "Back to dashboard"}</Button>
      </Link>
    </div>
  );
}
