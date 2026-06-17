const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const endpoints = [
  "https://dubai.dubizzle.com/svc/search/api/v1/seo/?url=https://dubai.dubizzle.com/property-for-rent/residential/",
  "https://dubai.dubizzle.com/svc/search/api/v1/seo?url=https%3A%2F%2Fdubai.dubizzle.com%2Fproperty-for-rent%2Fresidential%2F",
  "https://dubai.dubizzle.com/svc/search/api/v1/filters/",
  "https://dubai.dubizzle.com/svc/search/api/v1/filters/?category=property-for-rent/residential",
  "https://dubai.dubizzle.com/svc/search/api/v1/neighborhoods/",
  "https://dubai.dubizzle.com/svc/search/api/v1/locations/tree/",
  "https://dubai.dubizzle.com/svc/search/api/v1/locations/tree/?city=2",
];

for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        Referer: "https://dubai.dubizzle.com/property-for-rent/residential/",
      },
    });
    const text = await res.text();
    console.log("\n===", res.status, url);
    console.log(text.slice(0, 800));
  } catch (e) {
    console.log("\n=== ERR", url, e.message);
  }
}
