# Khaleej — UAE Multi-Service Classifieds Platform

An all-in-one classifieds platform for the UAE covering **shared accommodation**, **jobs**, and **home services** — with messaging, reviews, verification, AI-powered recommendations, and a built-in admin panel.

Built from the *UAE Classifieds — Silicon Valley Level* product spec.

> **The frontend is fully working today.** Run `npm install && npm run dev` and open <http://localhost:5173> — every page works on rich mock data. The Laravel backend is fully scaffolded and ready to boot as soon as you install PHP + Composer.

---

## Repository layout

```
uae-classifieds/
├── frontend/   # React 18 + Vite + TypeScript + Tailwind  (RUNNING)
└── backend/    # Laravel 11 REST API + Sanctum + SQLite/MySQL  (READY)
```

The two are completely decoupled — the React SPA talks to the Laravel API over HTTP. You can deploy them independently.

---

## Prerequisites

| Tool      | Version  | Install                                                          |
| --------- | -------- | ---------------------------------------------------------------- |
| Node.js   | ≥ 20     | https://nodejs.org/ (already installed via winget on this PC)    |
| PHP       | ≥ 8.2    | https://windows.php.net/download/ — needs `mbstring`, `pdo_sqlite` or `pdo_mysql`, `openssl`, `curl`, `fileinfo`, `gd` |
| Composer  | ≥ 2.6    | https://getcomposer.org/download/                                |
| (MySQL)   | ≥ 8      | optional — SQLite is the default for dev                          |

> **Easiest Windows setup:** [Laravel Herd](https://herd.laravel.com/windows) — bundles PHP + Composer + Node in a single installer.

---

## Frontend (React + Vite)

### Important — TLS fix for this machine

Node 24 can't verify the npm registry through your corporate proxy / antivirus. Always run npm with the Windows certificate store:

```powershell
$env:NODE_OPTIONS = "--use-system-ca"
```

You can make this permanent:

```powershell
[Environment]::SetEnvironmentVariable("NODE_OPTIONS", "--use-system-ca", "User")
```

### Run

```powershell
cd frontend
$env:NODE_OPTIONS = "--use-system-ca"   # required on this machine
npm install
npm run dev
```

Open <http://localhost:5173>.

### Available scripts

| Script           | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Start the Vite dev server at port 5173     |
| `npm run build`  | Type-check + production build to `dist/`   |
| `npm run preview`| Preview the production build               |
| `npm run lint`   | TypeScript-only project type-check         |

The app ships with **rich mock data**, so every page (home, accommodation, jobs, services, dashboard, admin) works without the backend.

---

## Backend (Laravel 11 API)

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API is then live at <http://localhost:8000/api/v1>.

### Wire frontend → backend

Create `frontend/.env.local`:

```
VITE_API_URL=http://localhost:8000/api/v1
```

Then restart `npm run dev`.

### Seeded credentials

| Email                 | Password   | Role  |
| --------------------- | ---------- | ----- |
| `admin@khaleej.ae`    | `password` | admin |
| `aisha@khaleej.ae`    | `password` | host  |

---

## What's built (mapped to the spec)

### From the PDF

- [x] **Accommodation module** — listings list, filters (price, room type, gender, amenities, metro distance, listed-by), AI match score badges, image gallery, host card, similar listings
- [x] **Jobs module** — list with employment/experience/industry/salary/remote filters, detail page, apply CTA, employer dashboard hooks, "Build your CV" placeholder
- [x] **Home Services module** — category pills, ratings & reviews, booking flow with time-slot picker, verified-provider badges
- [x] **User types** — Guest, Lister, Seeker, Broker, Service Provider, Employer, Admin (all in `app/Models/User.php::role`)
- [x] **Detailed listing schema** — every field from spec pg. 10 implemented (`emirate`, `area`, `room_type`, `tenants`, `deposit`, `attached_bathroom`, `balcony`, `gender_preference`, `nationality_preference`, `distance_to_metro_km`, `listed_by`, etc.)
- [x] **Search & filters** — every field from spec pg. 11 wired in `pages/accommodation/List.tsx`
- [x] **Auth & verification** — register/login flows, ID/phone verification placeholders, `is_verified` flag and badge across UI
- [x] **Messaging** — inbox UI in dashboard, threads + messages API
- [x] **Reviews & trust scoring** — reviews API + UI, host rating shown everywhere
- [x] **Monetization** — Free / Boost / Pay-per-post pricing in posting flow; "Commission workflow" agreement step; ads slots toggle in admin
- [x] **Admin panel** — overview stats, listing approval queue, user table, reports queue, ads toggle
- [x] **AI surfaces** — match-score badges, recommendation cards, in-app chatbot widget with stubbed canned replies
- [x] **Modern UI/UX** — mobile-first, clean, fast, accessible (focus rings, semantic markup)

### Technical highlights

- **Frontend:** React Router 6, Tailwind design system with custom brand palette, fully typed mock data layer, type-safe API client with graceful fallback, no heavy UI libraries (lucide icons only)
- **Backend:** Laravel 11 (slim `bootstrap/app.php` style), Sanctum personal-access-token auth, resource controllers, JSON-only responses, SQLite by default for zero-config dev, MySQL ready in `config/database.php`, factories + seeder for instant demo data

---

## API surface (v1)

All routes are prefixed with `/api/v1`.

| Method | Path                              | Auth   | Purpose                          |
| ------ | --------------------------------- | ------ | -------------------------------- |
| POST   | `/auth/register`                  | —      | Sign up + return Sanctum token   |
| POST   | `/auth/login`                     | —      | Login + token                    |
| GET    | `/auth/me`                        | yes    | Current user                     |
| POST   | `/auth/logout`                    | yes    | Revoke token                     |
| GET    | `/listings`                       | —      | Paginated, filterable listings   |
| GET    | `/listings/{id}`                  | —      | Single listing + host            |
| POST   | `/listings`                       | yes    | Create a listing (pending)       |
| PUT    | `/listings/{id}`                  | yes    | Update own listing               |
| DELETE | `/listings/{id}`                  | yes    | Delete own listing               |
| POST   | `/listings/{id}/favorite`         | yes    | Toggle favorite                  |
| GET    | `/jobs`                           | —      | Job board (filterable)           |
| GET    | `/jobs/{id}`                      | —      | Single job                       |
| POST   | `/jobs/{id}/apply`                | yes    | Apply with CV URL                |
| GET    | `/services`                       | —      | Browse home services             |
| POST   | `/services/{id}/book`             | yes    | Book a slot                      |
| GET    | `/threads`                        | yes    | Inbox                            |
| POST   | `/threads/{id}/messages`          | yes    | Send a message                   |
| POST   | `/reviews`                        | yes    | Leave a review                   |
| GET    | `/admin/stats`                    | admin  | Platform stats                   |
| PATCH  | `/admin/listings/{id}/approve`    | admin  | Approve a listing                |
| PATCH  | `/admin/listings/{id}/reject`     | admin  | Reject a listing                 |

---

## Roadmap (from the PDF)

- **Phase 1** ✅ Web platform launch *(this repo)*
- **Phase 2** 🚧 AI features + chatbot (recommendation engine, NLP support bot, fraud detection)
- **Phase 3** 🚧 Native mobile apps (React Native — reuse types and API client)
- **Phase 4** 🚧 GCC expansion (multi-tenant emirates → countries)

---

## License

Proprietary — all rights reserved.
