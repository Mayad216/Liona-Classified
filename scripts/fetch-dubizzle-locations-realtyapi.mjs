/**
 * Fetch Dubizzle neighborhoods via RealtyAPI (wraps Dubizzle autocomplete).
 *
 * Requires REALTYAPI_KEY in environment.
 *
 * Usage:
 *   set REALTYAPI_KEY=your_key
 *   node scripts/fetch-dubizzle-locations-realtyapi.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../backend/database/data/dubizzle-locations.json");

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
];

const API_KEY = process.env.REALTYAPI_KEY || process.env.REALTY_API_KEY;
if (!API_KEY) {
  console.error("Set REALTYAPI_KEY to fetch Dubizzle neighborhoods via realtyapi.io");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function queries() {
  const out = new Set(EMIRATES);
  for (const e of EMIRATES) {
    out.add(e.split(" ")[0]);
  }
  const letters = "abcdefghijklmnopqrstuvwxyz";
  for (const a of letters) out.add(a);
  for (const a of letters) {
    for (const b of letters) out.add(a + b);
  }
  for (const n of ["al ", "jumeirah", "downtown", "marina", "khalifa", "palm", "business", "city"]) {
    out.add(n);
  }
  return [...out];
}

function mapEmirate(hit) {
  const text = [
    hit.city,
    hit.emirate,
    hit.location,
    hit.name,
    hit.title,
    hit.path,
    hit.full_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const emirate of EMIRATES) {
    if (text.includes(emirate.toLowerCase())) return emirate;
  }
  if (text.includes("dubai")) return "Dubai";
  if (text.includes("abu dhabi") || text.includes("abudhabi")) return "Abu Dhabi";
  if (text.includes("sharjah")) return "Sharjah";
  if (text.includes("ajman")) return "Ajman";
  if (text.includes("rak") || text.includes("ras al khaimah")) return "Ras Al Khaimah";
  if (text.includes("fujairah")) return "Fujairah";
  if (text.includes("uaq") || text.includes("umm al quwain")) return "Umm Al Quwain";
  if (text.includes("al ain") || text.includes("alain")) return "Al Ain";
  return null;
}

async function autocomplete(query, page = 0) {
  const url = new URL("https://dubizzle.realtyapi.io/autocomplete");
  url.searchParams.set("query", query);
  url.searchParams.set("hitsPerPage", "50");
  url.searchParams.set("page", String(page));

  const res = await fetch(url, {
    headers: {
      "x-realtyapi-key": API_KEY,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`RealtyAPI ${res.status} for query "${query}"`);
  }

  return res.json();
}

async function main() {
  const byEmirate = Object.fromEntries(EMIRATES.map((e) => [e, new Map()]));
  const qs = queries();

  for (let i = 0; i < qs.length; i++) {
    const query = qs[i];
    process.stdout.write(`\r[${i + 1}/${qs.length}] ${query.padEnd(20)}`);

    let page = 0;
    for (;;) {
      const json = await autocomplete(query, page);
      const hits = json.searchResults ?? json.results ?? json.data ?? [];
      if (!Array.isArray(hits) || hits.length === 0) break;

      for (const hit of hits) {
        const type = String(hit.type ?? hit.location_type ?? "").toLowerCase();
        if (type && !["neighborhood", "community", "area", "city", "emirate", "development"].some((t) => type.includes(t))) {
          continue;
        }

        const id = hit.id ?? hit.locationId ?? hit.location_id;
        const name = hit.name ?? hit.title ?? hit.label ?? hit.locationName;
        if (!id || !name) continue;

        const emirate = mapEmirate(hit);
        if (!emirate) continue;

        byEmirate[emirate].set(Number(id), {
          dubizzle_id: Number(id),
          name_en: String(name).trim(),
          name_ar: hit.name_ar ?? hit.nameAr ?? null,
          slug: hit.slug ?? null,
          level: hit.level ?? null,
          location_type: hit.type ?? null,
          source: "dubizzle",
        });
      }

      if (!json.nextPage) break;
      page++;
      await sleep(120);
    }

    await sleep(120);
  }

  console.log("\nDone querying.");

  const emirates = EMIRATES.map((name) => ({
    name,
    neighborhoods: [...byEmirate[name].values()].sort((a, b) => a.name_en.localeCompare(b.name_en)),
  }));

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        fetched_at: new Date().toISOString(),
        source: "dubizzle.com",
        provider: "realtyapi.io",
        emirates,
      },
      null,
      2
    ),
    "utf8"
  );

  const total = emirates.reduce((s, e) => s + e.neighborhoods.length, 0);
  console.log(`Saved ${total} Dubizzle neighborhoods → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
