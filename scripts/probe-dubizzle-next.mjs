const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const res = await fetch("https://dubai.dubizzle.com/property-for-rent/residential/", {
  headers: { "User-Agent": UA },
});
const html = await res.text();
console.log("status", res.status, "len", html.length);

const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (next) {
  const data = JSON.parse(next[1]);
  console.log("keys", Object.keys(data));
  console.log("page", data.page?.slice?.(0, 200) ?? typeof data.page);
  const str = JSON.stringify(data);
  const tokenMatch = str.match(/"token"\s*:\s*"([^"]+)"/);
  const authMatch = str.match(/"authorization"\s*:\s*"([^"]+)"/);
  console.log("token?", tokenMatch?.[1]?.slice(0, 40));
  console.log("auth?", authMatch?.[1]?.slice(0, 40));

  // walk for location-related keys
  function walk(obj, path = "", hits = []) {
    if (hits.length > 30) return hits;
    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj)) {
        const p = path ? `${path}.${k}` : k;
        if (/location|emirate|neighborhood|area|city/i.test(k)) {
          hits.push({ path: p, sample: typeof v === "string" ? v.slice(0, 80) : Array.isArray(v) ? `array(${v.length})` : typeof v });
        }
        walk(v, p, hits);
      }
    }
    return hits;
  }
  console.log("location hits", walk(data).slice(0, 25));
}

// search inline scripts for svc token patterns
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
for (const s of scripts) {
  if (/locations|NO_TOKEN|svc\/search/.test(s)) {
    console.log("script snippet", s.slice(0, 300));
  }
}

// try cookie-less with common headers from next data
const bearer = html.match(/Bearer\s+[A-Za-z0-9._-]+/);
console.log("bearer in html?", bearer?.[0]?.slice(0, 60));
