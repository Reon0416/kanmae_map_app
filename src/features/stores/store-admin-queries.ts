import type { Store } from "@/features/stores/store-types";
import { latLngToMapPosition } from "@/lib/map/map-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StoreAdminRow = {
  id: string;
  name: string;
  description: string | null;
  genre: string | null;
  price_band: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  walk_minutes: number | null;
  hours: string | null;
  closed: string | null;
  accepts_takeout: boolean | null;
  has_student_discount: boolean | null;
  updated_at: string | null;
  display_status: string | null;
  wait_time: string | null;
  status_updated_at: string | null;
};

function normalizePriceBand(value?: string | null): Store["priceBand"] {
  if (value === "under_800" || value === "800_1200" || value === "1200_1800" || value === "over_1800") {
    return value;
  }

  return "800_1200";
}

function normalizeDisplayStatus(value?: string | null): Store["status"] {
  if (
    value === "available" ||
    value === "limited" ||
    value === "slightly_crowded" ||
    value === "full" ||
    value === "stale" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeWaitTime(value?: string | null): Store["waitTime"] {
  if (value === "no_wait" || value === "within_5" || value === "between_5_10" || value === "between_10_20" || value === "over_20") {
    return value;
  }

  return "no_wait";
}

function mapStoreAdminRow(row: StoreAdminRow): Store {
  const lat = row.lat ?? 34.7732;
  const lng = row.lng ?? 135.5073;

  return {
    id: row.id,
    name: row.name,
    description: row.description || "関大前エリアの飲食店です。",
    genre: row.genre || "未設定",
    priceBand: normalizePriceBand(row.price_band),
    address: row.address || "大阪府吹田市千里山東",
    lat,
    lng,
    walkMinutes: row.walk_minutes ?? 5,
    hours: row.hours || "未設定",
    closed: row.closed || "未設定",
    acceptsTakeout: row.accepts_takeout ?? false,
    hasStudentDiscount: row.has_student_discount ?? false,
    status: normalizeDisplayStatus(row.display_status),
    waitTime: normalizeWaitTime(row.wait_time),
    lastUpdatedAt: row.status_updated_at ?? row.updated_at ?? new Date().toISOString(),
    mapPosition: latLngToMapPosition({ lat, lng })
  };
}

export async function getCurrentStoreAdminStore() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_current_store_admin_store");

  if (error || !data?.[0]) {
    return null;
  }

  return mapStoreAdminRow(data[0] as StoreAdminRow);
}
