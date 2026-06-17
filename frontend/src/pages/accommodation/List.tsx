import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SlidersHorizontal, X, Search, MapPin, LayoutGrid, Map as MapIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ListingCard } from "@/components/ListingCard";
import { MapView } from "@/components/MapView";
import { SaveSearchButton } from "@/components/SaveSearchButton";
import { LocationSelectField } from "@/components/match/LocationSelectField";
import { mockListings } from "@/data/mock";
import {
  formatLocationPreference,
  listingMatchesAnyLocation,
  type LocationPreference,
} from "@/lib/matchmaking/uaeLocations";
import type { GenderPreference, RoomType, Emirate, ListedBy } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

const AMENITIES = ["WiFi", "AC", "Parking", "Gym", "Pool", "Furnished", "Bills Included"];
const ROOM_TYPES: RoomType[] = [
  "Bedspace",
  "Partition",
  "Private Room",
  "Studio",
  "Full Apartment",
];
const EMIRATES: Emirate[] = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

interface Filters {
  q: string;
  emirate: Emirate | "";
  locations: LocationPreference[];
  minPrice: number;
  maxPrice: number;
  roomTypes: Set<RoomType>;
  gender: GenderPreference | "";
  amenities: Set<string>;
  maxTenants: number;
  maxMetroDistance: number;
  listedBy: ListedBy | "";
}

const defaultFilters: Filters = {
  q: "",
  emirate: "",
  locations: [],
  minPrice: 0,
  maxPrice: 20000,
  roomTypes: new Set(),
  gender: "",
  amenities: new Set(),
  maxTenants: 10,
  maxMetroDistance: 10,
  listedBy: "",
};

export function AccommodationList() {
  const location = useLocation();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [drawer, setDrawer] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"grid" | "map">("grid");

  const filtered = useMemo(() => {
    let r = mockListings.filter((l) => {
      if (
        filters.q &&
        ![l.title, l.area, l.emirate, l.description]
          .join(" ")
          .toLowerCase()
          .includes(filters.q.toLowerCase())
      )
        return false;
      if (filters.emirate && l.emirate !== filters.emirate) return false;
      if (!listingMatchesAnyLocation(l, filters.locations)) return false;
      if (l.price < filters.minPrice || l.price > filters.maxPrice) return false;
      if (filters.roomTypes.size && !filters.roomTypes.has(l.roomType)) return false;
      if (filters.gender && l.genderPreference !== filters.gender) return false;
      if (filters.amenities.size) {
        for (const a of filters.amenities) if (!l.amenities.includes(a)) return false;
      }
      if (l.tenants > filters.maxTenants) return false;
      if (l.distanceToMetro > filters.maxMetroDistance) return false;
      if (filters.listedBy && l.listedBy !== filters.listedBy) return false;
      return true;
    });

    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    else if (sort === "newest")
      r = [...r].sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
    else r = [...r].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    return r;
  }, [filters, sort]);

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (filters.emirate)
      chips.push({
        label: filters.emirate,
        clear: () => setFilters({ ...filters, emirate: "" }),
      });
    filters.locations.forEach((loc) =>
      chips.push({
        label: formatLocationPreference(loc),
        clear: () =>
          setFilters({
            ...filters,
            locations: filters.locations.filter(
              (item) =>
                item.emirate !== loc.emirate ||
                (item.area ?? "") !== (loc.area ?? "")
            ),
          }),
      })
    );
    if (filters.gender)
      chips.push({
        label: `${filters.gender} only`,
        clear: () => setFilters({ ...filters, gender: "" }),
      });
    filters.roomTypes.forEach((rt) =>
      chips.push({
        label: rt,
        clear: () => {
          const s = new Set(filters.roomTypes);
          s.delete(rt);
          setFilters({ ...filters, roomTypes: s });
        },
      })
    );
    filters.amenities.forEach((a) =>
      chips.push({
        label: a,
        clear: () => {
          const s = new Set(filters.amenities);
          s.delete(a);
          setFilters({ ...filters, amenities: s });
        },
      })
    );
    if (filters.maxPrice < 20000)
      chips.push({
        label: `≤ ${formatPrice(filters.maxPrice)}`,
        clear: () => setFilters({ ...filters, maxPrice: 20000 }),
      });
    return chips;
  }, [filters]);

  return (
    <div className="bg-slate-50/60 pb-20 pt-8">
      <div className="container">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Accommodation in the UAE
          </h1>
          <p className="mt-2 text-slate-600">
            {filtered.length} verified listings · Updated minutes ago
          </p>
          <Link
            to="/community/areas"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100"
          >
            <Users className="h-4 w-4" />
            Area guides — crowd, price & nationality tags from community reviews
          </Link>
        </header>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                placeholder="Search by area, building, or keyword"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 sm:border-l sm:border-slate-200">
              <MapPin className="h-4 w-4 text-slate-400" />
              <select
                value={filters.emirate}
                onChange={(e) =>
                  setFilters({ ...filters, emirate: e.target.value as Emirate | "" })
                }
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              >
                <option value="">All Emirates</option>
                {EMIRATES.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => setDrawer(true)} variant="outline" size="md" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeChips.map((c, i) => (
                <button
                  key={i}
                  onClick={c.clear}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                >
                  {c.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                onClick={() => setFilters(defaultFilters)}
                className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filtered.length}</span> results
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <SaveSearchButton
                  variant="compact"
                  buildSearch={() => ({
                    name: filters.q
                      ? `“${filters.q}”${filters.emirate ? " · " + filters.emirate : ""}`
                      : filters.emirate
                      ? `${filters.emirate} listings`
                      : "All listings",
                    query: [
                      filters.q,
                      filters.emirate,
                      ...filters.locations.map(formatLocationPreference),
                      ...Array.from(filters.roomTypes),
                      ...Array.from(filters.amenities),
                      filters.gender && `${filters.gender} only`,
                      filters.maxPrice < 20000 && `≤ ${formatPrice(filters.maxPrice)}`,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                    filters: {
                      ...filters,
                      locations: filters.locations,
                      roomTypes: Array.from(filters.roomTypes),
                      amenities: Array.from(filters.amenities),
                    },
                    url: `/accommodation${location.search || ""}`,
                  })}
                />
                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <button
                    onClick={() => setView("grid")}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 px-3 text-xs font-semibold transition",
                      view === "grid"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" /> Grid
                  </button>
                  <button
                    onClick={() => setView("map")}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 px-3 text-xs font-semibold transition",
                      view === "map"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <MapIcon className="h-3.5 w-3.5" /> Map
                  </button>
                </div>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  options={[
                    { value: "recommended", label: "Recommended for you" },
                    { value: "newest", label: "Newest first" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                  ]}
                  className="h-9 max-w-[220px] text-xs"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="font-semibold text-slate-700">No listings match these filters.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Reset filters
                </Button>
              </div>
            ) : view === "map" ? (
              <MapView listings={filtered} />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          drawer ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setDrawer(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(360px,calc(100vw-2rem))] overflow-y-auto bg-white p-5 shadow-2xl transition-transform lg:hidden",
          drawer ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filters</h2>
          <button
            onClick={() => setDrawer(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <FilterPanel filters={filters} setFilters={setFilters} />
        <Button onClick={() => setDrawer(false)} className="mt-6 w-full" size="lg">
          Show {filtered.length} listings
        </Button>
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Location</h3>
        <p className="mt-1 text-xs text-slate-500">
          Filter by emirate and neighborhood. Add multiple areas to broaden your search.
        </p>
        <div className="mt-3">
          <LocationSelectField
            compact
            value={filters.locations}
            onChange={(locations) =>
              setFilters({ ...filters, locations: locations ?? [] })
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Price range (AED / month)</h3>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            min={0}
            value={filters.minPrice || ""}
            placeholder="Min"
            onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || 0 })}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
          />
          <span className="text-slate-300">–</span>
          <input
            type="number"
            value={filters.maxPrice === 20000 ? "" : filters.maxPrice}
            placeholder="Max"
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: Number(e.target.value) || 20000 })
            }
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Room type</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROOM_TYPES.map((rt) => {
            const active = filters.roomTypes.has(rt);
            return (
              <button
                key={rt}
                onClick={() => {
                  const s = new Set(filters.roomTypes);
                  if (active) s.delete(rt);
                  else s.add(rt);
                  setFilters({ ...filters, roomTypes: s });
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                )}
              >
                {rt}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Gender preference</h3>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {(["", "Male", "Female", "Family"] as const).map((g) => (
            <button
              key={g || "any"}
              onClick={() => setFilters({ ...filters, gender: g as GenderPreference | "" })}
              className={cn(
                "rounded-lg border py-1.5 text-xs font-medium transition",
                filters.gender === g
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              )}
            >
              {g || "Any"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Amenities</h3>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {AMENITIES.map((a) => {
            const active = filters.amenities.has(a);
            return (
              <label
                key={a}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => {
                    const s = new Set(filters.amenities);
                    if (active) s.delete(a);
                    else s.add(a);
                    setFilters({ ...filters, amenities: s });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {a}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Distance to metro: {filters.maxMetroDistance} km
        </h3>
        <input
          type="range"
          min={0.1}
          max={10}
          step={0.1}
          value={filters.maxMetroDistance}
          onChange={(e) =>
            setFilters({ ...filters, maxMetroDistance: Number(e.target.value) })
          }
          className="mt-3 w-full accent-brand-600"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Listed by</h3>
        <Select
          className="mt-3"
          value={filters.listedBy}
          onChange={(e) => setFilters({ ...filters, listedBy: e.target.value as ListedBy | "" })}
          options={[
            { value: "", label: "Anyone" },
            { value: "Landlord", label: "Landlord" },
            { value: "Tenant", label: "Tenant" },
            { value: "Agent", label: "Agent" },
            { value: "Developer", label: "Developer" },
          ]}
        />
      </div>
    </div>
  );
}
