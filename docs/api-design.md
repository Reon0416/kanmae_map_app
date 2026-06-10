# API Design

Routes:

- `POST /api/status`: accepts store status updates.
- `POST /api/visit-records`: validates location and stores a visit record.
- `POST /api/crowd`: calculates current display status from owner input and reports.

The current implementation returns local JSON responses for MVP development. Replace persistence with Supabase calls inside these routes while keeping request and response shapes stable.
