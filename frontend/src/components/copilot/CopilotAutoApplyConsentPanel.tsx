import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopilotAutoApply } from "@/lib/copilot/useCopilotAutoApply";

type Props = {
  onGranted?: () => void;
  compact?: boolean;
};

export function CopilotAutoApplyConsentPanel({ onGranted, compact }: Props) {
  const { consent, loading, submitting, grantConsent, revokeConsent } = useCopilotAutoApply();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading consent…
      </div>
    );
  }

  if (!consent) {
    return <p className="text-sm text-slate-500">Sign in with a premium plan to enable auto-apply.</p>;
  }

  if (consent.has_consent) {
    return (
      <div className={compact ? "text-sm" : "rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"}>
        <p className="font-medium text-emerald-900">Auto-apply consent active</p>
        {!compact && (
          <p className="mt-1 text-sm text-emerald-800">
            Copilot may submit applications using your profile and resume.
          </p>
        )}
        <Button
          className="mt-3"
          size="sm"
          variant="outline"
          disabled={submitting}
          onClick={revokeConsent}
        >
          Revoke consent
        </Button>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "rounded-xl border border-amber-200 bg-amber-50/60 p-4"}>
      <p className="text-sm font-medium text-amber-900">Consent required for auto-apply</p>
      <p className="text-sm text-amber-800">{consent.consent_text}</p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" id="auto-apply-consent" className="mt-1" />
        <span>I agree to the terms above</span>
      </label>
      <Button
        size="sm"
        disabled={submitting}
        onClick={async () => {
          const checkbox = document.getElementById("auto-apply-consent") as HTMLInputElement | null;
          if (!checkbox?.checked) {
            alert("Please check the consent box.");
            return;
          }
          await grantConsent();
          onGranted?.();
        }}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enable auto-apply
      </Button>
    </div>
  );
}
