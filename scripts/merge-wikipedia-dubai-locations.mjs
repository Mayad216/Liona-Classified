/**
 * Merge official Dubai communities from Wikipedia into uae-locations.json.
 *
 * Usage:
 *   node scripts/merge-wikipedia-dubai-locations.mjs
 *   node scripts/merge-wikipedia-dubai-locations.mjs path/to/wikipedia-export.md
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_WIKI_MD = join(
  __dirname,
  "../uploads/List_of_communities_in_Dubai-0.md"
);
const BACKEND_JSON = join(__dirname, "../backend/database/data/uae-locations.json");

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

function parseWikipediaCommunities(markdown) {
  /** @type {Map<string, { name_en: string, name_ar: string | null }>} */
  const communities = new Map();

  function add(nameEn, nameAr = null) {
    const trimmed = nameEn.replace(/\s+/g, " ").trim();
    if (!trimmed || trimmed.length < 2) return;
    if (/^Community Code$/i.test(trimmed)) return;
    if (/^Community Name$/i.test(trimmed)) return;

    const key = normalizeKey(trimmed);
    if (!communities.has(key)) {
      communities.set(key, { name_en: trimmed, name_ar: nameAr });
    }
  }

  // Official community tables: | 101 | [Name](...) | Arabic | ...
  const tableRow =
    /\|\s*\d{3}\s*\|\s*\[([^\]]+)\]\([^)]*\)\s*\|\s*([^|]+?)\s*\|/g;
  for (const match of markdown.matchAll(tableRow)) {
    add(match[1], match[2].trim() || null);
  }

  // Secondary table without codes (Springs/Meadows header row uses N/A)
  const secondaryRow = /\|\s*\[([^\]]+)\]\([^)]*\)\s*\|\s*N\/A\s*\|/g;
  for (const match of markdown.matchAll(secondaryRow)) {
    add(match[1]);
  }

  // Springs 1 … Springs 15 and Meadows 1 … Meadows 9 (concatenated in one cell)
  const springsMeadows = markdown.match(
    /Springs 1Springs 2[\s\S]*?Meadows 9/
  );
  if (springsMeadows) {
    const chunk = springsMeadows[0];
    for (const match of chunk.matchAll(/(Springs|Meadows)\s*(\d+)/g)) {
      add(`${match[1]} ${match[2]}`);
    }
  }

  // Navbox parent communities at the bottom (broader names)
  const navSection = markdown.indexOf("Neighbourhoods and communities in");
  if (navSection >= 0) {
    const nav = markdown.slice(navSection);
    for (const match of nav.matchAll(/\[([^\]]+)\]\(\/wiki\//g)) {
      const name = match[1];
      if (/^Template:/.test(name)) continue;
      if (/^Dubai$/.test(name)) continue;
      if (/^List of/.test(name)) continue;
      add(name);
    }
  }

  return [...communities.values()].sort((a, b) =>
    a.name_en.localeCompare(b.name_en)
  );
}

function mergeIntoBackend(wikiCommunities, backend) {
  const emirates = backend.emirates ?? [];
  let dubai = emirates.find((e) => e.name === "Dubai");
  if (!dubai) {
    dubai = { name: "Dubai", neighborhoods: [] };
    emirates.unshift(dubai);
  }

  const existingKeys = new Set(
    (dubai.neighborhoods ?? []).map((n) =>
      normalizeKey(String(n.name_en ?? n.name ?? ""))
    )
  );

  let added = 0;
  for (const row of wikiCommunities) {
    const key = normalizeKey(row.name_en);
    if (existingKeys.has(key)) continue;

    dubai.neighborhoods.push({
      name_en: row.name_en,
      name_ar: row.name_ar,
      slug: slugify(row.name_en),
      source: "wikipedia",
      location_type: "COMMUNITY",
    });
    existingKeys.add(key);
    added++;
  }

  dubai.neighborhoods.sort((a, b) =>
    String(a.name_en).localeCompare(String(b.name_en))
  );

  backend.fetched_at = new Date().toISOString();
  backend.sources = [
    ...(Array.isArray(backend.sources) ? backend.sources : [backend.source].filter(Boolean)),
    "wikipedia:List_of_communities_in_Dubai",
  ].filter((v, i, arr) => arr.indexOf(v) === i);
  backend.note =
    "Merged PropertyFinder bootstrap + Wikipedia official Dubai communities (224).";

  return { added, total: dubai.neighborhoods.length, backend };
}

const wikiPath = process.argv[2] ?? DEFAULT_WIKI_MD;
const markdown = readFileSync(wikiPath, "utf8");
const wikiCommunities = parseWikipediaCommunities(markdown);
const backend = JSON.parse(readFileSync(BACKEND_JSON, "utf8"));
const { added, total, backend: merged } = mergeIntoBackend(wikiCommunities, backend);

writeFileSync(BACKEND_JSON, JSON.stringify(merged, null, 2), "utf8");

console.log(`Parsed ${wikiCommunities.length} Wikipedia communities`);
console.log(`Added ${added} new Dubai neighborhoods (${total} total in Dubai)`);
console.log(`Updated → ${BACKEND_JSON}`);
