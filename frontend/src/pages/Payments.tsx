import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Lock,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const steps = [
  {
    title: "Chat only inside Khaleej",
    sub: "Phone numbers stay masked until both sides agree. Reduces scams vs raw WhatsApp leads.",
    icon: Lock,
  },
  {
    title: "Optional escrow hold",
    sub: "For featured landlords — deposit can be held until keys handover (Stripe Connect rolling out).",
    icon: Wallet,
  },
  {
    title: "Chargeback-safe receipts",
    sub: "Every fee generates a branded invoice + audit trail for disputes.",
    icon: CreditCard,
  },
];

export function Payments() {
  return (
    <div className="bg-slate-50/60 pb-20 pt-10">
      <div className="container max-w-3xl">
        <Badge tone="brand" className="bg-emerald-50">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          Safe payments
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Payments built for shared housing
        </h1>
        <p className="mt-2 text-slate-600">
          Competitors highlight “protected payments”; we’re implementing the same promise with
          UAE-first defaults: verified identities first, money movement second.
        </p>

        <div className="mt-8 space-y-4">
          {steps.map((s) => (
            <div
              key={s.title}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{s.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
            <div>
              <h3 className="font-semibold text-amber-900">Today vs roadmap</h3>
              <p className="mt-1 text-sm text-amber-900/90">
                Right now: secure messaging, verified listings, and manual bank transfers with
                guidance. Next: card checkout for boosts + optional deposit escrow for verified
                landlords (same pattern as Roomy Finder–style “protected” flows).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/verify">
            <Button>
              <BadgeCheck className="h-4 w-4" />
              Get verified
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/accommodation">
            <Button variant="outline">Browse verified rooms</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
