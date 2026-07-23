import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Briefcase,
  Wrench,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Star,
  CheckCircle2,
  Zap,
  Users,
  MapPin,
  Calculator,
  Heart,
  BellRing,
  Map as MapIcon,
  GitCompare,
  Lock,
  Globe,
  Truck,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ListingCard } from "@/components/ListingCard";
import { JobCard } from "@/components/JobCard";
import { ServiceCard } from "@/components/ServiceCard";
import { MobileAppSection } from "@/components/MobileAppSection";
import { HeroHeadlineCollage } from "@/components/HeroHeadlineCollage";
import { useListings, useJobs, useServices } from "@/lib/catalog/useCatalog";
import {
  HOME_SERVICE_CATEGORIES,
  STANDALONE_SERVICE_CATEGORIES,
  categoryStartingPrices,
  featuredServices,
  standaloneServiceListPath,
} from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";
import { PICKUP_ENABLED } from "@/lib/pickup/flags";

export function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <AIMatchBanner />
      <PowerTools />
      <FeaturedListings />
      <HowItWorks />
      <StatsBand />
      <TopJobs />
      <PopularServices />
      <StandaloneServices />
      <TrustSection />
      <MobileAppSection />
      <Pricing />
      <Testimonials />
      <CommunityBand />
      <FinalCTA />
    </>
  );
}

const powerTools = [
  {
    to: "/match",
    icon: Sparkles,
    title: "AI Matchmaker",
    sub: "Get scored compatibility with verified roommates.",
    color: "from-brand-50 to-brand-100 text-brand-700",
  },
  {
    to: "/accommodation",
    icon: MapIcon,
    title: "Map view",
    sub: "Browse the whole UAE visually with pins & prices.",
    color: "from-sky-50 to-sky-100 text-sky-700",
  },
  {
    to: "/calculator",
    icon: Calculator,
    title: "Move-in calculator",
    sub: "See your real upfront cost — DEWA, ejari & more.",
    color: "from-amber-50 to-amber-100 text-amber-700",
  },
  {
    to: "/saved-searches",
    icon: BellRing,
    title: "New-listing alerts",
    sub: "Save any filter; get pinged the moment it matches.",
    color: "from-emerald-50 to-emerald-100 text-emerald-700",
  },
  {
    to: "/wishlist",
    icon: Heart,
    title: "Wishlist",
    sub: "Shortlist favourites and track price drops.",
    color: "from-red-50 to-red-100 text-red-600",
  },
  {
    to: "/community",
    icon: Users,
    title: "Community",
    sub: "Forums & meetups — ask locals and RSVP to events.",
    color: "from-rose-50 to-rose-100 text-rose-700",
  },
  {
    to: "/resume",
    icon: FileText,
    title: "Resume builder",
    sub: "Create a professional CV with live preview & PDF export.",
    color: "from-indigo-50 to-indigo-100 text-indigo-700",
  },
  {
    to: "/pickup",
    icon: Truck,
    title: "Book pickup",
    sub: "Uber-style movers — pick vehicle size & helpers.",
    color: "from-violet-50 to-violet-100 text-violet-700",
    pickupOnly: true,
  },
  {
    to: "/accommodation",
    icon: GitCompare,
    title: "Compare listings",
    sub: "Lay 3 rooms side-by-side with one click.",
    color: "from-violet-50 to-violet-100 text-violet-700",
  },
];

function PowerTools() {
  return (
    <section className="container mt-24">
      <SectionHeader
        eyebrow="Built for power-renters"
        title="Tools you won't find on legacy classifieds"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {powerTools
          .filter((tool) => PICKUP_ENABLED || !("pickupOnly" in tool && tool.pickupOnly))
          .map(({ to, icon: Icon, title, sub, color }) => (
          <Link
            key={title}
            to={to}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-soft"
          >
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{sub}</p>
            <ArrowRight className="absolute right-5 top-5 h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-700" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function AIMatchBanner() {
  return (
    <section className="container mt-24">
      <Link
        to="/match"
        className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-8 sm:p-12"
      >
        <div className="absolute inset-0 bg-grid-light bg-[size:32px_32px] opacity-10" aria-hidden />
        <div
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              New · AI Matchmaking Agent
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Stop scrolling.{" "}
              <span className="bg-gradient-to-br from-accent-200 to-white bg-clip-text text-transparent">
                Let the AI find your roommate.
              </span>
            </h2>
            <p className="mt-3 text-base text-brand-100">
              Compatibility scored across lifestyle, schedule, and habits. We only
              suggest verified people who fit how you actually live.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 transition group-hover:bg-brand-50">
                Try the matchmaker
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="text-xs font-medium text-brand-200">
                Free · 60 seconds · No credit card
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {[
              { v: "94%", l: "avg match" },
              { v: "12", l: "dimensions" },
              { v: "1m", l: "to setup" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl bg-white/10 px-5 py-4 text-center text-white backdrop-blur-sm"
              >
                <div className="text-2xl font-black tracking-tight">{s.v}</div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-brand-200">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-radial-fade">
      <div
        className="absolute inset-0 bg-grid-light bg-[size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden
      />
      <div className="container relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/50 px-3 py-1 text-xs font-medium text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered matching is live
            <span className="text-brand-300">·</span>
            <Link to="/accommodation" className="hover:underline">
              Try it
            </Link>
          </div>
          <div className="relative mx-auto mt-8 w-full max-w-5xl px-2">
            <div className="flex flex-col items-center gap-8 lg:grid lg:grid-cols-[1fr_minmax(240px,300px)] lg:items-center lg:gap-10 xl:grid-cols-[1fr_320px] xl:gap-12">
              <h1 className="order-2 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:order-1 lg:justify-self-center lg:text-center">
                Your home, job, and{" "}
                <span className="gradient-text">help around the house</span> — all in one
                place.
              </h1>
              <HeroHeadlineCollage className="order-1 w-full max-w-md lg:order-2 lg:rotate-2 lg:shadow-2xl" />
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            The UAE's first all-in-one classifieds platform. Verified listings, secure
            chat, and trusted providers — for expats and locals alike.
          </p>

          <SearchHero />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ID-verified users
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              30-second posting
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              Free to list
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchHero() {
  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-soft backdrop-blur-lg">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search room, job, or service…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 sm:border-l sm:border-slate-200">
          <MapPin className="h-5 w-5 text-slate-400" />
          <select className="h-12 flex-1 bg-transparent text-sm outline-none">
            <option>All UAE</option>
            <option>Dubai</option>
            <option>Abu Dhabi</option>
            <option>Sharjah</option>
            <option>Ajman</option>
            <option>Ras Al Khaimah</option>
          </select>
        </div>
        <Button size="lg" className="sm:h-12">
          Search
        </Button>
      </form>
    </div>
  );
}

const categories = [
  {
    to: "/accommodation",
    icon: Building2,
    title: "Accommodation",
    sub: "Rooms, partitions, studios & apartments",
    count: "12,400+ listings",
    gradient: "from-brand-500 to-brand-700",
  },
  {
    to: "/jobs",
    icon: Briefcase,
    title: "Jobs",
    sub: "Full-time, freelance, and remote",
    count: "3,800+ open roles",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    to: "/services",
    icon: Wrench,
    title: "Home Services",
    sub: "Cleaning, AC, plumbing, pest control & more",
    count: "1,200+ listings",
    gradient: "from-accent-500 to-accent-700",
  },
  {
    to: "/pickup",
    icon: Truck,
    title: "Pickup & Movers",
    sub: "Book a truck + helpers like Uber",
    count: "Instant quotes",
    gradient: "from-violet-500 to-violet-700",
    pickupOnly: true,
  },
];

function Categories() {
  const visibleCategories = PICKUP_ENABLED
    ? categories
    : categories.filter((c) => !("pickupOnly" in c && c.pickupOnly));

  return (
    <section className="container -mt-10 sm:-mt-14 relative">
      <div
        className={`grid gap-4 sm:grid-cols-2 ${visibleCategories.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {visibleCategories.map(({ to, icon: Icon, title, sub, count, gradient }) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft transition-all hover:-translate-y-1"
          >
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{sub}</p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">{count}</span>
              <span className="inline-flex items-center gap-1 text-brand-700">
                Browse
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  cta,
  ctaTo,
}: {
  eyebrow: string;
  title: string;
  cta?: string;
  ctaTo?: string;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
      </div>
      {cta && ctaTo && (
        <Link to={ctaTo}>
          <Button variant="outline" size="sm">
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function FeaturedListings() {
  const { items: listings } = useListings();
  return (
    <section className="container mt-24">
      <SectionHeader
        eyebrow="Accommodation"
        title="Featured listings near you"
        cta="View all"
        ctaTo="/accommodation"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.slice(0, 4).map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Search,
    title: "1. Search & filter",
    sub: "Use AI-powered filters to find the perfect room, job, or service in seconds.",
  },
  {
    icon: MessageSquare,
    title: "2. Chat securely",
    sub: "All conversations happen on-platform with built-in spam protection.",
  },
  {
    icon: ShieldCheck,
    title: "3. Close the deal",
    sub: "Auto-generated agreement, secure payment, and rating system protect both parties.",
  },
];

function HowItWorks() {
  return (
    <section className="container mt-24">
      <SectionHeader eyebrow="How it works" title="Three steps to your next move" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/40 p-6"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const stats = [
  { v: "150K+", l: "Active users" },
  { v: "30K+", l: "Listings posted" },
  { v: "98%", l: "Verified accounts" },
  { v: "4.8/5", l: "User rating" },
];

function StatsBand() {
  return (
    <section className="mt-24">
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 py-14 text-white">
        <div className="container grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-black tracking-tight sm:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest text-brand-200">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopJobs() {
  const { items: jobs } = useJobs();
  return (
    <section className="container mt-24">
      <SectionHeader
        eyebrow="Jobs"
        title="Hand-picked roles this week"
        cta="See all jobs"
        ctaTo="/jobs"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.slice(0, 3).map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
    </section>
  );
}

function PopularServices() {
  const { items: services } = useServices();
  const topCategories = HOME_SERVICE_CATEGORIES.filter((c) => c.popular);
  const featured = featuredServices(services, 4, { homeServicesOnly: true });
  const startingPrices = useMemo(
    () => categoryStartingPrices(services, HOME_SERVICE_CATEGORIES),
    [services]
  );

  return (
    <section className="container mt-24">
      <SectionHeader
        eyebrow="Home Services"
        title="Home services from verified accounts"
        cta="Browse all"
        ctaTo="/services"
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topCategories.map(({ key, label, description, icon: Icon }) => (
          <Link
            key={key}
            to={`/services?category=${encodeURIComponent(key)}`}
            className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:border-brand-200 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              <p className="mt-2 text-xs font-semibold text-brand-600">
                {startingPrices[key] !== undefined
                  ? `From ${formatPrice(startingPrices[key]!)}`
                  : "Browse listings"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">Featured listings</h3>
          <p className="mt-1 text-sm text-slate-600">From individuals and businesses — same-day slots on most bookings</p>
        </div>
        <Link
          to="/services"
          className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 sm:inline-flex"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </section>
  );
}

function StandaloneServices() {
  const { items: services } = useServices();
  const startingPrices = useMemo(
    () => categoryStartingPrices(services, STANDALONE_SERVICE_CATEGORIES),
    [services]
  );

  return (
    <section className="container mt-24">
      <SectionHeader
        eyebrow="Specialty services"
        title="Movers, tutoring & homemade meals"
      />
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Each category has its own dedicated marketplace — separate from home services.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STANDALONE_SERVICE_CATEGORIES.map(({ key, label, description, icon: Icon }) => (
          <Link
            key={key}
            to={standaloneServiceListPath(key)}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:border-brand-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
              <p className="mt-2 text-xs font-semibold text-brand-600">
                {startingPrices[key] !== undefined
                  ? `From ${formatPrice(startingPrices[key]!)}`
                  : "Browse listings"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Emirates ID + selfie liveness",
    sub: "Every user passes KYC with a UAE-licensed partner before they can message or post.",
  },
  {
    icon: Lock,
    title: "Secure in-app payments",
    sub: "Hold deposits in escrow until the move-in is verified. No more bank transfer scams.",
  },
  {
    icon: TrendingUp,
    title: "Transparent Trust Score",
    sub: "Reviews, response rate, document verification, and history combine into a single 0-100 score.",
  },
  {
    icon: Globe,
    title: "Available in 7 languages",
    sub: "English, Arabic, Hindi, Urdu, Russian, Tagalog, Turkish — built for the UAE's actual demographic.",
  },
];

function TrustSection() {
  return (
    <section className="container mt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge tone="brand" className="bg-brand-100/60">
            Trust & Safety
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            We verify everyone — so you don't have to.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Khaleej is built trust-first. Listings are reviewed, users are verified, and every
            deal is backed by a binding auto-generated agreement.
          </p>
          <div className="mt-8 space-y-5">
            {trustFeatures.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-radial-fade" aria-hidden />
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
              alt=""
              className="aspect-[3/4] rounded-2xl object-cover shadow-soft"
            />
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
                alt=""
                className="aspect-square rounded-2xl object-cover shadow-soft"
              />
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
                alt=""
                className="aspect-[4/5] rounded-2xl object-cover shadow-soft"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "0",
    sub: "Per listing",
    desc: "List your room, job, or service for free. Pay only on success.",
    features: [
      "Unlimited listings",
      "AI-suggested edits",
      "Commission paid only after deal closes",
      "Basic visibility",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Boost",
    price: "49",
    sub: "Per featured listing",
    desc: "Stand out at the top of search results and category pages for 7 days.",
    features: [
      "Featured badge",
      "Top-of-search placement",
      "Homepage hero rotation",
      "Detailed view analytics",
    ],
    cta: "Boost a listing",
    highlighted: true,
  },
  {
    name: "Business",
    price: "299",
    sub: "Per month",
    desc: "For agents, employers, and service businesses with high volume.",
    features: [
      "Up to 50 active listings",
      "Team accounts & roles",
      "Bulk upload & API access",
      "Priority support",
    ],
    cta: "Start trial",
    highlighted: false,
  },
];

function Pricing() {
  return (
    <section className="container mt-24">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Pricing
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Free to start. Pay only when you grow.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
          Choose the plan that fits — switch any time.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-3xl p-7 ${
              p.highlighted
                ? "bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-2xl shadow-brand-900/30 ring-1 ring-brand-700"
                : "border border-slate-200 bg-white"
            }`}
          >
            {p.highlighted && (
              <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-bold">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-sm font-semibold opacity-80">AED</span>
              <span className="text-5xl font-black tracking-tight">{p.price}</span>
            </div>
            <p
              className={`mt-1 text-xs font-medium uppercase tracking-widest ${
                p.highlighted ? "text-brand-200" : "text-slate-500"
              }`}
            >
              {p.sub}
            </p>
            <p
              className={`mt-4 text-sm ${p.highlighted ? "text-brand-100" : "text-slate-600"}`}
            >
              {p.desc}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                      p.highlighted ? "text-accent-400" : "text-emerald-500"
                    }`}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={p.highlighted ? "secondary" : "primary"}
              size="lg"
              className={`mt-8 w-full ${p.highlighted ? "bg-white text-brand-700 hover:bg-brand-50" : ""}`}
            >
              {p.cta}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "Found my flatmate in 3 days. The AI match score was scarily accurate — we have the same routine and we're both vegetarians!",
    name: "Aisha M.",
    role: "Marketing Lead, Dubai Marina",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Posted my AC repair business and got 12 bookings in the first week. The free commission model is honestly genius.",
    name: "Rohan M.",
    role: "Service Provider, Sharjah",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "As an HR lead, I shortlisted candidates 4x faster than on legacy job boards. The CV-to-role matching is spot on.",
    name: "Sofia R.",
    role: "Talent Partner, Tabby",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
];

function Testimonials() {
  return (
    <section className="container mt-24">
      <SectionHeader eyebrow="Loved by the UAE" title="What our users say" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-1 text-accent-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">"{t.quote}"</p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommunityBand() {
  return (
    <section className="container mt-24">
      <div className="grid gap-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft lg:grid-cols-2">
        <div className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Beyond listings
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Forums & meetups — the social layer apps like Roomy Finder popularised
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Ask locals, compare neighbourhoods, and join small verified events. Housing
            feels easier when you know the people.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/community">
              <Button>
                Explore community
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline">
                <Lock className="h-4 w-4" />
                How payments work
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative flex flex-col justify-center bg-gradient-to-br from-slate-900 to-brand-950 p-8 text-white sm:p-10">
          <div className="absolute inset-0 bg-grid-light bg-[size:24px_24px] opacity-10" aria-hidden />
          <ul className="relative space-y-4 text-sm text-brand-100">
            <li className="flex items-start gap-3">
              <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-300" />
              <span>
                <strong className="text-white">Discussion forums</strong> — emirate-tagged
                threads for budget, areas, and roommate etiquette.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-300" />
              <span>
                <strong className="text-white">Secure inbox</strong> — chats stay in-app until
                you choose to share contact details.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-300" />
              <span>
                <strong className="text-white">Verified RSVPs</strong> — events prioritise
                ID-checked members as we roll out Phase 2.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-16 text-center text-white sm:px-12">
        <div className="absolute inset-0 bg-grid-light bg-[size:32px_32px] opacity-10" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Users className="h-3.5 w-3.5" />
            Join 150K+ users
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to find your next home, job, or service?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-brand-100">
            Sign up free in under 30 seconds. No credit card needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-brand-700 hover:bg-brand-50"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/post">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Post a listing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
