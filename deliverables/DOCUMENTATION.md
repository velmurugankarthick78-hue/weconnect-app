# We Connect — Complete Documentation

A Justdial-style local business directory mobile app for **Tirunelveli** and **Thoothukudi** districts. Built with **Expo (React Native)** + **FastAPI** + **MongoDB**.

---

## 1. Quick Reference

| Item | Value |
|---|---|
| Admin email | `admin@weconnect.app` |
| Admin password | `WeConnect@2026` |
| Admin URL (in-app) | Tap the **lock icon** on the home screen |
| Backend port | `8001` (all routes prefixed `/api`) |
| Frontend port | `3000` (Expo Metro) |
| MongoDB DB name | `test_database` (set via `DB_NAME` env) |
| Primary collection | `business_listings` |
| Admin collection | `admins` |

> **Change the admin password before going live.** Edit `ADMIN_PASSWORD` in `/app/backend/server.py`, delete the existing `admins` document in Mongo, and let the startup hook reseed.

---

## 2. Tech Stack

### Frontend (Expo 54, React Native)
- expo-router (file-based routing)
- expo-image, expo-linear-gradient, expo-haptics
- expo-document-picker (CSV/Excel upload)
- expo-linking (Call / WhatsApp / Maps deep links)
- @expo/vector-icons (Ionicons)
- react-native-safe-area-context
- `@/src/utils/storage` for secure JWT persistence

### Backend (FastAPI)
- motor (async MongoDB driver)
- pydantic v2 (request/response models)
- bcrypt (password hashing)
- PyJWT (JWT tokens, HS256)
- openpyxl (Excel `.xlsx` import)
- standard `csv` module (CSV import)

---

## 3. Project Structure

```
/app
├── backend/
│   ├── server.py           # All FastAPI routes + seed + auth
│   ├── requirements.txt
│   └── .env                # MONGO_URL, DB_NAME, JWT_SECRET (optional)
├── frontend/
│   ├── app/                # expo-router file-based routes
│   │   ├── _layout.tsx     # Root layout (icon font preload)
│   │   ├── index.tsx       # Home screen
│   │   ├── listings.tsx    # Search/category results
│   │   ├── add.tsx         # Public "List your business" form
│   │   ├── business/
│   │   │   └── [id].tsx    # Business detail
│   │   └── admin/
│   │       ├── index.tsx       # Auth gate → redirects to login/dashboard
│   │       ├── login.tsx
│   │       ├── dashboard.tsx   # Search, add, edit, delete, import
│   │       ├── import.tsx      # CSV/Excel bulk upload
│   │       └── edit/
│   │           └── [id].tsx    # Add (id="new") or Edit form
│   ├── src/
│   │   ├── api.ts          # Typed client for all endpoints
│   │   ├── theme.ts        # Colors, spacing, radius, font
│   │   └── utils/storage/  # Secure key/value (JWT)
│   ├── app.json
│   ├── package.json
│   └── .env                # EXPO_PUBLIC_BACKEND_URL
└── deliverables/           # Generated deliverables (this folder)
```

---

## 4. MongoDB Schemas

### `business_listings`
| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string (UUID) | yes | Auto-generated |
| `businessName` | string | yes | |
| `category` | string | yes | One of the 9 category keys |
| `ownerName` | string | yes | |
| `mobileNumber` | string | yes | 10-digit Indian mobile |
| `whatsappNumber` | string | no | Falls back to `mobileNumber` |
| `address` | string | yes | |
| `city` | string | no | |
| `district` | string | yes | `Tirunelveli` or `Thoothukudi` |
| `googleMapsLink` | string | no | Full Maps URL or `?q=lat,lng` |
| `imageUrl` | string | no | Cover image |
| `description` | string | no | |
| `rating` | number | no | Default 4.5 |
| `createdAt` | ISO string | auto | UTC |

### `admins`
- `email` (unique index)
- `password_hash` (bcrypt)
- `createdAt`

### Categories (constant, served by API)
`hotels`, `hospitals`, `battery`, `electricians`, `plumbers`, `auto`, `restaurants`, `salons`, `grocery`.

---

## 5. API Reference

All routes are prefixed `/api`. JSON bodies. JWT for admin routes via `Authorization: Bearer <token>`.

### Public

#### `GET /api/categories`
Returns the 9 categories (`key`, `label`, `icon`, `imageUrl`).

#### `GET /api/businesses`
Query params (all optional): `district`, `category`, `search`.
Search runs case-insensitive regex across `businessName`, `ownerName`, `category`, `address`, `city`.

#### `GET /api/businesses/{id}`
Returns one business or 404.

#### `POST /api/businesses`
Public submission form. Body = `BusinessCreate`. Returns the created listing.

### Admin (JWT required)

#### `POST /api/admin/login`
Body: `{ "email": "...", "password": "..." }`
Returns: `{ "token": "<jwt>", "email": "..." }`. Token TTL: 24h.

#### `GET /api/admin/me`
Verifies token. Returns `{ "email": "..." }`.

#### `GET /api/admin/businesses?search=...`
Same search rules as public + matches `mobileNumber` and `district`. Sorted by `createdAt` desc.

#### `POST /api/admin/businesses`
Body: `BusinessCreate`. Returns created listing.

#### `PUT /api/admin/businesses/{id}`
Body: any subset of `BusinessUpdate` fields. Returns updated listing.

#### `DELETE /api/admin/businesses/{id}`
Returns `{ "deleted": true, "id": "..." }`.

#### `POST /api/admin/import`
Multipart: `file=@your.csv` or `file=@your.xlsx`.
Returns: `{ "inserted": N, "skipped": M, "errors": ["Row X: ..."] }`.

**Expected columns** (first row = header, order does not matter):

| Required | Optional |
|---|---|
| `businessName`, `category`, `ownerName`, `mobileNumber`, `address`, `district` | `whatsappNumber`, `city`, `googleMapsLink`, `imageUrl`, `description` |

A row missing any required column is skipped and reported in `errors`.

---

## 6. Local Development

```bash
# Backend
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (separate terminal)
cd /app/frontend
yarn install
yarn expo start --port 3000
```

The backend auto-seeds (idempotently) on first boot:
- Admin user (`admin@weconnect.app` / `WeConnect@2026`)
- 23 demo business listings (if `business_listings` empty)
- Migrates any legacy `businesses` records into the new schema

### Useful curl tests
```bash
# Login & get token
TOKEN=$(curl -s -X POST http://localhost:8001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@weconnect.app","password":"WeConnect@2026"}' | jq -r .token)

# List listings
curl http://localhost:8001/api/admin/businesses -H "Authorization: Bearer $TOKEN"

# CSV import
curl -X POST http://localhost:8001/api/admin/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@listings.csv"
```

---

## 7. Admin Panel — Usage Guide

1. Open the app → tap the small **lock** icon in the top-right of the home screen.
2. Sign in with the credentials above.
3. **Dashboard**:
   - Type in the search bar to filter (debounced 300ms).
   - Pull down to refresh.
   - Tap **Add new** to open a blank form.
   - Tap the **pencil** icon on any row to edit.
   - Tap the **trash** icon → confirm modal → delete.
   - Tap **Import CSV/Excel** to bulk upload.
   - Tap **logout** (top-right) to clear the JWT and return to login.
4. **Import**: pick a `.csv` or `.xlsx`. The result panel shows inserted/skipped counts and the first 50 per-row errors.

---

## 8. CSV/Excel Import Template

```csv
businessName,category,ownerName,mobileNumber,whatsappNumber,address,city,district,googleMapsLink,imageUrl,description
Sample Hotel,hotels,Anand,9876543210,9876543210,Main Road,Palayamkottai,Tirunelveli,https://maps.google.com/?q=8.72,77.74,https://example.com/hotel.jpg,AC rooms with restaurant
Power Battery,battery,Karthik,9000011112,,Bypass Road,,Thoothukudi,,,Inverter & car batteries
```

Place the header row first. Empty optional cells become null.

---

## 9. Deep Links (deeplink testing requires a real device)

| Action | URL pattern |
|---|---|
| Call | `tel:9876543210` |
| WhatsApp | `https://wa.me/919876543210` (auto-prefixed `91` for 10-digit numbers) |
| Google Maps | the `googleMapsLink` field, or `https://www.google.com/maps/search/?api=1&query=<name+address>` |

Deep links do **not** work in the web preview — test on Android/iOS.

---

## 10. Deliverables in this package

```
deliverables/
├── DOCUMENTATION.md          # this file
├── ADMIN_CREDENTIALS.txt     # login info (DELETE after rotating password)
├── mongo_dump/               # mongodump BSON backup (restorable via mongorestore)
│   └── test_database/
│       ├── admins.bson
│       ├── business_listings.bson
│       └── businesses.bson   # legacy, kept for reference
├── mongo_json_export/        # human-readable backups
│   ├── business_listings.json
│   ├── business_listings.csv # re-importable via Admin → Import
│   └── admins.json
└── (source code/APK obtained via Emergent platform — see below)
```

### How to restore the database backup
```bash
mongorestore --uri="<your-mongo-url>" --db=test_database \
  /path/to/mongo_dump/test_database
```

Or simply re-import the CSV via the Admin Panel → Import.

---

## 11. Where to get the remaining deliverables

| Deliverable | Where |
|---|---|
| **Full source code ZIP** | Click **Save to GitHub** in the Emergent IDE, then clone/download from your GitHub repo |
| **APK / AAB Android build** | Click the **Publish** button (top-right of the Emergent IDE) and follow the Android build flow |
| **Production deployment URL** | Same **Publish** flow → preview/production environment URL |

---

## 12. Security Notes for Production

1. **Rotate the admin password** — edit `ADMIN_PASSWORD` in `server.py`, delete the existing admin doc, restart backend.
2. **Set a strong `JWT_SECRET`** in `/app/backend/.env` (a random 64+ char string).
3. Consider tightening `CORSMiddleware` `allow_origins` to your real domain.
4. Add rate limiting on `/api/admin/login` (e.g. `slowapi`) before public launch.
5. The public `POST /api/businesses` allows anyone to submit. Consider gating it behind a captcha/admin moderation queue if you want curated listings only.
