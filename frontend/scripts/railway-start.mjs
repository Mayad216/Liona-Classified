import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 8080);

let apiUrl = process.env.VITE_API_URL?.replace(/\/$/, "");
if (!apiUrl && process.env.BACKEND_PUBLIC_DOMAIN) {
  apiUrl = `https://${process.env.BACKEND_PUBLIC_DOMAIN}/api/v1`;
}

if (apiUrl) {
  const configPath = join(distDir, "config.json");
  writeFileSync(configPath, JSON.stringify({ apiUrl }));
  console.log(`[railway-start] config.json -> ${apiUrl}`);

  const indexPath = join(distDir, "index.html");
  if (existsSync(indexPath)) {
    let html = readFileSync(indexPath, "utf8");
    const inject = `<script>window.__KHaleej_API__=${JSON.stringify(apiUrl)}</script>`;
    if (!html.includes("__KHaleej_API__")) {
      html = html.replace("<head>", `<head>${inject}`);
      writeFileSync(indexPath, html);
      console.log("[railway-start] Injected API URL into index.html");
    }
  }
} else {
  console.log("[railway-start] WARNING: Set VITE_API_URL or BACKEND_PUBLIC_DOMAIN");
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function sendFile(res, filePath, statusCode = 200) {
  const body = readFileSync(filePath);
  const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream";
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

createServer((req, res) => {
  const pathname = new URL(req.url ?? "/", `http://127.0.0.1:${port}`).pathname;
  const safePath = join(distDir, decodeURIComponent(pathname));

  if (safePath.startsWith(distDir) && existsSync(safePath) && statSync(safePath).isFile()) {
    sendFile(res, safePath);
    return;
  }

  sendFile(res, join(distDir, "index.html"));
}).listen(port, "::", () => {
  console.log(`[railway-start] Listening on [::]:${port}`);
});
