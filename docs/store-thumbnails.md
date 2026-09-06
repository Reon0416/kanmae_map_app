# Store list thumbnails

Use `StoreThumbnail` for every illustrated store thumbnail. The list reserves
86 x 86 CSS pixels; the centered visible crop is always 78 x 78 pixels.

Register the source dimensions and a manually reviewed building bounding box in
`src/app/stores/page.tsx`. Exclude white margins, detached flags, vegetation,
cast shadows and pavement extending beyond the building. Pixel thresholding is
only an initial estimate: it also detects pavement and unrelated objects.

The component scales uniformly by the larger of 78 / building width and
78 / building height, centers the building and clips to the common square.
This intentionally crops the edges of wide/tall buildings rather than shrinking
the entire illustration. Never stretch the aspect ratio or override the scale
per store. Keep source assets intact.

Before publishing an additional thumbnail, render it beside existing thumbnails
at actual mobile and desktop sizes. Check loaded images, apparent building size,
the main sign, crop edges and alignment. Adjust the reviewed building bounds if
necessary, not the shared square dimensions. Deployment success alone does not
verify the appearance.

The previous width-only rule produced heights of about 86px (Kenpei), 78px
(Semi) and 54px (Butafuku); equal widths did not mean equal visual size.

