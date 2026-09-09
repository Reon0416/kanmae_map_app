# Database Design

Core tables:

- `auth.users`: Supabase Auth managed account records. Email and password credentials stay here.
- `profiles`: app profile for each authenticated user.
- `stores`: public restaurant information.
- `store_status_updates`: three-choice status submitted by stores.
- `user_store_stamp_counts`: one row per user and store, storing the cumulative stamp count.
- `stamp_events`: minimal visit event log used for audit/debugging and optional retention policies.
- `visit_records`: legacy user-submitted visit records and wait-time buckets.
- `crowd_reports`: aggregated crowd signal source.
- `current_store_status`: denormalized status used by the map and cards.
- `store_admins`: maps authenticated users to manageable stores.

RLS principles:

- Public users can read public store information and current status.
- Users can read only their own profile, stamp counts, and stamp events.
- Users record visits through `record_visit_stamp`, which atomically inserts a minimal event and increments the aggregate count.
- The stamp card UI is computed from `user_store_stamp_counts`; every historical stamp slot is not stored.
- Store admins can only manage stores linked through `store_admins`.
- Service role keys must never be exposed to the frontend.
