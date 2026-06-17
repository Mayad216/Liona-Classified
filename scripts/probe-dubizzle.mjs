const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const urls = [
  "https://dubai.dubizzle.com/property-for-rent/residential/",
  "https://uae.dubizzle.com/property-for-rent/residential/",
  "https://dubai.dubizzle.com/svc/search/api/v1/locations/?query=dubai",
  "https://dubai.dubizzle.com/svc/location/api/v1/autocomplete/?query=dubai",
  "https://dubai.dubizzle.com/svc/location/api/v2/autocomplete/?query=dubai",
  "https://dubai.dubizzle.com/svc/search/api/v2/locations/?query=dubai",
  "https://dubai.dubizzle.com/svc/search/api/v1/locations/?query=dubai&page=0&hitsPerPage=100",
];

for (const url of urls) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json, text/html" },
    });
    const text = await res.text();
    console.log("\n===", res.status, url);
    if (text.startsWith("{") || text.startsWith("[")) {
      console.log(text.slice(0, 500));
    } else {
      const svc = [...text.matchAll(/\/svc\/[a-zA-Z0-9/_-]+/g)].slice(0, 15);
      console.log("svc paths:", [...new Set(svc.map((m) => m[0]))].join("\n"));
      const next = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (next) {
        console.log("__NEXT_DATA__ length", next[1].length);
        const locHits = [...next[1].matchAll(/location[^\"]{0,40}/gi)].slice(0, 10);
        console.log("next location hints", locHits.map((m) => m[0]));
      }
    }
  } catch (e) {
    console.log("\n=== ERR", url, e.message);
  }
}
