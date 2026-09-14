# Crowd Logic

Crowd calculation is intentionally separated from UI components.

Important files:

- `src/features/crowd/crowd-rules.ts`
- `src/features/crowd/calculate-current-status.ts`
- `src/features/visit-records/validate-location.ts`

Inputs:

- Store owner status: `available`, `limited`, or `full`
- Recent visit reports with wait-time buckets
- Time elapsed since the latest owner update

The app prioritizes fresh store input, weakens stale input over time, and uses repeated user reports to correct obvious crowd changes.

Current report aggregation:

- User reports update `current_store_status` through the `report_crowd_wait_time` database function.
- The displayed report value is the median wait-time bucket from reports recorded in the last 30 minutes.
- When the same authenticated user reports multiple times in that 30-minute window, only their latest report is used.
- Report-sourced status expires after 30 minutes without a new report and is displayed as `no_wait`.
- Raw crowd reports older than 30 days are pruned during report writes.
