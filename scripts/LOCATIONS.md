# UAE location import

Neighborhoods are stored in `uae_emirates` and `uae_neighborhoods` tables.

## Fetch from Dubizzle (recommended)

Dubizzle blocks datacenter IPs (Incapsula). Use **RealtyAPI**, which wraps Dubizzle's location autocomplete:

```powershell
$env:REALTYAPI_KEY = "your_key"
node scripts/fetch-dubizzle-locations-realtyapi.mjs
```

Output: `backend/database/data/dubizzle-locations.json`

## Bootstrap via PropertyFinder (fallback)

When Dubizzle is unreachable, this script collects communities from PropertyFinder's public API:

```powershell
node scripts/fetch-uae-locations-propertyfinder.mjs
```

Output: `backend/database/data/uae-locations.json`

## Merge Wikipedia Dubai communities

Official Dubai communities (224) from Wikipedia are merged into the Dubai list:

```powershell
node scripts/merge-wikipedia-dubai-locations.mjs
node scripts/sync-uae-locations-frontend.mjs
```

Source: https://en.wikipedia.org/wiki/List_of_communities_in_Dubai

## Merge Bayut / real-estate location seed

Curated hierarchical seed (Bayut area guides, ADSDI):

```powershell
node scripts/merge-real-estate-locations-seed.mjs
node scripts/sync-uae-locations-frontend.mjs
```

Input: `backend/database/data/uae-real-estate-locations-seed.json`

Imports `area` + `city_region` rows and non-project sub-communities. Skips tower/project-level entries.

## Sync frontend bundle

After updating `uae-locations.json`, copy a compact version for the SPA:

```powershell
node scripts/sync-uae-locations-frontend.mjs
```

Output: `frontend/src/data/uae-locations-bundled.json`

## Import into Laravel

```powershell
cd backend
php artisan migrate
php artisan locations:import
# or: php artisan db:seed --class=UaeLocationSeeder
```

## API

`GET /api/v1/uae/locations` — emirates with nested neighborhoods.

## Local Playwright fetch (optional)

If you have a residential IP and Playwright installed:

```powershell
cd backend/workers/auto-apply
node fetch-dubizzle-locations.mjs
```
