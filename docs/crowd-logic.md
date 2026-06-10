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
