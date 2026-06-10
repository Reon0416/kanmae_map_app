# Database Design

Core tables:

- `stores`: public restaurant information.
- `store_status_updates`: three-choice status submitted by stores.
- `visit_records`: user-submitted visit records and wait-time buckets.
- `crowd_reports`: aggregated crowd signal source.
- `current_store_status`: denormalized status used by the map and cards.
- `store_admins`: maps authenticated users to manageable stores.
- `users`: anonymous or future authenticated user records.

RLS principles:

- Public users can read public store information and current status.
- Users can insert visit records, but precise location history is not stored.
- Store admins can only manage stores linked through `store_admins`.
- Service role keys must never be exposed to the frontend.
