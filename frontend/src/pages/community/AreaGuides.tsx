import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MapPin,
  Building2,
  Users,
  Filter,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AreaInsightCard } from "@/components/area/AreaInsightCard";
import { areaInsights } from "@/data/areaInsights";
import type {
  CrowdLevel,
  PricePerception,
  BuildingAgeTag,
  UpkeepQuality,
} from "@/types/areaInsights";
import { cn } from "@/lib/utils";

export function AreaGuides() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "neighborhood" | "building">("all");
  const [emirate, setEmirate] = useState("");
  const [crowd, setCrowd] = useState<CrowdLevel | "">("");
  const [price, setPrice] = useState<PricePerception | "">("");
  const [age, setAge] = useState<BuildingAgeTag | "">("");
  const [cleanliness, setCleanliness] = useState<UpkeepQuality | "">("");
  const [maintenance, setMaintenance] = useState<UpkeepQuality | "">("");

  const filtered = useMemo(() => {
    return areaInsights.filter((a) => {
      if (type !== "all" && a.type !== type) return false;
      if (emirate && a.emirate !== emirate) return false;
      if (crowd && a.tags.crowd !== crowd) return false;
      if (price && a.tags.pricePerception !== price) return false;
      if (age && a.tags.buildingAge !== age) return false;
      if (cleanliness && a.tags.cleanliness !== cleanliness) return false;
      if (maintenance && a.tags.maintenance !== maintenance) return false;
      if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, type, emirate, crowd, price, age, cleanliness, maintenance]);

  const emirates = [...new Set(areaInsights.map((a) => a.emirate))];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-20 pt-8">
      <div className="container max-w-6xl">
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Community
        </Link>

        <header className="mt-6">
          <Badge tone="brand" className="bg-brand-50/80">
            <MapPin className="h-3 w-3" />
            Area guides
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Neighborhood & building insights
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Tags are derived from community reviews and forum posts — crowded vs quiet,
            building age, price perception, cleanliness, overall maintenance, and who tends
            to live there. Reviews can only be posted by people who currently live in — or
            have lived in — that neighborhood or building (set on your roommate profile).
          </p>
        </header>

        <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search area or building…"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "neighborhood", "building"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition",
                    type === t
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {t === "all" ? "All" : t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="">All emirates</option>
              {emirates.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <select
              value={crowd}
              onChange={(e) => setCrowd(e.target.value as CrowdLevel | "")}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="">Any crowd level</option>
              <option value="quiet">Quiet</option>
              <option value="moderate">Moderate</option>
              <option value="crowded">Crowded</option>
            </select>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value as BuildingAgeTag | "")}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="">Any building age</option>
              <option value="new">New builds</option>
              <option value="mixed">Mixed</option>
              <option value="established">Older</option>
            </select>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value as PricePerception | "")}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="">Any price feel</option>
              <option value="fair">Fair value</option>
              <option value="pricey">Pricey</option>
              <option value="overpriced">Overpriced</option>
            </select>
            <select
              value={cleanliness}
              onChange={(e) => setCleanliness(e.target.value as UpkeepQuality | "")}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="">Any cleanliness</option>
              <option value="excellent">Very clean</option>
              <option value="good">Clean</option>
              <option value="fair">Average</option>
              <option value="poor">Issues reported</option>
            </select>
            <select
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value as UpkeepQuality | "")}
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            >
              <option value="">Any maintenance</option>
              <option value="excellent">Well maintained</option>
              <option value="good">Good upkeep</option>
              <option value="fair">Average upkeep</option>
              <option value="poor">Poor maintenance</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          <strong className="text-slate-900">{filtered.length}</strong> places match your
          filters
        </p>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-600">
            No areas match — try clearing filters.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((insight) => (
              <AreaInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            {
              icon: Users,
              title: "Crowded",
              text: "From review crowd scores (1 = quiet, 5 = packed).",
            },
            {
              icon: Building2,
              title: "Building age",
              text: "New vs mixed vs established stock mentioned in posts.",
            },
            {
              icon: Sparkles,
              title: "Cleanliness",
              text: "Common areas, lifts, and flats — from review cleanliness scores.",
            },
            {
              icon: Wrench,
              title: "Maintenance",
              text: "Facilities, repairs, and building management quality in reviews.",
            },
            {
              icon: MapPin,
              title: "Nationalities",
              text: "Top communities mentioned across reviews, as % share.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm"
            >
              <Icon className="h-5 w-5 text-brand-600" />
              <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
