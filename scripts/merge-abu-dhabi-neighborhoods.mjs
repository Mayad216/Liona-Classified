/**
 * Merge curated Abu Dhabi neighborhoods into uae-locations.json.
 *
 * Usage: node scripts/merge-abu-dhabi-neighborhoods.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND_JSON = join(__dirname, "../backend/database/data/uae-locations.json");

const SECTION_HEADERS = new Set([
  "Abu Dhabi City / Main Island",
  "Islands & Waterfront Areas",
  "Suburban / Family Villa Areas",
  "Investment / New Development Communities",
  "Industrial / Commercial Areas",
  "Greater Abu Dhabi / Emirate Areas",
]);

/** Curated Abu Dhabi neighborhoods (section headers excluded). */
const ABU_DHABI_NEIGHBORHOODS = [
  "Al Bateen",
  "Al Khalidiyah",
  "Corniche / Corniche Road",
  "Al Hosn",
  "Al Markaziyah",
  "Madinat Zayed",
  "Al Danah",
  "Tourist Club Area / Al Zahiyah",
  "Al Najda",
  "Electra Street area",
  "Al Manhal",
  "Al Nahyan",
  "Al Mushrif",
  "Al Rowdah",
  "Al Muroor",
  "Al Karamah",
  "Al Wahda",
  "Al Manaseer",
  "Al Zaab",
  "Al Rawdah",
  "Al Maqta",
  "Al Qurm",
  "Al Khubeirah",
  "Al Ras Al Akhdar",
  "Al Mina",
  "Mina Zayed",
  "Al Reem / Old Reem area",
  "Defense Road area",
  "Airport Road area",
  "Hamdan Street area",
  "Salam Street / Sheikh Zayed Bin Sultan Street area",
  "Al Reem Island",
  "Al Maryah Island",
  "Saadiyat Island",
  "Yas Island",
  "Al Hudayriyat Island",
  "Al Lulu Island",
  "Al Jubail Island",
  "Al Ramhan Island",
  "Nurai Island",
  "Al Raha Beach",
  "Al Raha Gardens",
  "Al Muneera",
  "Al Bandar",
  "Al Zeina",
  "Al Seef",
  "Al Gurm",
  "Eastern Mangroves",
  "Mangrove Village",
  "Khalifa City",
  "Shakhbout City",
  "Mohammed Bin Zayed City / MBZ City",
  "Zayed City",
  "Madinat Al Riyadh / Riyadh City",
  "Baniyas",
  "Al Shawamekh",
  "Al Shamkha",
  "Al Falah",
  "Al Rahba",
  "Al Bahia",
  "Al Samha",
  "Al Shahama",
  "Al Reef",
  "Al Reef Villas",
  "Al Reef Downtown",
  "Sas Al Nakhl",
  "Between Two Bridges / Bain Al Jesrain",
  "Rabdan",
  "Officers City",
  "Ministries Complex area",
  "Masdar City",
  "Capital District",
  "Rawdhat Abu Dhabi",
  "Bloom Gardens",
  "Bloom Living",
  "Hydra Village",
  "Al Ghadeer",
  "Al Jurf",
  "Jubail Island communities",
  "Saadiyat Grove",
  "Saadiyat Lagoons",
  "Saadiyat Reserve",
  "Yas Acres",
  "Yas Park Gate",
  "Noya",
  "West Yas",
  "Mayan",
  "Ansam",
  "Water's Edge",
  "Al Raha Lofts",
  "Mussafah",
  "Mussafah Industrial Area",
  "ICAD / Industrial City of Abu Dhabi",
  "Mafraq Industrial Area",
  "Khalifa Industrial Zone Abu Dhabi / KIZAD",
  "Abu Dhabi Airport Free Zone",
  "Al Mafraq",
  "Al Wathba",
  "Al Dhafra area outskirts",
  "Al Dhafra Region",
  "Madinat Zayed, Al Dhafra",
  "Ruwais",
  "Ghayathi",
  "Liwa",
  "Mirfa",
  "Sila",
  "Delma Island",
  "Sweihan",
  "Al Khatim",
];

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
    .replace(/\s*\/\s*.*$/, "")
    .replace(/\s+area$/i, "")
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeNames(backend, names) {
  const emirates = backend.emirates ?? [];
  let abuDhabi = emirates.find((e) => e.name === "Abu Dhabi");
  if (!abuDhabi) {
    abuDhabi = { name: "Abu Dhabi", neighborhoods: [] };
    emirates.push(abuDhabi);
  }

  const existingKeys = new Set(
    (abuDhabi.neighborhoods ?? []).map((n) =>
      normalizeKey(String(n.name_en ?? n.name ?? ""))
    )
  );

  let added = 0;
  const seen = new Set();

  for (const raw of names) {
    const name = raw.replace(/\s+/g, " ").trim();
    if (!name || SECTION_HEADERS.has(name)) continue;

    const key = normalizeKey(name);
    if (seen.has(key) || existingKeys.has(key)) {
      seen.add(key);
      continue;
    }

    abuDhabi.neighborhoods.push({
      name_en: name,
      slug: slugify(name),
      source: "curated",
      location_type: "COMMUNITY",
    });
    existingKeys.add(key);
    seen.add(key);
    added++;
  }

  abuDhabi.neighborhoods.sort((a, b) =>
    String(a.name_en).localeCompare(String(b.name_en))
  );

  backend.fetched_at = new Date().toISOString();
  return { added, total: abuDhabi.neighborhoods.length, backend };
}

const backend = JSON.parse(readFileSync(BACKEND_JSON, "utf8"));
const { added, total, backend: merged } = mergeNames(backend, ABU_DHABI_NEIGHBORHOODS);
writeFileSync(BACKEND_JSON, JSON.stringify(merged, null, 2), "utf8");

console.log(`Added ${added} Abu Dhabi neighborhoods (${total} total)`);
console.log(`Updated → ${BACKEND_JSON}`);
