/**
 * Fetch Dubizzle neighborhood trees via Playwright.
 * Run: cd backend/workers/auto-apply && node fetch-dubizzle-locations.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../database/data/dubizzle-locations.json");

const EMIRATES = [
  { name: "Dubai", subdomain: "dubai", cityId: 2 },
  { name: "Abu Dhabi", subdomain: "abudhabi", cityId: 3 },
  { name: "Sharjah", subdomain: "sharjah", cityId: 4 },
  { name: "Ajman", subdomain: "ajman", cityId: 5 },
  { name: "Ras Al Khaimah", subdomain: "rak", cityId: 6 },
  { name: "Fujairah", subdomain: "fujairah", cityId: 7 },
  { name: "Umm Al Quwain", subdomain: "uaq", cityId: 8 },
  { name: "Al Ain", subdomain: "alain", cityId: 9 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function captureAuth(page) {
  let authHeader = null;
  page.on("request", (req) => {
    const h = req.headers().authorization || req.headers().Authorization;
    if (h?.startsWith("Bearer ") && !authHeader) authHeader = h;
  });
  await page.goto("https://dubai.dubizzle.com/property-for-rent/residential/", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  for (let i = 0; i < 45 && !authHeader; i++) await sleep(2000);
  return authHeader;
}

async function apiGet(page, url, authHeader) {
  return page.evaluate(
    async ({ url, authHeader }) => {
      const res = await fetch(url, {
        headers: { Accept: "application/json", Authorization: authHeader },
        credentials: "include",
      });
      return { status: res.status, body: await res.text() };
    },
    { url, authHeader }
  );
}

function flattenNeighborhoods(node, emirate, parentId = null, out = []) {
  if (!node || typeof node !== "object") return out;
  const id = node.id ?? node.value ?? node.neighborhood_id;
  const nameEn =
    node.name?.en ??
    node.name_en ??
    node.label?.en ??
    (typeof node.name === "string" ? node.name : null) ??
    node.en ??
    node.label;
  if (id && nameEn) {
    out.push({
      dubizzle_id: Number(id),
      name_en: String(nameEn).trim(),
      name_ar: node.name?.ar ?? node.name_ar ?? node.label?.ar ?? node.ar ?? null,
      slug: node.slug ?? node.uri ?? null,
      level: node.level ?? null,
      parent_dubizzle_id: parentId,
      emirate: emirate.name,
    });
  }
  const children = node.children ?? node.neighborhoods ?? node.areas ?? node.items ?? node.sub_locations ?? [];
  if (Array.isArray(children)) {
    for (const child of children) flattenNeighborhoods(child, emirate, id ? Number(id) : parentId, out);
  }
  return out;
}

function parseNeighborhoodPayload(payload, emirate) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.flatMap((n) => flattenNeighborhoods(n, emirate));
  if (Array.isArray(payload.neighborhoods)) return payload.neighborhoods.flatMap((n) => flattenNeighborhoods(n, emirate));
  if (Array.isArray(payload.data)) return payload.data.flatMap((n) => flattenNeighborhoods(n, emirate));
  if (Array.isArray(payload.results)) return payload.results.flatMap((n) => flattenNeighborhoods(n, emirate));
  if (payload.tree) return flattenNeighborhoods(payload.tree, emirate);
  return flattenNeighborhoods(payload, emirate);
}

async function fetchEmirateLocations(page, authHeader, emirate) {
  const base = `https://${emirate.subdomain}.dubizzle.com`;
  const candidates = [
    `${base}/svc/search/api/v1/locations/tree/`,
    `${base}/svc/search/api/v1/locations/tree/?city=${emirate.cityId}`,
    `${base}/svc/search/api/v1/neighborhoods/`,
    `${base}/svc/search/api/v1/neighborhoods/?city=${emirate.cityId}`,
    `${base}/svc/search/api/v1/filters/?category=property-for-rent/residential`,
  ];
  const neighborhoods = [];
  const rawResponses = [];
  for (const url of candidates) {
    const { status, body } = await apiGet(page, url, authHeader);
    rawResponses.push({ url, status, sample: body.slice(0, 300) });
    if (status !== 200) continue;
    try {
      const json = JSON.parse(body);
      const parsed = parseNeighborhoodPayload(json, emirate);
      if (parsed.length > 0) {
        neighborhoods.push(...parsed);
        break;
      }
      if (json?.filters?.neighborhood?.choices) {
        for (const c of json.filters.neighborhood.choices) {
          neighborhoods.push({
            dubizzle_id: Number(c.value ?? c.id),
            name_en: String(c.label?.en ?? c.en ?? c.label ?? c.name).trim(),
            name_ar: c.label?.ar ?? c.ar ?? null,
            slug: c.slug ?? null,
            level: 2,
            parent_dubizzle_id: emirate.cityId,
            emirate: emirate.name,
          });
        }
        if (neighborhoods.length) break;
      }
    } catch {
      /* ignore */
    }
  }
  const seen = new Set();
  const unique = neighborhoods.filter((n) => {
    const key = `${n.emirate}::${n.dubizzle_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(n.name_en);
  });
  return { emirate: emirate.name, count: unique.length, neighborhoods: unique, rawResponses };
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ locale: "en-US" })).newPage();
  console.log("Loading Dubizzle…");
  const authHeader = await captureAuth(page);
  if (!authHeader) {
    console.error("No auth token captured.");
    await browser.close();
    process.exit(1);
  }
  const results = [];
  for (const emirate of EMIRATES) {
    console.log(`→ ${emirate.name}`);
    const result = await fetchEmirateLocations(page, authHeader, emirate);
    console.log(`  ${result.count} neighborhoods`);
    results.push(result);
    await sleep(400);
  }
  await browser.close();
  const payload = {
    fetched_at: new Date().toISOString(),
    source: "dubizzle.com",
    emirates: results.map((r) => ({
      name: r.emirate,
      neighborhood_count: r.count,
      neighborhoods: r.neighborhoods,
      debug: r.rawResponses,
    })),
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 2));
  const total = payload.emirates.reduce((s, e) => s + e.neighborhood_count, 0);
  console.log(`Saved ${total} neighborhoods → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
