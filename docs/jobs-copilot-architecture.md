# Jobs Copilot — Architecture & Implementation Guide

Production SaaS module for Khaleej Classifieds: AI job matching + automated applications.

**Stack:** Laravel 11 API · MySQL · React SPA · Laravel Queues · Playwright (Phase 5) · OpenAI · Stripe (Phase 4)

---

## 1. High-level architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React SPA  │────▶│  Laravel API     │────▶│  MySQL          │
│  /jobs/     │     │  /api/v1/copilot │     │  profiles, jobs │
│  copilot/*  │     │  Sanctum auth    │     │  applications   │
└─────────────┘     └────────┬─────────┘     └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐   ┌────────────┐   ┌──────────────┐
        │ Queues   │   │ OpenAI     │   │ Playwright   │
        │ parse,   │   │ parse,     │   │ auto-apply   │
        │ scrape,  │   │ cover,     │   │ (Premium)    │
        │ auto-apply│  │ tailor     │   │              │
        └──────────┘   └────────────┘   └──────────────┘
```

### Modules

| Module | Responsibility |
|--------|----------------|
| User Profile | Job seeker profile, screening answers, work authorization |
| Resume | Upload, parse, builder integration, PDF, ATS templates |
| Job Aggregation | Sources, scrape, dedupe, expire |
| Job Matching | Deterministic score 0–100 + optional embeddings (Phase 7) |
| AI Assistant | Summary, bullets, cover letter, screening, tailor — **never fabricate** |
| Auto-Apply | Premium Playwright bot + confidence + needs_review (Phase 5) |
| Billing | Plans, Stripe, usage limits (Phase 4) |
| Dashboard | Recommendations, applications, credits |
| Admin | Users, sources, logs, AI cost |

---

## 2. Phase 1 — IMPLEMENTED

### Database (migrations)

| Table | File |
|-------|------|
| `users` + plan fields | `2026_05_23_100000_add_copilot_fields_to_users_table.php` |
| `job_seeker_profiles` | `2026_05_23_100010_create_job_seeker_profiles_table.php` |
| `resumes` upload fields | `2026_05_23_100020_add_upload_fields_to_resumes_table.php` |
| `user_screening_answers` | `2026_05_23_100030_create_user_screening_answers_table.php` |

### Backend

| Component | Path |
|-----------|------|
| Config | `config/copilot.php` |
| Profile service | `app/Services/Copilot/JobSeekerProfileService.php` |
| AI parser | `app/Services/Copilot/AiResumeParserService.php` |
| Upload + extract | `app/Services/Copilot/ResumeParserService.php` |
| Queue job | `app/Jobs/ParseResumeJob.php` |
| Profile API | `app/Http/Controllers/Api/Copilot/JobSeekerProfileController.php` |
| Resume API | `app/Http/Controllers/Api/Copilot/CopilotResumeController.php` |
| Dashboard API | `app/Http/Controllers/Api/Copilot/CopilotDashboardController.php` |

### API routes (`/api/v1/copilot/*`)

- `GET /copilot/pricing` (public)
- `GET /copilot/dashboard`
- `GET /copilot/applications`
- `GET|PUT /copilot/profile`
- `GET /copilot/resumes`
- `POST /copilot/resumes/upload` (multipart)
- `GET /copilot/resumes/{id}`
- `POST /copilot/resumes/{id}/parse`
- `POST /copilot/resumes/{id}/set-default`

### Frontend

| Route | Page |
|-------|------|
| `/jobs/copilot` | Marketing landing |
| `/jobs/copilot/dashboard` | Dashboard |
| `/jobs/copilot/profile` | Job seeker profile |
| `/jobs/copilot/resumes` | Upload + list |
| `/jobs/copilot/pricing` | Plans preview |

Hooks: `lib/copilot/useJobSeekerProfile.ts`, `useCopilotDashboard.ts`

### Setup

```bash
cd backend
composer install   # adds smalot/pdfparser
php artisan migrate
php artisan queue:work   # for ParseResumeJob

# .env
OPENAI_API_KEY=sk-...
COPILOT_OPENAI_MODEL=gpt-4o-mini
```

---

## 3. Phase 2 — IMPLEMENTED

### Database

| Table | Purpose |
|-------|---------|
| `job_sources` | Admin-managed job boards / career pages |
| `copilot_jobs` | External/aggregated jobs (avoids Laravel queue `jobs` table) |
| `job_matches` | Polymorphic matches (platform `job_posts` + `copilot_jobs`) |
| `saved_jobs` | Polymorphic saved jobs |

### Backend

| Component | Path |
|-----------|------|
| Matching engine | `app/Services/Copilot/JobMatchingService.php` |
| Queue job | `app/Jobs/CalculateJobMatchesJob.php` |
| Jobs API | `app/Http/Controllers/Api/Copilot/CopilotJobController.php` |
| Admin import | `app/Http/Controllers/Api/Admin/CopilotJobAdminController.php` |

### API

- `GET /copilot/jobs/recommended?status=recommended|saved|all`
- `POST /copilot/jobs/matches/recalculate?sync=1`
- `GET /copilot/jobs/matches/{id}`
- `POST|DELETE /copilot/jobs/matches/{id}/save`
- `POST /copilot/jobs/matches/{id}/dismiss`
- `POST /copilot/jobs/platform/{job}/match`
- Admin: `POST /admin/copilot/jobs/import`, `GET|POST /admin/copilot/job-sources`

Matches recalculate automatically after profile save or resume parse.

### Frontend

| Route | Page |
|-------|------|
| `/jobs/copilot/jobs` | Recommended jobs with match score, save, dismiss, manual apply |

Hook: `lib/copilot/useCopilotMatches.ts`

---

## 4. Phase 3 — IMPLEMENTED

### Database
- `user_usage_limits` — monthly AI credits, auto-apply counters (auto-apply used in Phase 5)

### Backend services
| Service | Purpose |
|---------|---------|
| `UsageLimitService` | Plan-based monthly AI credit tracking |
| `AiResumeService` | Summary, bullet enhancer (3 versions), tailor, keywords |
| `AiApplicationService` | Cover letter, screening answers, match explanation |
| `CopilotAiController` | REST endpoints + credit enforcement |

### API (`/api/v1/copilot/ai/*`)
- `GET /ai/usage`
- `POST /ai/generate-summary`
- `POST /ai/improve-bullet`
- `POST /ai/tailor-resume` (optional `job_match_id`)
- `POST /ai/extract-job-keywords`
- `POST /ai/generate-cover-letter`
- `POST /ai/generate-screening-answer`
- `POST /ai/explain-match`

All prompts in `config/copilot.php`. Each call consumes 1 AI credit (Free: 10/mo).

### Frontend
| Route | Page |
|-------|------|
| `/jobs/copilot/ai` | Summary, bullet enhancer, screening answers |
| Job cards on `/jobs/copilot/jobs` | Cover letter, keywords, tailor, explain match |

---

## 5. Phase 4 — IMPLEMENTED

### Database
- `subscription_plans` — plan catalog with limits and optional Stripe price IDs
- `copilot_billing_events` — audit log for subscriptions and credit packs
- `users` — Stripe IDs, subscription end date, credit balances
- `user_usage_limits` — daily auto-apply counter

### Backend
| Component | Purpose |
|-----------|---------|
| `SubscriptionService` | Checkout, cancel/resume, credit packs, Stripe webhooks, demo mode |
| `UsageLimitService` | Extended with auto-apply daily/monthly limits + credit balances |
| `CopilotBillingController` | Billing API |
| `EnsureCopilotPremium` middleware | Gates premium-only routes (Phase 5 auto-apply) |

### API
- `GET /copilot/billing/plans` (public)
- `GET /copilot/billing`
- `POST /copilot/billing/checkout`
- `POST /copilot/billing/credit-pack`
- `POST /copilot/billing/cancel` · `POST /copilot/billing/resume`
- `POST /webhooks/stripe/copilot`

Demo checkout works without `STRIPE_SECRET` — plans activate instantly for development.

### Frontend
| Route | Page |
|-------|------|
| `/jobs/copilot/pricing` | Upgrade with monthly/yearly |
| `/jobs/copilot/billing` | Usage, cancel, credit packs |
| `/jobs/copilot/billing/success` | Post-checkout confirmation |

---

## 6. Phase 5 — IMPLEMENTED

### Database
- `auto_apply_consents` — consent audit (IP, user-agent, version)
- `copilot_applications` — auto/manual application tracking with confidence + status
- `copilot_automation_logs` — step-by-step automation audit trail

### Backend
| Component | Purpose |
|-----------|---------|
| `AutoApplyService` | Consent, queue, demo execution, worker dispatch, confidence scoring |
| `RunAutoApplyJob` | Queue worker for async auto-apply runs |
| `CopilotAutoApplyController` | Consent + queue + applications + logs API |
| `CopilotAutoApplyWorkerController` | Playwright worker callbacks (`/worker/report`, `/worker/pending`) |

### Modes
- **`demo`** (default) — simulates apply flow in Laravel queue; marks `submitted` or `needs_review`
- **`playwright`** — dispatches to external worker at `COPILOT_AUTO_APPLY_WORKER_URL`

Worker stub: `backend/workers/auto-apply/` (Express + Playwright)

### API
- `GET|POST|DELETE /copilot/auto-apply/consent` (premium)
- `POST /copilot/jobs/matches/{id}/auto-apply` (premium)
- `GET /copilot/applications` · `GET /copilot/auto-apply/applications/{id}/logs`
- Worker: `GET /copilot/auto-apply/worker/pending` · `POST /copilot/auto-apply/worker/report`

### Frontend
| Route | Page |
|-------|------|
| `/jobs/copilot/jobs` | Auto-apply button + consent panel |
| `/jobs/copilot/applications` | Application tracker + automation logs |

---

## 7. Phase 6 — IMPLEMENTED

### Database
- `copilot_blacklist_entries` — user blocklist (company, domain, URL)
- `copilot_automation_settings` — daily digest preferences per user

### Backend services
| Service | Purpose |
|---------|---------|
| `BlacklistService` | User + global blocklists checked before queue |
| `ScreeningDetectionService` | Pattern + question-mark detection from job descriptions |
| `ConfidenceScoringService` | Weighted confidence breakdown (profile, match, screening, etc.) |
| `ScreenshotStorageService` | Worker screenshot storage + authenticated URLs |
| `CopilotDailyDigestService` | 24h activity summary emails |

### API
- `GET|PUT /copilot/automation/settings`
- `GET /copilot/automation/digest/preview`
- `GET|POST|DELETE /copilot/automation/blacklist`
- `POST /copilot/auto-apply/applications/{id}/approve|cancel`
- `GET /copilot/auto-apply/applications/{id}/screenshots/{path}`
- Worker: `POST /copilot/auto-apply/worker/screenshot`

### Scheduled command
```bash
php artisan copilot:send-daily-digest   # hourly check, sends at user's digest hour
php artisan schedule:work               # or cron in production
```

### Frontend
| Route | Page |
|-------|------|
| `/jobs/copilot/settings` | Blacklist + daily digest |
| `/jobs/copilot/applications` | Approve/review, confidence breakdown, screenshots |

---

## 8. Phase 7 — IMPLEMENTED

### Database
- Extended `job_sources` — country, scrape_config, interval, scrape status
- `copilot_embeddings` — OpenAI vectors for jobs + profiles (hybrid matching)
- `copilot_scrape_runs` — scrape audit log
- `job_matches.semantic_score` + `scoring_method` (deterministic | hybrid)

### Backend services
| Service | Purpose |
|---------|---------|
| `JobScraperService` | Multi-source scrape (demo, JSON, RSS) with dedupe |
| `EmbeddingService` | OpenAI embeddings + cosine similarity blend |
| `CopilotMonitoringService` | Admin stats dashboard |

### Multi-country
- `config/copilot.php` → `countries` (UAE, SA, QA, KW, BH, OM)
- Profile country filters external job matching
- `GET /copilot/countries` · `GET /copilot/jobs/recommended?country=SA`

### Admin API
- `GET /admin/copilot/monitoring`
- `PATCH /admin/copilot/job-sources/{id}`
- `POST /admin/copilot/job-sources/{id}/scrape`
- `GET /admin/copilot/scrape-runs`

### Scheduled commands
```bash
php artisan copilot:scrape-sources
php artisan schedule:work
```

### Frontend
| Route | Page |
|-------|------|
| `/jobs/copilot/jobs` | Country filter + hybrid match badges |
| `/jobs/copilot/admin` | Admin monitoring + trigger scrape (admin only) |

---

## 9. Job matching algorithm (Phase 2 + 7 hybrid)

`JobMatchingService::score(profile, resume, job)`:

| Factor | Weight |
|--------|--------|
| Job title | 20 |
| Skills | 25 |
| Experience | 15 |
| Location / remote | 15 |
| Salary | 10 |
| Industry | 10 |
| Work authorization | 5 |

Returns: `match_score`, `matched_skills`, `missing_skills`, `match_reason`, boolean flags.

---

## 5. AI truthfulness rules

Hard constraints for all prompts:

- Never invent employers, degrees, certifications, visas, or metrics
- Source of truth: `job_seeker_profiles` + `resumes.data` + `user_screening_answers`
- Uncertain screening answers → `NEEDS_USER_REVIEW` → application status `needs_review`
- No CAPTCHA bypass; no fake third-party accounts

---

## 6. Auto-apply flow (Phase 5)

1. Verify premium + consent + daily/monthly limits
2. Load default resume + match ≥ user threshold
3. Playwright: open URL, detect fields, fill from profile
4. Screening: stored answers → AI → needs_review if unknown
5. Submit only if `confidence_score ≥ threshold`
6. Log steps, screenshots, increment usage, notify user

---

## 7. Monetization

| Plan | Price | Auto-apply/mo | Daily cap |
|------|-------|---------------|-----------|
| Free | AED 0 | 0 | 0 |
| Starter | AED 49 | 100 | 10 |
| Pro | AED 99 | 500 | 25 |
| Max | AED 199 | 1,500 | 50 |

Credit packs: AED 19/25 apps, AED 49/100, AED 99/250.

---

## 8. AI prompt templates

Stored in `config/copilot.php`:

1. **Resume parse** — JSON only, explicit content only
2. **Match explanation** — honest recruiter JSON
3. **Cover letter** — max 250 words, real experience only
4. **Screening answer** — or `NEEDS_USER_REVIEW`
5. **Bullet enhancer** — 3 versions, no invented numbers
6. **Resume tailor** — reorder/rewrite existing content only

---

## 9. Security

- Sanctum bearer tokens; policies on resume/application ownership
- Upload: PDF/TXT only, 5MB default, stored on `local` disk (S3 in prod)
- Rate limits on AI + auto-apply endpoints
- Encrypt sensitive profile fields (optional Phase 4+)
- GDPR delete endpoint; audit logs for auto-apply
- API keys server-side only

---

## 10. User roles

| Role | Capabilities |
|------|--------------|
| Guest | Marketing, pricing, register |
| Free | Profile, upload, parse, recommendations, manual apply |
| Premium | Auto-apply, cover letters, tailoring, tracking |
| Admin | Full panel |

---

## 11. Folder structure (target)

```
app/
  Models/JobSeekerProfile.php, JobMatch.php, Application.php, ...
  Services/Copilot/JobMatchingService.php, AutoApplyService.php, ...
  Jobs/ParseResumeJob.php, RunAutoApplyJob.php, ...
  Http/Controllers/Api/Copilot/...
frontend/src/
  pages/jobs/copilot/
  lib/copilot/
  types/copilot.ts
```

Phase 1 files are in place; remaining phases extend this tree without rewrites.
