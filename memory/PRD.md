# We Connect — Product Requirements

## Overview
"We Connect" is a Justdial-style local business directory mobile app for Tirunelveli and Thoothukudi districts, built with Expo (React Native) + FastAPI + MongoDB.

## Core Features
- **Home**: District toggle (Tirunelveli / Thoothukudi), hero search bar, browse by category grid (9 categories), "List your business" CTA.
- **Listings**: Filter by district, category, and free-text search across name/owner/category/address. Each card shows name, category, owner, address with quick **Call / WhatsApp / Maps** actions.
- **Business Detail**: Full info screen with hero image, owner, mobile, address, description, "Open in Google Maps" link, and sticky bottom **Call** + **WhatsApp** CTAs.
- **Add Business**: Public form to submit a new listing (name, owner, mobile, optional WhatsApp, address, district, category, description).

## Categories
Hotels, Hospitals, Battery Shops, Electricians, Plumbers, Auto Services, Restaurants, Salons, Grocery.

## Tech
- Backend: FastAPI, Motor (MongoDB async), Pydantic. All routes prefixed `/api`.
- Frontend: Expo Router, expo-image, expo-linear-gradient, expo-haptics, expo-linking (tel:, wa.me, Google Maps URL).
- Theme: Deep Blue (#1E3A8A) + Vibrant Orange (#EA580C), Ionicons (Phosphor-style).

## Data
- 23 seed businesses auto-loaded on first boot (split across both districts and all categories).
- Mongo collection: `businesses`. UUID `id` (not ObjectId). `_id` excluded from all responses.

## Endpoints
- `GET /api/categories`
- `GET /api/businesses?district=&category=&search=`
- `GET /api/businesses/{id}`
- `POST /api/businesses`
- `POST /api/seed` (idempotent)
