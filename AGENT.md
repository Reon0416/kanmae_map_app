# KANMAE Agent Instructions

## Project Overview

KANMAE is a web application for Kansai University students to check restaurant crowd levels and estimated waiting times around Kandai-mae.

The app is similar to a theme park waiting-time map, but for local restaurants.

## Core Principle

Do not build this as a perfectly accurate real-time waiting-time app. Build it as an app that helps users judge whether they are likely to enter a restaurant smoothly.

Use wording such as:

- 空席情報
- 待ち時間目安
- 最終更新

Avoid wording such as:

- 正確な待ち時間
- 必ず入れます
- 完全リアルタイム

## Code Organization

Do not write crowd calculation logic inside UI components.

Crowd logic must live in:

- `src/features/crowd/crowd-rules.ts`
- `src/features/crowd/calculate-current-status.ts`

Location verification must live in:

- `src/features/visit-records/validate-location.ts`

Supabase clients must live in:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`

## Security and Privacy

Use Supabase RLS. Do not expose service role keys to the frontend. Do not store precise location history, student numbers, personal rankings, or individual visit histories visible to stores.
