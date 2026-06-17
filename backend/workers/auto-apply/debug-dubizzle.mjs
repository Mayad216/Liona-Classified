import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
const hits = [];

page.on("request", (req) => {
  const url = req.url();
  if (url.includes("/svc/") || url.includes("algolia") || url.includes("location")) {
    hits.push({ type: "req", url, auth: req.headers().authorization?.slice(0, 40) });
  }
});
page.on("response", async (res) => {
  const url = res.url();
  if (url.includes("/svc/") || url.includes("algolia") || url.includes("location")) {
    hits.push({ type: "res", url, status: res.status(), ct: res.headers()["content-type"] });
  }
});

await page.goto("https://dubai.dubizzle.com/property-for-rent/residential/", {
  waitUntil: "domcontentloaded",
  timeout: 120000,
});
await page.waitForTimeout(30000);
await page.screenshot({ path: "dubizzle-debug.png", fullPage: true });
const html = await page.content();
writeFileSync("dubizzle-debug.html", html);
writeFileSync("dubizzle-network.json", JSON.stringify(hits, null, 2));
console.log("html len", html.length, "hits", hits.length);
console.log(hits.slice(0, 20));
await browser.close();
