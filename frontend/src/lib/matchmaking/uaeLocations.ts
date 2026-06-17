import type { Emirate } from "@/types";
import { api } from "@/lib/api";
import bundledLocations from "@/data/uae-locations-bundled.json";

/** All UAE emirates — used for roommate location matching and search filters. */
export const UAE_EMIRATES: Emirate[] = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

/** Fallback neighborhoods when bundled/API data is missing for an emirate. */
export const UAE_AREAS_BY_EMIRATE: Record<Emirate, readonly string[]> = {
  Dubai: [
    "Dubai Marina",
    "Jumeirah Lake Towers",
    "Bur Dubai",
    "Deira",
    "Downtown Dubai",
    "Business Bay",
    "DIFC",
    "Media City",
    "Internet City",
    "Jumeirah",
    "Al Barsha",
    "Al Quoz",
    "JVC (Jumeirah Village Circle)",
    "International City",
    "Discovery Gardens",
    "Silicon Oasis",
    "Mirdif",
    "Dubai Hills",
    "Al Nahda (Dubai)",
    "Karama",
  ],
  "Abu Dhabi": [
    "Al Reem Island",
    "Corniche",
    "Al Khalidiyah",
    "Khalifa City",
    "Yas Island",
    "Saadiyat Island",
    "Al Muroor",
    "Mohammed Bin Zayed City",
    "Al Raha Beach",
    "Al Maryah Island",
  ],
  Sharjah: [
    "Al Nahda",
    "Al Majaz",
    "Muwaileh",
    "Al Khan",
    "Al Taawun",
    "University City",
    "Al Qasimia",
  ],
  Ajman: ["Ajman City", "Al Nuaimiya", "Al Rashidiya", "Al Jurf"],
  "Ras Al Khaimah": ["Al Hamra", "Al Nakheel", "RAK City", "Mina Al Arab"],
  Fujairah: ["Fujairah City", "Dibba", "Kalba"],
  "Umm Al Quwain": ["UAQ City", "Al Salamah", "Al Raas"],
};

type BundledLocationsFile = {
  emirates?: Record<string, string[]>;
};

function mergeAreaRecords(
  primary: Record<string, string[]>,
  fallback: Record<Emirate, readonly string[]>
): Record<string, string[]> {
  const out: Record<string, string[]> = {};

  for (const [emirate, areas] of Object.entries(primary)) {
    out[emirate] = [...new Set(areas.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  for (const emirate of UAE_EMIRATES) {
    const existing = out[emirate] ?? [];
    const extras = [...fallback[emirate]];
    out[emirate] = [...new Set([...existing, ...extras])].sort((a, b) => a.localeCompare(b));
  }

  return out;
}

const bundledEmirates = (bundledLocations as BundledLocationsFile).emirates ?? {};

/** In-memory cache — seeded from bundled JSON so filters work offline immediately. */
let cachedAreas: Record<string, string[]> = mergeAreaRecords(bundledEmirates, UAE_AREAS_BY_EMIRATE);
let loadPromise: Promise<Record<string, string[]>> | null = null;

function mapApiToAreas(
  rows: Awaited<ReturnType<typeof api.uaeLocations>>["data"]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const row of rows) {
    out[row.name] = row.neighborhoods.map((n) => n.name).filter(Boolean);
  }
  return mergeAreaRecords(out, UAE_AREAS_BY_EMIRATE);
}

async function fetchAreasFromApi(timeoutMs = 4000): Promise<Record<string, string[]> | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"}/uae/locations`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Awaited<ReturnType<typeof api.uaeLocations>>;
    const mapped = mapApiToAreas(json.data);
    return Object.keys(mapped).length > 0 ? mapped : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Refresh neighborhoods from the backend when available; bundled data is used immediately. */
export async function loadUaeAreasByEmirate(): Promise<Record<string, string[]>> {
  if (loadPromise) return loadPromise;

  loadPromise = fetchAreasFromApi()
    .then((mapped) => {
      if (mapped) cachedAreas = mapped;
      return cachedAreas;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export interface LocationPreference {
  emirate: string;
  /** When omitted, the user is open to any area within the emirate. */
  area?: string;
}

export function areasForEmirate(emirate: string): string[] {
  const trimmed = emirate.trim();
  if (!trimmed) return [];

  if (cachedAreas[trimmed]?.length) {
    return [...cachedAreas[trimmed]];
  }

  const direct = UAE_AREAS_BY_EMIRATE[trimmed as Emirate];
  if (direct?.length) return [...direct];

  const matched = UAE_EMIRATES.find((e) => e.toLowerCase() === trimmed.toLowerCase());
  if (matched) {
    if (cachedAreas[matched]?.length) return [...cachedAreas[matched]];
    return [...UAE_AREAS_BY_EMIRATE[matched]];
  }

  return [];
}

export function locationKey(loc: LocationPreference): string {
  return loc.area ? `${loc.emirate}::${loc.area}` : `${loc.emirate}::`;
}

export function normalizeLocationPreferences(value: unknown): LocationPreference[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const out: LocationPreference[] = [];

  for (const item of value) {
    let loc: LocationPreference | null = null;

    if (typeof item === "string" && item.trim()) {
      loc = { emirate: item.trim() };
    } else if (item && typeof item === "object" && "emirate" in item) {
      const emirate = String((item as LocationPreference).emirate ?? "").trim();
      if (!emirate) continue;
      const areaRaw = (item as LocationPreference).area;
      const area =
        typeof areaRaw === "string" && areaRaw.trim() ? areaRaw.trim() : undefined;
      loc = area ? { emirate, area } : { emirate };
    }

    if (!loc) continue;
    const key = locationKey(loc);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(loc);
  }

  return out;
}

export function formatLocationPreference(loc: LocationPreference): string {
  return loc.area ? `${loc.emirate} · ${loc.area}` : loc.emirate;
}

export function formatLocationPreferences(locs: LocationPreference[]): string {
  if (locs.length === 0) return "Any emirate";
  return locs.map(formatLocationPreference).join(", ");
}

/** True when both sides specify locations and at least one emirate/area pair aligns. */
export function locationPairMatches(a: LocationPreference, b: LocationPreference): boolean {
  if (a.emirate !== b.emirate) return false;
  if (!a.area || !b.area) return true;
  return a.area === b.area;
}

export function locationsOverlap(a: LocationPreference[], b: LocationPreference[]): boolean {
  if (a.length === 0 || b.length === 0) return true;
  return a.some((x) => b.some((y) => locationPairMatches(x, y)));
}

/** Whether a listing falls within a preferred emirate / neighborhood. */
export function listingMatchesLocation(
  listing: { emirate: string; area: string },
  preference: LocationPreference
): boolean {
  if (listing.emirate !== preference.emirate) return false;
  if (!preference.area) return true;

  const listingArea = listing.area.trim().toLowerCase();
  const preferred = preference.area.trim().toLowerCase();
  if (!listingArea || !preferred) return true;

  return (
    listingArea === preferred ||
    listingArea.includes(preferred) ||
    preferred.includes(listingArea)
  );
}

export function listingMatchesAnyLocation(
  listing: { emirate: string; area: string },
  preferences: LocationPreference[]
): boolean {
  if (preferences.length === 0) return true;
  return preferences.some((loc) => listingMatchesLocation(listing, loc));
}
