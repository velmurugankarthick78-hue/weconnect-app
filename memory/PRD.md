# We Connect — Product Requirements

## Overview
"We Connect" is a Justdial-style local business directory mobile app for Tirunelveli and Thoothukudi districts, with a built-in **Admin Panel** for managing listings.

## Mobile App (Public)
- **Home**: District toggle (Tirunelveli / Thoothukudi), hero search bar, 9-category grid, "List your business" CTA. Lock icon opens Admin Panel.
- **Listings**: Filter by district + category + free-text search across name/owner/category/address/city. Per-card quick **Call / WhatsApp / Maps** actions.
- **Business Detail**: Hero image, owner, mobile, address+city, description, "Open in Google Maps" link, sticky bottom **Call** + **WhatsApp**.
- **Add Business (public form)**: Anyone can submit a new listing.

## Admin Panel (in-app, JWT-protected)
- **Login**: `/admin` → `/admin/login`. JWT stored via `expo-secure-store`.
- **Dashboard**: Live list of all `business_listings` with search across all fields, pull-to-refresh, Add new, Import CSV/Excel, per-row Edit + Delete (with confirm modal).
- **Edit form (`/admin/edit/[id]` and `/admin/edit/new`)**: Full form for all fields.
- **Import (`/admin/import`)**: Upload `.csv` or `.xlsx`. Shows inserted/skipped counts and per-row errors.

## MongoDB Collections
### `business_listings`
- `id` (UUID), `businessName`, `category`, `ownerName`, `mobileNumber`, `whatsappNumber`,
  `address`, `city`, `district`, `googleMapsLink`, `imageUrl`, `description`, `rating`, `createdAt`.

### `admins`
- Unique index on `email`. Single seeded admin: `admin@weconnect.app` / `WeConnect@2026`.

## Endpoints
### Public
- `GET /api/categories`
- `GET /api/businesses?district=&category=&search=`
- `GET /api/businesses/{id}`
- `POST /api/businesses` (public submission form)

### Admin (JWT required, `Authorization: Bearer <token>`)
- `POST /api/admin/login` → `{ token, email }`
- `GET /api/admin/me`
- `GET /api/admin/businesses?search=` (sorted by createdAt desc)
- `POST /api/admin/businesses`
- `PUT /api/admin/businesses/{id}`
- `DELETE /api/admin/businesses/{id}`
- `POST /api/admin/import` (multipart `file=` .csv or .xlsx)

## Data Migration
- Legacy `businesses` collection auto-migrated to `business_listings` on startup with field renaming
  (`name`→`businessName`, `owner_name`→`ownerName`, `mobile`→`mobileNumber`, `image_url`→`imageUrl`,
  `latitude`/`longitude` → `googleMapsLink` URL).
- Idempotent admin seed on startup.

## Import File Format
First row = header. Required columns: `businessName, category, ownerName, mobileNumber, address, district`.
Optional: `whatsappNumber, city, googleMapsLink, imageUrl, description`.

## Tech
- Backend: FastAPI + Motor (MongoDB) + bcrypt + PyJWT + openpyxl. All routes `/api`-prefixed.
- Frontend: Expo Router, Ionicons, expo-image, expo-linear-gradient, expo-haptics, expo-document-picker, expo-linking, `@/src/utils/storage` (secureSet/secureGet for JWT).
- Theme: Deep Blue (#1E3A8A) + Vibrant Orange (#EA580C).
