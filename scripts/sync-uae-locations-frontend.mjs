/**
 * Copy backend uae-locations.json into a compact frontend bundle.
 *
 * Usage: node scripts/sync-uae-locations-frontend.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "../backend/database/data/uae-locations.json");
const OUT = join(__dirname, "../frontend/src/data/uae-locations-bundled.json");

const raw = JSON.parse(readFileSync(SRC, "utf8"));
const emirates = {};

for (const row of raw.emirates ?? []) {
  const names = [
    ...new Set(
      (row.neighborhoods ?? [])
        .map((n) => n.name_en ?? n.name)
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
  emirates[row.name] = names;
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      fetched_at: raw.fetched_at,
      source: raw.source,
      emirates,
    },
    null,
    2
  ),
  "utf8"
);

for (const [name, areas] of Object.entries(emirates)) {
  console.log(`  ${name}: ${areas.length}`);
}
console.log(`Saved → ${OUT}`);
