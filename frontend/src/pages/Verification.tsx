import { useState } from "react";
import {
  ShieldCheck,
  Upload,
  Camera,
  IdCard,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StepKey = "email" | "phone" | "id" | "selfie" | "docs";

interface Step {
  key: StepKey;
  title: string;
  desc: string;
  icon: typeof IdCard;
  bonus: number;
}

const STEPS: Step[] = [
  {
    key: "email",
    title: "Verify your email",
    desc: "We'll send you a 6-digit code.",
    icon: Mail,
    bonus: 10,
  },
  {
    key: "phone",
    title: "Verify your UAE phone (OTP)",
    desc: "WhatsApp or SMS — your number is never shown publicly.",
    icon: Phone,
    bonus: 15,
  },
  {
    key: "id",
    title: "Emirates ID or passport",
    desc: "Photo of front + back. Processed by our verified KYC partner.",
    icon: IdCard,
    bonus: 25,
  },
  {
    key: "selfie",
    title: "Live selfie",
    desc: "30-second liveness check matched against your ID photo.",
    icon: Camera,
    bonus: 10,
  },
  {
    key: "docs",
    title: "Property documents (landlords only)",
    desc: "Title Deed or signed agency agreement to unlock the Verified-Property badge.",
    icon: FileText,
    bonus: 10,
  },
];

export function Verification() {
  const [completed, setCompleted] = useState<Set<StepKey>>(new Set());

  const total = STEPS.reduce((s, x) => s + x.bonus, 0);
  const got = STEPS.filter((s) => completed.has(s.key)).reduce(
    (s, x) => s + x.bonus,
    0
  );
  const pct = Math.round((got / total) * 100);

  const toggle = (k: StepKey) =>
    setCompleted((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  return (
    <div className="bg-slate-50/60 pb-20 pt-10">
      <div className="container max-w-4xl">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Identity verification
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Get verified in 3 minutes.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Verified users get 4× more replies and unlock secure messaging, payments,
            and the Trust badge. Your documents are encrypted end-to-end.
          </p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {STEPS.map(({ key, title, desc, icon: Icon, bonus }) => {
              const done = completed.has(key);
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-start gap-4 rounded-2xl border p-5 transition",
                    done
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-white hover:border-brand-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
                      done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold">{title}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                        +{bonus} trust
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{desc}</p>

                    {!done && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {key === "id" || key === "docs" || key === "selfie" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggle(key)}
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggle(key)}
                          >
                            Send code
                          </Button>
                        )}
                        <span className="text-xs text-slate-400">~30 sec</span>
                      </div>
                    )}
                  </div>
                  {done && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Verified
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="relative mx-auto h-32 w-32">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#vg)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 263.9} 263.9`}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="vg" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{pct}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Verified
                  </span>
                </div>
              </div>
              <div className="mt-3 text-sm font-bold">
                {got} / {total} trust points
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Reach 60+ to unlock secure messaging.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Lock className="h-4 w-4 text-emerald-600" />
                Your data is encrypted
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                We use UAE-licensed KYC providers. Documents are stored
                AES-256-encrypted and auto-deleted 12 months after deactivation.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-accent-700 p-5 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-100">
                <Sparkles className="h-3.5 w-3.5" />
                Verified perks
              </div>
              <ul className="mt-3 space-y-1.5 text-xs">
                <li className="flex gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  4× higher reply rate
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  Show "Verified" badge on listings
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  Unlock secure in-app payments
                </li>
                <li className="flex gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                  Higher Trust Score = top of search
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
