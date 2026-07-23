import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  MapPin,
  Plus,
  Search,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/Button";
import { mockServices } from "@/data/mock";
import {
  HOME_SERVICE_CATEGORIES,
  SERVICE_EMIRATES,
  SERVICE_TRUST_PILLARS,
  MEAL_CUISINES,
  TUTORING_LANGUAGES,
  filterServices,
  categoryStartingPrices,
  homeServicesOnly,
  isStandaloneServiceCategory,
  standaloneServiceListPath,
  standaloneServicePostPath,
  type ServiceFilterCategory,
  type StandaloneServiceCategory,
} from "@/lib/services/catalog";
import { cn, formatPrice } from "@/lib/utils";
import { PICKUP_ENABLED } from "@/lib/pickup/flags";
import type { Emirate, ServiceCategory } from "@/types";

function parseCategory(value: string | null): ServiceFilterCategory {
  if (!value || value === "All") return "All";
  const match = HOME_SERVICE_CATEGORIES.find((c) => c.key === value);
  return match ? match.key : "All";
}

function parseEmirate(value: string | null): Emirate | "All UAE" {
  if (!value || value === "All UAE") return "All UAE";
  return SERVICE_EMIRATES.includes(value as Emirate | "All UAE")
    ? (value as Emirate | "All UAE")
    : "All UAE";
}

export function ServicesList({
  variant = "home-services",
}: {
  variant?: "home-services" | "movers" | "tutoring" | "meals";
}) {
  const isMoversPage = variant === "movers";
  const isTutoringPage = variant === "tutoring";
  const isMealsPage = variant === "meals";
  const isSpecialtyPage = isMoversPage || isTutoringPage || isMealsPage;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const active: ServiceFilterCategory = isMoversPage
    ? "Movers"
    : isTutoringPage
      ? "Language Tutoring"
      : isMealsPage
        ? "Homemade Meals"
      : parseCategory(searchParams.get("category"));
  const emirate = parseEmirate(searchParams.get("emirate"));
  const language = searchParams.get("language") ?? "all";
  const cuisine = searchParams.get("cuisine") ?? "all";

  useEffect(() => {
    if (isSpecialtyPage) return;
    const raw = searchParams.get("category");
    if (!raw || !isStandaloneServiceCategory(raw as ServiceCategory)) return;
    navigate(standaloneServiceListPath(raw as StandaloneServiceCategory), { replace: true });
  }, [isSpecialtyPage, navigate, searchParams]);

  const filtered = useMemo(() => {
    const base = isSpecialtyPage ? mockServices : homeServicesOnly(mockServices);
    return filterServices(base, {
      category: active,
      emirate,
      query: q,
      language: isTutoringPage ? language : undefined,
      cuisine: isMealsPage ? cuisine : undefined,
    });
  }, [active, emirate, q, language, cuisine, isTutoringPage, isMealsPage, isSpecialtyPage]);

  const startingPrices = useMemo(
    () =>
      categoryStartingPrices(
        mockServices,
        isSpecialtyPage ? undefined : HOME_SERVICE_CATEGORIES
      ),
    [isSpecialtyPage]
  );

  const popularCategories = HOME_SERVICE_CATEGORIES.filter((c) => c.popular);

  function updateParams(next: {
    category?: ServiceFilterCategory;
    emirate?: Emirate | "All UAE";
    q?: string;
    language?: string;
    cuisine?: string;
  }) {
    const params = new URLSearchParams(searchParams);
    const category = isMoversPage
      ? "Movers"
      : isTutoringPage
        ? "Language Tutoring"
        : isMealsPage
          ? "Homemade Meals"
        : (next.category ?? active);
    const nextEmirate = next.emirate ?? emirate;
    const nextQ = next.q ?? q;
    const nextLanguage = next.language ?? language;
    const nextCuisine = next.cuisine ?? cuisine;

    if (category === "All") params.delete("category");
    else if (!isSpecialtyPage) params.set("category", category);

    if (nextEmirate === "All UAE") params.delete("emirate");
    else params.set("emirate", nextEmirate);

    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");

    if (isTutoringPage) {
      if (!nextLanguage || nextLanguage === "all") params.delete("language");
      else params.set("language", nextLanguage);
    }

    if (isMealsPage) {
      if (!nextCuisine || nextCuisine === "all") params.delete("cuisine");
      else params.set("cuisine", nextCuisine);
    }

    setSearchParams(params, { replace: true });
  }

  function selectLanguage(lang: string) {
    updateParams({ language: lang });
    document.getElementById("service-results")?.scrollIntoView({ behavior: "smooth" });
  }

  function selectCuisine(c: string) {
    updateParams({ cuisine: c });
    document.getElementById("service-results")?.scrollIntoView({ behavior: "smooth" });
  }

  function selectCategory(category: ServiceCategory | "All") {
    updateParams({ category });
    document.getElementById("service-results")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q });
    document.getElementById("service-results")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="bg-slate-50/60 pb-20">
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-white to-slate-50/80 pt-8 pb-10">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              {isMoversPage
                ? "Movers & packers"
                : isTutoringPage
                  ? "Language tutoring"
                  : isMealsPage
                    ? "Homemade meals"
                  : "Home services"}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {isMoversPage
                ? "Book trusted movers across the UAE"
                : isTutoringPage
                  ? "Find a language tutor near you"
                  : isMealsPage
                    ? "Homemade meals & small meal plans"
                  : "Home services from verified accounts"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {isMoversPage
                ? "Apartment moves, villa relocations, packing & delivery — from verified individuals and businesses."
                : isTutoringPage
                  ? "Search by language, level, and location — book 1-on-1 or group lessons online or in person."
                  : isMealsPage
                    ? "Home cooks selling affordable daily meals, plus small restaurants with weekly plans — pickup or delivery."
                  : "Cleaning, AC, plumbing, pest control & more — listings from verified personal and business accounts."}
            </p>
            {isTutoringPage && (
              <Link to={standaloneServicePostPath("Language Tutoring")} className="mt-4 inline-block">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  List your tutoring service
                </Button>
              </Link>
            )}
            {isMealsPage && (
              <Link to={standaloneServicePostPath("Homemade Meals")} className="mt-4 inline-block">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Sell your homemade meals
                </Button>
              </Link>
            )}
            {isMoversPage && (
              <Link to={standaloneServicePostPath("Movers")} className="mt-4 inline-block">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  List your moving service
                </Button>
              </Link>
            )}
            {!isSpecialtyPage && (
              <Link to="/post?mode=service" className="mt-4 inline-block">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  List your service
                </Button>
              </Link>
            )}
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-3xl rounded-2xl border border-slate-200/70 bg-white p-2 shadow-soft"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-brand-600" />
                <select
                  value={emirate}
                  onChange={(e) =>
                    updateParams({ emirate: e.target.value as Emirate | "All UAE" })
                  }
                  className="h-12 w-full bg-transparent text-sm font-medium outline-none"
                  aria-label="Service location"
                >
                  {SERVICE_EMIRATES.map((e) => (
                    <option key={e} value={e}>
                      {e === "All UAE" ? "Where do you need service?" : e}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-[1.4] items-center gap-2 rounded-xl bg-slate-50 px-3">
                <Search className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    isMoversPage
                      ? "Search movers, packing, delivery…"
                      : isTutoringPage
                        ? "Search tutor name, IELTS, business English…"
                        : isMealsPage
                          ? "Search biryani, meal plan, halal, Filipino…"
                        : "Search cleaning, AC, plumbing, pest control…"
                  }
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <Button type="submit" size="lg" className="sm:h-12 sm:px-8">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_TRUST_PILLARS.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-slate-200/70 bg-white/80 p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container pt-10">
        {!isSpecialtyPage && (
          <>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Popular categories
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Tap a category to see packages and book instantly
            </p>
          </div>
          {active !== "All" && (
            <button
              type="button"
              onClick={() => selectCategory("All")}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <X className="h-4 w-4" />
              Clear filter
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popularCategories.map(({ key, label, description, icon: Icon }) => {
            const isActive = active === key;
            const fromPrice = startingPrices[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCategory(isActive ? "All" : key)}
                className={cn(
                  "group flex items-start gap-4 rounded-2xl border p-4 text-left transition",
                  isActive
                    ? "border-brand-600 bg-brand-600 text-white shadow-md"
                    : "border-slate-200/70 bg-white hover:border-brand-200 hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
                    isActive ? "bg-white/15" : "bg-brand-50 text-brand-600"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{label}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      isActive ? "text-white/80" : "text-slate-500"
                    )}
                  >
                    {description}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-xs font-semibold",
                      isActive ? "text-white" : "text-brand-600"
                    )}
                  >
                    {fromPrice !== undefined
                      ? `From ${formatPrice(fromPrice)}`
                      : "Browse listings"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {HOME_SERVICE_CATEGORIES.filter((c) => !c.popular).map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            const fromPrice = startingPrices[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectCategory(isActive ? "All" : key)}
                className={cn(
                  "inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {fromPrice !== undefined && (
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      isActive ? "text-white/80" : "text-brand-600"
                    )}
                  >
                    from {formatPrice(fromPrice)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
          </>
        )}

        {isMoversPage && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Movers listings</p>
                <p className="text-xs text-slate-600">
                  Moving & packing from verified individuals and businesses
                </p>
              </div>
            </div>
            <Link
              to={standaloneServicePostPath("Movers")}
              className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" />
              List your moving service
            </Link>
          </div>
        )}

        {isTutoringPage && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50 to-brand-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Language tutors</p>
                  <p className="text-xs text-slate-600">
                    Tutors and language schools — verified personal & business accounts
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={standaloneServicePostPath("Language Tutoring")}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Become a tutor
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Filter by language</h2>
                {language !== "all" && (
                  <button
                    type="button"
                    onClick={() => selectLanguage("all")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TUTORING_LANGUAGES.map((lang) => {
                  const isActive = language.toLowerCase() === lang.toLowerCase();
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => selectLanguage(isActive ? "all" : lang)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        isActive
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                      )}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isMealsPage && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600 text-white">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Homemade meals</p>
                  <p className="text-xs text-slate-600">
                    Home cooks & small kitchens
                    {startingPrices["Homemade Meals"] !== undefined
                      ? ` — single meals from ${formatPrice(startingPrices["Homemade Meals"])}`
                      : ""}
                    , weekly plans available
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={standaloneServicePostPath("Homemade Meals")}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Sell homemade food
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Filter by cuisine</h2>
                {cuisine !== "all" && (
                  <button
                    type="button"
                    onClick={() => selectCuisine("all")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {MEAL_CUISINES.map((c) => {
                  const isActive = cuisine.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => selectCuisine(isActive ? "all" : c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        isActive
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-amber-200"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isSpecialtyPage && (
          <div className="mb-8 space-y-4">
          <Link
            to="/meals"
            className="flex items-center justify-between gap-4 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-white p-4 transition hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-white">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Craving homemade food?
                </p>
                <p className="text-xs text-slate-600">
                  Home cooks & meal plans
                  {startingPrices["Homemade Meals"] !== undefined
                    ? ` from ${formatPrice(startingPrices["Homemade Meals"])}`
                    : ""}{" "}
                  — Pakistani, Indian, Filipino & more
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          </Link>
          <Link
            to="/tutoring"
            className="flex items-center justify-between gap-4 rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50/80 to-white p-4 transition hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Looking to learn a language?
                </p>
                <p className="text-xs text-slate-600">
                  Browse tutors for English, Arabic, Hindi, French & more
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          </Link>
          </div>
        )}

        {PICKUP_ENABLED && !isSpecialtyPage && (
          <Link
            to="/pickup"
            className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50 to-brand-50 p-4 transition hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Need movers instead? Book pickup instantly
                </p>
                <p className="text-xs text-slate-600">
                  Vehicle + helpers, live quotes — separate from home services
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          </Link>
        )}

        <div
          id="service-results"
          className={cn(
            "scroll-mt-24",
            isSpecialtyPage ? "mt-0" : PICKUP_ENABLED ? "mt-12" : "mt-8"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {isMoversPage
                  ? "Movers listings"
                  : isTutoringPage
                    ? "Tutor listings"
                    : isMealsPage
                      ? "Meal listings"
                    : active === "All"
                      ? "All services"
                      : active}
                {emirate !== "All UAE" ? ` in ${emirate}` : ""}
                {isTutoringPage && language !== "all" ? ` · ${language}` : ""}
                {isMealsPage && cuisine !== "all" ? ` · ${cuisine}` : ""}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {filtered.length}{" "}
                {isTutoringPage
                  ? `tutor${filtered.length === 1 ? "" : "s"}`
                  : isMealsPage
                    ? `meal listing${filtered.length === 1 ? "" : "s"}`
                  : `listing${filtered.length === 1 ? "" : "s"}`}{" "}
                available
                {q ? ` for “${q}”` : ""}
              </p>
            </div>
            {!isTutoringPage && !isMealsPage && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <Zap className="h-3.5 w-3.5" />
              Same-day on most bookings
            </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="font-semibold text-slate-700">No services match your filters.</p>
              <p className="mt-2 text-sm text-slate-500">
                {isTutoringPage
                  ? "Try another language or emirate, or list your own tutoring service."
                  : isMealsPage
                    ? "Try another cuisine or emirate, or list your own homemade meals."
                  : "Try another emirate or category, or clear your search."}
              </p>
              {isTutoringPage && (
                <Link
                  to={standaloneServicePostPath("Language Tutoring")}
                  className="mt-4 inline-block"
                >
                  <Button size="md">List as a tutor</Button>
                </Link>
              )}
              {isMealsPage && (
                <Link
                  to={standaloneServicePostPath("Homemade Meals")}
                  className="mt-4 inline-block"
                >
                  <Button size="md">Sell homemade meals</Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="md"
                className={cn(isTutoringPage || isMealsPage ? "ml-2 mt-4" : "mt-4")}
                onClick={() => {
                  setQ("");
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("q");
                      if (isSpecialtyPage) {
                        next.delete("language");
                        next.delete("cuisine");
                      }
                      return next;
                    },
                    { replace: true }
                  );
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
