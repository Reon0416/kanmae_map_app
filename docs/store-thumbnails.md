# Store list thumbnails

User requirement: show the COMPLETE illustration, without clipping or stretching.
Never achieve similar size by cutting off the building.

Use `StoreThumbnail` and `THUMBNAIL_FRAME` for all stores. The shared frame is
122 x 86 CSS pixels; the inner area is 114 x 78 pixels. This accommodates the
three current illustrations at a common 78px height.

Register the source dimensions and a manually reviewed building bounding box in
`src/app/stores/page.tsx`. Include ALL visible artwork, signs and pavement with
a small safety margin. Exclude only empty background. Do not crop bounds to
just the central facade. Review pixel measurements against the source image.

The component uses min(available width / artwork width, available height /
artwork height) and centers the full artwork. Never use max(), cover, or
per-store zoom. Keep source assets intact. For exceptionally wide future images,
fit the whole image first and review framing before changing shared dimensions.

Before publishing an additional thumbnail, render it beside existing thumbnails
at actual mobile and desktop sizes. Check loaded images, apparent building size,
the main sign, ALL edges and alignment. Assert that the projected artwork bounds
are completely inside the viewport, not merely that the container has the right
dimensions. Check mobile row overlaps. Deployment success alone is insufficient.

Run `node scripts/check-store-thumbnails.cjs` from the repository root with
Playwright available. `PLAYWRIGHT_MODULE` may point to an installed runtime's
Playwright module; `BROWSER_CHANNEL` may select an installed browser. The check
renders the real component, asserts full artwork containment and common height,
and writes screenshots under `output/` for visual review. If new artwork cannot
meet the common height without clipping, the check fails; review the shared frame
rather than weakening the containment assertion.

The previous width-only rule produced heights of about 86px (Kenpei), 78px
(Semi) and 54px (Butafuku); equal widths did not mean equal visual size.
The later square-cover attempt clipped the buildings. Both approaches must not
be reintroduced. Full visibility takes priority over filling the frame.

