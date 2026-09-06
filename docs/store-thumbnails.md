# Store list thumbnails

The user explicitly selected the display from commit
`599ec16310ae61adff79dbf5b8de0fa00280ffb3` (initial Butafuku thumbnail addition).
The page has been restored to that version. Do not confuse it with the later
square-cover version `551e0165fb442519d38a5e9b8568c0c098bf7668`.

Preserve the 86px frame, width-based scale and original artwork bounds in
`src/app/stores/page.tsx`. Different heights are intentional in this selected
historical appearance. The unused StoreThumbnail square-cover component must
not be reintroduced: it clipped Butafuku and Kenpei.

Do not deploy the rejected square-redrawn Butafuku illustration. When asked to
restore a prior appearance, identify the referenced message/commit and compare
the actual page source before publishing. Do not infer the target from the
latest screenshot alone. New sizing changes require a new user request.
