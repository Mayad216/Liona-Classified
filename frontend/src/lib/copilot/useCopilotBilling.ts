import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken } from "@/lib/api";
import type { CopilotBillingSummary, CreditPack, SubscriptionPlanRecord } from "@/types/copilot";

export function useCopilotBilling() {
  const [billing, setBilling] = useState<CopilotBillingSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanRecord[]>([]);
  const [creditPacks, setCreditPacks] = useState<Record<string, CreditPack>>({});
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [billingRes, plansRes] = await Promise.all([
        api.copilotBilling(token),
        api.copilotBillingPlans(),
      ]);
      setBilling(billingRes.data);
      setPlans(plansRes.data.plans as SubscriptionPlanRecord[]);
      setCreditPacks(plansRes.data.credit_packs as Record<string, CreditPack>);
      setStripeEnabled(!!plansRes.data.stripe_enabled);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkout = async (planSlug: string, interval: "monthly" | "yearly" = "monthly") => {
    const token = getStoredAuthToken();
    if (!token) throw new Error("Sign in required");
    setCheckoutLoading(planSlug);
    try {
      const res = await api.copilotCheckout({ plan_slug: planSlug, interval }, token);
      if (res.data.mode === "stripe" && res.data.url) {
        window.location.href = res.data.url;
        return res.data;
      }
      await refresh();
      return res.data;
    } finally {
      setCheckoutLoading(null);
    }
  };

  const buyCreditPack = async (packSlug: string) => {
    const token = getStoredAuthToken();
    if (!token) throw new Error("Sign in required");
    setCheckoutLoading(packSlug);
    try {
      const res = await api.copilotCreditPack({ pack_slug: packSlug }, token);
      if (res.data.mode === "stripe" && res.data.url) {
        window.location.href = res.data.url;
        return res.data;
      }
      await refresh();
      return res.data;
    } finally {
      setCheckoutLoading(null);
    }
  };

  const cancel = async () => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.copilotCancelSubscription(token);
    await refresh();
  };

  const resume = async () => {
    const token = getStoredAuthToken();
    if (!token) return;
    await api.copilotResumeSubscription(token);
    await refresh();
  };

  return {
    billing,
    plans,
    creditPacks,
    stripeEnabled,
    loading,
    checkoutLoading,
    refresh,
    checkout,
    buyCreditPack,
    cancel,
    resume,
  };
}
