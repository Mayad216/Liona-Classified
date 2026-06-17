/**
 * Merge Bayut/ADSDI real-estate location seed into uae-locations.json.
 *
 * Imports area + city_region rows, plus non-project sub-communities
 * (districts/zones/localities). Skips project/tower-level entries.
 *
 * Usage:
 *   node scripts/merge-real-estate-locations-seed.mjs
 *   node scripts/merge-real-estate-locations-seed.mjs path/to/seed.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SEED = join(
  __dirname,
  "../backend/database/data/uae-real-estate-locations-seed.json"
);
const BACKEND_JSON = join(__dirname, "../backend/database/data/uae-locations.json");

const LEVEL_RANK = { city_region: 0, area: 1, sub_community: 2 };

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeKey(name) {
  return name
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldImport(row) {
  if (!row.is_active || row.status !== "ready") return false;

  if (row.level === "area" || row.level === "city_region") return true;

  if (row.level === "sub_community") {
    const type = row.location_type ?? "";
    if (/sub_community\/project/.test(type)) return false;
    if (/district|zone|locality/.test(type)) return true;
  }

  const type = row.location_type ?? "";
  if (/^(neighborhood\/community|town\/region|industrial)/.test(type)) {
    return row.level !== "sub_community" || !/project/.test(type);
  }

  return false;
}

function levelToNumber(level) {
  if (level === "city_region") return 0;
  if (level === "area") return 1;
  if (level === "sub_community") return 2;
  return null;
}

function pickBetter(existing, candidate) {
  const existingRank = LEVEL_RANK[existing._seed_level ?? "sub_community"] ?? 9;
  const candidateRank = LEVEL_RANK[candidate._seed_level ?? "sub_community"] ?? 9;
  return candidateRank < existingRank ? candidate : existing;
}

function rowToNeighborhood(row) {
  return {
    name_en: row.name_en,
    slug: row.slug || slugify(row.name_en),
    source: "bayut_seed",
    location_type: row.location_type,
    level: levelToNumber(row.level),
    external_location_id: row.location_id,
    parent_name: row.parent_name || null,
    city_region: row.city_region || null,
    source_url: row.source_url || null,
    _seed_level: row.level,
  };
}

function mergeSeed(backend, seedRows) {
  const emirates = backend.emirates ?? [];
  const byName = new Map(emirates.map((e) => [e.name, e]));

  /** @type {Record<string, Map<string, object>>} */
  const pending = {};

  for (const row of seedRows.filter(shouldImport)) {
    const emirateName = row.emirate;
    if (!emirateName) continue;

    if (!byName.has(emirateName)) {
      const created = { name: emirateName, neighborhoods: [] };
      emirates.push(created);
      byName.set(emirateName, created);
    }

    if (!pending[emirateName]) pending[emirateName] = new Map();

    const key = normalizeKey(row.name_en);
    const entry = rowToNeighborhood(row);
    const map = pending[emirateName];

    if (map.has(key)) {
      map.set(key, pickBetter(map.get(key), entry));
    } else {
      map.set(key, entry);
    }
  }

  let added = 0;
  let skipped = 0;

  for (const [emirateName, map] of Object.entries(pending)) {
    const emirate = byName.get(emirateName);
    const existingKeys = new Set(
      (emirate.neighborhoods ?? []).map((n) =>
        normalizeKey(String(n.name_en ?? n.name ?? ""))
      )
    );

    for (const [key, entry] of map.entries()) {
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

      const { _seed_level, ...stored } = entry;
      emirate.neighborhoods.push(stored);
      existingKeys.add(key);
      added++;
    }

    emirate.neighborhoods.sort((a, b) =>
      String(a.name_en).localeCompare(String(b.name_en))
    );
  }

  backend.fetched_at = new Date().toISOString();
  backend.sources = [
    ...(Array.isArray(backend.sources) ? backend.sources : []),
    "bayut_seed:uae_real_estate_locations_seed.json",
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  return { added, skipped, backend };
}

const seedPath = process.argv[2] ?? DEFAULT_SEED;
const seedRows = JSON.parse(readFileSync(seedPath, "utf8"));
const backend = JSON.parse(readFileSync(BACKEND_JSON, "utf8"));
const { added, skipped, backend: merged } = mergeSeed(backend, seedRows);

writeFileSync(BACKEND_JSON, JSON.stringify(merged, null, 2), "utf8");

console.log(`Seed rows: ${seedRows.length}`);
console.log(`Import candidates: ${seedRows.filter(shouldImport).length}`);
console.log(`Added ${added} neighborhoods (${skipped} already present)`);
for (const e of merged.emirates ?? []) {
  console.log(`  ${e.name}: ${(e.neighborhoods ?? []).length}`);
}
console.log(`Updated → ${BACKEND_JSON}`);
