import { useState } from "react";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useResumePlan } from "@/lib/resume/useResumePlan";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
};

export function ResumeUpgradeModal({ open, onClose, onUpgraded }: Props) {
  const { isPro, upgradeToPro } = useResumePlan();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await upgradeToPro();
      onUpgraded?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (isPro) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
          <Check className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-3 text-lg font-bold">You're on Resume Pro</h2>
          <p className="mt-2 text-sm text-slate-600">
            Watermark-free PDFs and unlimited AI credits are active.
          </p>
          <Button className="mt-6" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <Badge tone="brand" className="bg-brand-50">
          <Sparkles className="h-3 w-3" /> Resume Pro
        </Badge>
        <h2 className="mt-3 text-xl font-bold">Remove watermark & unlock Pro</h2>
        <p className="mt-2 text-sm text-slate-600">
          Demo checkout — simulates Tap/Stripe. In production this wires to your payment
          provider.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Free</p>
            <p className="mt-1 text-2xl font-black">AED 0</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              <li>· 1 resume</li>
              <li>· PDF with watermark</li>
              <li>· 5 AI credits / day</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 border-brand-500 bg-brand-50/40 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Pro</p>
            <p className="mt-1 text-2xl font-black text-brand-900">
              AED 29<span className="text-sm font-medium">/mo</span>
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-700">
              <li>· Unlimited resumes</li>
              <li>· No watermark</li>
              <li>· All templates</li>
              <li>· 100 AI credits / day</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Upgrade to Pro — AED 29
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
