/**
 * Playwright auto-apply worker — Phase 6: screening detection + screenshots.
 */
import express from "express";

const app = express();
app.use(express.json({ limit: "5mb" }));

const API_BASE = process.env.COPILOT_API_URL ?? "http://localhost:8000/api/v1";
const WORKER_SECRET = process.env.COPILOT_AUTO_APPLY_WORKER_SECRET ?? "change-me-worker-secret";
const PORT = Number(process.env.PORT ?? 3100);

const SCREENING_PATTERNS = [
  /legally authorized to work/i,
  /visa sponsorship/i,
  /expected salary|salary expectation/i,
  /years? of (?:relevant )?experience/i,
  /notice period/i,
];

function detectScreening(pageText) {
  const detected = [];
  for (const pattern of SCREENING_PATTERNS) {
    const match = pageText.match(pattern);
    if (match) {
      detected.push({ text: match[0], source: "pattern", confidence: 0.85 });
    }
  }
  return detected;
}

async function api(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Copilot-Worker-Secret": WORKER_SECRET,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path}: ${await res.text()}`);
  return res.json();
}

async function report(applicationId, payload) {
  return api("/copilot/auto-apply/worker/report", { application_id: applicationId, ...payload });
}

async function uploadScreenshot(applicationId, step, imageBase64) {
  return api("/copilot/auto-apply/worker/screenshot", {
    application_id: applicationId,
    step,
    image_base64: imageBase64,
  });
}

app.post("/apply", async (req, res) => {
  const { application_id: applicationId, apply_url: applyUrl } = req.body ?? {};
  if (!applicationId || !applyUrl) {
    return res.status(422).json({ error: "application_id and apply_url required" });
  }

  res.json({ accepted: true, application_id: applicationId });

  setImmediate(async () => {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(applyUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
      const detectedScreening = detectScreening(bodyText);

      const screenshotBuffer = await page.screenshot({ type: "png" });
      await browser.close();

      await uploadScreenshot(applicationId, "apply_page", screenshotBuffer.toString("base64"));

      const hasCaptcha = /captcha|recaptcha|hcaptcha/i.test(bodyText);
      const confidence = hasCaptcha ? 0.35 : detectedScreening.length > 2 ? 0.55 : 0.72;

      await report(applicationId, {
        status: confidence >= 0.75 && !hasCaptcha ? "submitted" : "needs_review",
        confidence_score: confidence,
        detected_screening: detectedScreening,
        logs: [
          { step: "navigate", message: `Opened apply page: ${title}`, level: "info" },
          {
            step: "screening_detect",
            message: `Detected ${detectedScreening.length} screening signal(s).`,
            level: "info",
            payload: { detected: detectedScreening },
          },
          {
            step: "submit",
            message: hasCaptcha
              ? "CAPTCHA detected — held for manual review."
              : "MVP worker — form fill not implemented; review recommended.",
            level: hasCaptcha ? "warning" : "info",
          },
        ],
      });
    } catch (err) {
      await report(applicationId, {
        status: "failed",
        error_message: err instanceof Error ? err.message : String(err),
        logs: [{ step: "failed", message: String(err), level: "error" }],
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Copilot auto-apply worker listening on :${PORT}`);
});
