# KANMAE

KANMAE is a map-first web app for checking restaurant crowd levels and wait-time estimates around Kandai-mae.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Mapbox or MapLibre-ready structure
- Vercel-ready project layout

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Supabase

Run the migration in `supabase/migrations/0001_initial_schema.sql`, then load `supabase/seed.sql` for demo stores.

## Directory Structure

- `src/app`: Next.js routes and API routes
- `src/components`: UI, map, store, visit-record, and layout components
- `src/features`: domain logic and types
- `src/lib`: Supabase, map, security, and shared helpers
- `src/constants`: status, wait-time, and time-slot constants
- `supabase`: migrations and seed data
- `docs`: requirements, database, crowd logic, and API notes

## MVP Scope

Included:

- Role-select login entry for users, store operators, and KANMAE admins
- Map screen
- Restaurant pins
- Store cards and detail pages
- Store admin status update screen
- Visit record and wait-time selection UI
- Location validation helper
- Current status calculation
- Admin store management screens
- Supabase schema and RLS starter policies

## Screen Roles

Development login is available at `/login`.

- User: `/`
- Store operator: `/store-admin`
- KANMAE admin: `/admin`

The current role split uses `localStorage` for development only. Production should use Supabase Auth, store role assignments in the database, and enforce permissions with RLS policies.

## Mobile UI

KANMAE is designed mobile-first. The home screen uses the map as the primary full-screen surface, with search, filters, wait-time pins, and the selected store sheet layered over the map.

Not included in MVP:

- Reviews
- Comments
- Rankings
- Coupons
- Payments
- Reservations
- AI prediction
