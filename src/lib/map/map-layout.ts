import { z } from "zod";
import configuration from "./map-layouts.json";

const coordinate = z.number().finite();
const asset = z.string().startsWith("/");
const point = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const placement = z.object({
  storeId: z.string().min(1),
  image: asset,
  x: coordinate,
  y: coordinate,
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
  zIndex: z.number().int().min(0).max(10).default(0)
});
const layoutSchema = z.object({
  background: asset,
  width: z.number().positive(),
  height: z.number().positive(),
  sourceWidth: z.number().positive().optional(),
  sourceHeight: z.number().positive().optional(),
  x: coordinate,
  y: coordinate,
  mode: z.enum(["baked", "layered"]),
  corners: z.object({ topLeft: point, topRight: point, bottomRight: point, bottomLeft: point })
});
const config = z.object({ activeLayoutId: z.string(), layouts: z.record(layoutSchema), stores: z.array(placement) }).superRefine((data, ctx) => {
  const ids = data.stores.map((store) => store.storeId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Duplicate store placement" });
  }
}).parse(configuration);
const activeLayout = config.layouts[config.activeLayoutId];
if (!activeLayout) throw new Error("Active map layout does not exist");
export const ACTIVE_MAP_LAYOUT = activeLayout;
export const ACTIVE_MAP_SOURCE_SIZE = {
  width: activeLayout.sourceWidth ?? activeLayout.width,
  height: activeLayout.sourceHeight ?? activeLayout.height
};

// Store positions stay in the original map's coordinate system when the extent grows.
export const MAP_STORE_PLACEMENTS = activeLayout.mode === "baked" ? [] : config.stores
  .filter((store) => store.x + store.width > activeLayout.x && store.y + store.height > activeLayout.y
    && store.x < activeLayout.x + activeLayout.width && store.y < activeLayout.y + activeLayout.height)
  .map((store) => ({
    ...store,
    x: (store.x - activeLayout.x) / activeLayout.width * 100,
    y: (store.y - activeLayout.y) / activeLayout.height * 100,
    width: store.width / activeLayout.width * 100,
    height: store.height / activeLayout.height * 100
  }));

export function fitMapViewport(width: number, height: number) {
  // Keep the current baked map presentation until the new background is ready.
  if (ACTIVE_MAP_LAYOUT.mode === "baked") return { width, height };
  const scale = Math.min(width / ACTIVE_MAP_LAYOUT.width, height / ACTIVE_MAP_LAYOUT.height);
  return { width: ACTIVE_MAP_LAYOUT.width * scale, height: ACTIVE_MAP_LAYOUT.height * scale };
}
