import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Sparkles,
  UserSearch,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function MatchHome() {
  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="absolute inset-0 -z-10 bg-radial-fade" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-grid-light bg-[size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden
      />

      <section className="container flex flex-col items-center px-4 pt-16 pb-20 sm:pt-24">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <Badge tone="brand" className="bg-brand-50/60">
            <Sparkles className="h-3 w-3" />
            Match Me
          </Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Have a room or{" "}
            <span className="gradient-text">need one?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Tell us which side you&apos;re on — we&apos;ll help you list your space or find a
            roommate who actually fits how you live.
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-4xl gap-5 sm:grid-cols-2">
          <MatchOptionCard
            to="/post?mode=accommodation&intent=roommate"
            icon={Building2}
            title="List your room"
            description="Already have a room or apartment? List it to find a compatible roommate or flatmate to share with — not for renting a whole place to a solo tenant."
            cta="List your room"
            gradient="from-brand-500 to-brand-700"
            highlights={["Free to list", "Reach 12k+ seekers", "ID-verified inquiries"]}
          />
          <MatchOptionCard
            to="/match/seeker"
            icon={UserSearch}
            title="Looking for a Roommate"
            description="You need a room or flatmate. Build a lifestyle profile and get AI-scored matches with people who share your habits."
            cta="Find a roommate"
            gradient="from-violet-500 to-brand-700"
            highlights={["12 compatibility dimensions", "Deal-breaker filters", "Verified matches only"]}
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Emirates ID verified
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4 text-brand-600" />
            Secure in-app messaging
          </span>
        </div>
      </section>
    </div>
  );
}

function MatchOptionCard({
  to,
  icon: Icon,
  title,
  description,
  cta,
  gradient,
  highlights,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  gradient: string;
  highlights: string[];
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft sm:p-8"
    >
      <div
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md transition group-hover:scale-105`}
      >
        <Icon className="h-7 w-7" />
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>

      <ul className="mt-5 space-y-2">
        {highlights.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
            {item}
          </li>
        ))}
      </ul>

      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
