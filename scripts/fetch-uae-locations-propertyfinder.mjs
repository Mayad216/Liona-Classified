/**
 * Bootstrap UAE neighborhoods from PropertyFinder's public autocomplete API.
 * Used when Dubizzle is blocked; re-run Dubizzle fetch when REALTYAPI_KEY is available.
 *
 * Usage: node scripts/fetch-uae-locations-propertyfinder.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../backend/database/data/uae-locations.json");

const EMIRATE_BY_SLUG = {
  dubai: "Dubai",
  "abu-dhabi": "Abu Dhabi",
  sharjah: "Sharjah",
  ajman: "Ajman",
  "ras-al-khaimah": "Ras Al Khaimah",
  fujairah: "Fujairah",
  "umm-al-quwain": "Umm Al Quwain",
  "al-ain": "Al Ain",
};

const KEEP_TYPES = new Set(["COMMUNITY", "SUBCOMMUNITY", "REGION", "DISTRICT"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function keywordSet() {
  const out = new Set(Object.values(EMIRATE_BY_SLUG));
  const letters = "abcdefghijklmnopqrstuvwxyz";
  for (const a of letters) out.add(a);
  for (const a of letters) {
    for (const b of letters) out.add(a + b);
  }
  [
    "al ",
    "jumeirah",
    "downtown",
    "marina",
    "business",
    "khalifa",
    "palm",
    "villa",
    "city",
    "international",
    "gardens",
    "hills",
    "island",
    "reem",
    "yas",
    "saadiyat",
    "nahda",
    "majaz",
    "khan",
  ].forEach((k) => out.add(k));
  return [...out];
}

async function search(keyword) {
  const url = `https://www.propertyfinder.ae/api/pwa/locations?locale=en&keyword=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.attributes ?? [];
}

function mapEmirate(item) {
  const slug = item.url_city_slug ?? "";
  if (EMIRATE_BY_SLUG[slug]) return EMIRATE_BY_SLUG[slug];

  const path = item.path_name ?? "";
  const first = path.split(",")[0]?.trim();
  return EMIRATE_BY_SLUG[first?.toLowerCase().replace(/\s+/g, "-")] ?? first ?? null;
}

function pickNeighborhoodName(item) {
  const path = item.path_name ?? "";
  const parts = path.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[1];
  return item.name;
}

async function main() {
  const byEmirate = Object.fromEntries(
    Object.values(EMIRATE_BY_SLUG).map((name) => [name, new Map()])
  );

  const keywords = keywordSet();
  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    process.stdout.write(`\r[${i + 1}/${keywords.length}] ${kw.padEnd(22)}`);

    const hits = await search(kw);
    for (const item of hits) {
      const type = item.location_type ?? "";
      if (!KEEP_TYPES.has(type)) continue;

      const emirate = mapEmirate(item);
      if (!emirate || !byEmirate[emirate]) continue;

      const name = pickNeighborhoodName(item);
      if (!name) continue;

      const key = `${emirate}::${name.toLowerCase()}`;
      if (byEmirate[emirate].has(key)) continue;

      byEmirate[emirate].set(key, {
        propertyfinder_id: item.id,
        name_en: name,
        name_ar: item.url_slug_value?.ar ?? null,
        slug: item.url_slug ?? item.current_language_slug ?? null,
        level: item.level ?? null,
        location_type: type,
        latitude: item.coordinates?.lat ?? null,
        longitude: item.coordinates?.lon ?? null,
        source: "propertyfinder",
      });
    }

    await sleep(80);
  }

  console.log("\nDone.");

  const emirates = Object.values(EMIRATE_BY_SLUG).map((name) => ({
    name,
    neighborhoods: [...byEmirate[name].values()].sort((a, b) => a.name_en.localeCompare(b.name_en)),
  }));

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        fetched_at: new Date().toISOString(),
        source: "propertyfinder.ae",
        note: "Bootstrap dataset. Run fetch-dubizzle-locations-realtyapi.mjs with REALTYAPI_KEY for Dubizzle IDs.",
        emirates,
      },
      null,
      2
    ),
    "utf8"
  );

  const total = emirates.reduce((s, e) => s + e.neighborhoods.length, 0);
  for (const e of emirates) {
    console.log(`  ${e.name}: ${e.neighborhoods.length}`);
  }
  console.log(`Saved ${total} neighborhoods → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
