import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  Phone,
  Mail,
  FileCheck2,
  Clock,
  Info,
} from "lucide-react";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface Inputs {
  idVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  docVerified: boolean;
  reviews: number;
  rating: number;
  responseMins: number;
  profileCompletion: number;
}

function pieces({
  idVerified,
  phoneVerified,
  emailVerified,
  docVerified,
  reviews,
  rating,
  responseMins,
  profileCompletion,
}: Inputs) {
  const r: { label: string; score: number; max: number; ok: boolean; icon: typeof Star }[] = [];
  r.push({ label: "Emirates ID verified", score: idVerified ? 25 : 0, max: 25, ok: idVerified, icon: ShieldCheck });
  r.push({ label: "Phone OTP verified", score: phoneVerified ? 15 : 0, max: 15, ok: phoneVerified, icon: Phone });
  r.push({ label: "Email verified", score: emailVerified ? 10 : 0, max: 10, ok: emailVerified, icon: Mail });
  r.push({ label: "Property documents", score: docVerified ? 10 : 0, max: 10, ok: docVerified, icon: FileCheck2 });
  r.push({
    label: `Reviews (${reviews} · ${rating.toFixed(1)}★)`,
    score: Math.min(20, Math.round((rating / 5) * 20) * Math.min(1, reviews / 5)),
    max: 20,
    ok: reviews >= 3 && rating >= 4,
    icon: Star,
  });
  r.push({
    label: `Response < ${responseMins} min`,
    score: responseMins <= 60 ? 10 : responseMins <= 240 ? 6 : 3,
    max: 10,
    ok: responseMins <= 60,
    icon: Clock,
  });
  r.push({
    label: `Profile ${profileCompletion}% complete`,
    score: Math.round((profileCompletion / 100) * 10),
    max: 10,
    ok: profileCompletion >= 80,
    icon: CheckCircle2,
  });
  return r;
}

export function computeTrust(u: User): number {
  return scoreFor({
    idVerified: u.verified,
    phoneVerified: u.verified,
    emailVerified: true,
    docVerified: u.role === "lister" && u.verified,
    reviews: u.verified ? 12 : 2,
    rating: u.rating,
    responseMins: u.verified ? 30 : 240,
    profileCompletion: u.verified ? 92 : 60,
  });
}

function scoreFor(i: Inputs) {
  return Math.min(100, pieces(i).reduce((s, p) => s + p.score, 0));
}

const TIERS = [
  { min: 90, label: "Top Trust", color: "from-emerald-500 to-emerald-700", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  { min: 75, label: "High Trust", color: "from-brand-500 to-brand-700", text: "text-brand-700", bg: "bg-brand-50", ring: "ring-brand-200" },
  { min: 60, label: "Verified", color: "from-sky-500 to-sky-700", text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200" },
  { min: 0, label: "New user", color: "from-slate-400 to-slate-600", text: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200" },
];

function tierFor(score: number) {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

interface Props {
  user: User;
  variant?: "badge" | "card";
  className?: string;
}

export function TrustScore({ user, variant = "badge", className }: Props) {
  const [open, setOpen] = useState(false);
  const inputs: Inputs = {
    idVerified: user.verified,
    phoneVerified: user.verified,
    emailVerified: true,
    docVerified: user.role === "lister" && user.verified,
    reviews: user.verified ? 12 : 2,
    rating: user.rating,
    responseMins: user.verified ? 30 : 240,
    profileCompletion: user.verified ? 92 : 60,
  };
  const score = scoreFor(inputs);
  const tier = tierFor(score);
  const rows = pieces(inputs);

  if (variant === "card") {
    return (
      <div className={cn("rounded-2xl border border-slate-200 bg-white p-5", className)}>
        <Header score={score} tier={tier} />
        <ul className="mt-5 space-y-2.5">
          {rows.map(({ label, score: s, max, ok, icon: Icon }) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <Icon className={cn("h-4 w-4 flex-shrink-0", ok ? "text-emerald-500" : "text-slate-300")} />
              <span className={cn("flex-1", ok ? "text-slate-800" : "text-slate-500")}>{label}</span>
              <span className={cn("font-semibold tabular-nums", ok ? "text-slate-900" : "text-slate-400")}>
                {s}/{max}
              </span>
              {ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-300" />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1",
          tier.bg,
          tier.text,
          tier.ring
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Trust {score}
        <Info className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <Header score={score} tier={tier} compact />
          <ul className="mt-3 space-y-1.5 text-xs">
            {rows.map(({ label, score: s, max, ok }) => (
              <li key={label} className="flex items-center justify-between gap-2">
                <span className={cn("flex items-center gap-1.5", ok ? "text-slate-700" : "text-slate-400")}>
                  {ok ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-slate-300" />
                  )}
                  {label}
                </span>
                <span className="font-semibold tabular-nums">
                  {s}/{max}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Header({
  score,
  tier,
  compact,
}: {
  score: number;
  tier: (typeof TIERS)[number];
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg width={compact ? 56 : 72} height={compact ? 56 : 72} viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="url(#tg)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 188.5} 188.5`}
            transform="rotate(-90 36 36)"
          />
          <defs>
            <linearGradient id="tg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-black",
            compact ? "text-base" : "text-xl"
          )}
        >
          {score}
        </span>
      </div>
      <div>
        <div className={cn("font-bold", tier.text, compact ? "text-sm" : "text-base")}>
          {tier.label}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Trust score · /100
        </div>
      </div>
    </div>
  );
}
