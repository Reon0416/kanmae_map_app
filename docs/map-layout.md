# Extensible map layout

Edit `src/lib/map/map-layouts.json`. This is a versioned configuration, not a public editing screen.

## Coordinate contract

The original map defines fixed world coordinates: upper left (0, 0), width 1333, height 1999. X increases rightward; Y increases downward. Store frames use these coordinates, never screen pixels or percentages of the current viewport. Preserve this scale and orientation when creating expanded backgrounds.

`stores` is shared across all map layouts. Each entry contains a stable `storeId` matching store data, an original transparent `image` path, `x`, `y`, `width`, `height`, and optional `zIndex` (0-10). Coordinates mark the frame's upper left. Images fit inside their frames with preserved aspect ratio and bottom alignment. Normalize transparent margins before choosing frame sizes. Negative coordinates allow expansion above or left of the original map.

For example, an illustrative placement (not an actual store location):

```json
{ "storeId": "musou", "image": "/stores/musou-transparent.png", "x": 500, "y": 800, "width": 160, "height": 160, "zIndex": 1 }
```

## Expand the coverage

1. Prepare a store-free background with the existing roads aligned to the same fixed coordinates. Retain original store image files rather than recompositing them into the background.
2. Add a layout with `mode: "layered"`, its `background`, and the world rectangle `x`, `y`, `width`, `height`. For 400 units of additional coverage left and right, the original rectangle becomes x=-400, y=0, width=2133, height=1999. Existing store entries remain untouched.
3. Set the four geographic `corners` for the new extent so the current-location projection stays calibrated. These are geographic coordinates, distinct from illustration coordinates.
4. Add new store data and its placement. Existing store IDs preserve links and visit history. Stores outside the active rectangle are omitted; partial frames clip at the map edge.
5. Switch `activeLayoutId` to the new layout, build and preview mobile portrait/landscape. A larger extent fits fully on screen, so buildings appear smaller. Zoom controls can be added separately if needed.

Keep previous layouts and assets to permit rollback. Changing layout does not rewrite the shared store placements. A redesigned or rotated background must be aligned before reuse; this cannot be inferred automatically from an image.

## Current migration state

The active `legacy` background already contains buildings. Its `baked` mode disables overlays and preserves the current screen filling behavior. No speculative store coordinates are enabled. Once the store-free background is supplied, register accurate placements once and activate a layered layout. Layered mode uniformly scales the entire map to fit the viewport; differences in phone aspect ratios create margins, not distorted buildings. Pins remain absent.
