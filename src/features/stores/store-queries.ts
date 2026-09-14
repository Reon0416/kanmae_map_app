import { cache } from "react";
import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import type { Store, StoreSummary } from "@/features/stores/store-types";
import { latLngToMapPosition } from "@/lib/map/map-config";
import { hasSupabaseEnvironment } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";

const now = Date.now();

const createStore = (
  store: Omit<Store, "description" | "priceBand" | "address" | "walkMinutes" | "hours" | "closed" | "acceptsTakeout" | "hasStudentDiscount" | "lastUpdatedAt" | "ownerStatus" | "mapPosition"> & {
    description?: string;
    walkMinutes?: number;
  }
): Store => ({
  description: store.description ?? "関大前エリアの飲食店です。",
  priceBand: "800_1200",
  address: "大阪府吹田市千里山東",
  walkMinutes: store.walkMinutes ?? 5,
  hours: "未設定",
  closed: "未設定",
  acceptsTakeout: false,
  hasStudentDiscount: false,
  lastUpdatedAt: new Date(now - 6 * 60000).toISOString(),
  mapPosition: latLngToMapPosition({ lat: store.lat, lng: store.lng }),
  ...store
});

export const demoStores: Store[] = [
  createStore({
    id: "toriton",
    name: "麺処　とりとん",
    genre: "居酒屋",
    heroImage: "/stores/toriton-sign.png",
    lat: 34.773298685190646,
    lng: 135.50875504614464,
    status: "available",
    waitTime: "within_5",
    walkMinutes: 4
  }),
  createStore({
    id: "suzume",
    name: "つけ麺　雀",
    genre: "つけ麺",
    heroImage: "/stores/suzume-sign.png",
    lat: 34.77360601431687,
    lng: 135.50812084235423,
    status: "limited",
    waitTime: "between_5_10",
    walkMinutes: 3
  }),
  createStore({
    id: "kirinji",
    name: "きりん寺",
    genre: "油そば",
    heroImage: "/stores/kirinji-sign.png",
    lat: 34.77360601434054,
    lng: 135.5078827963048,
    status: "slightly_crowded",
    waitTime: "between_10_20",
    walkMinutes: 3
  }),
  createStore({
    id: "butafuku",
    name: "ラーメン　豚福",
    genre: "家系ラーメン",
    heroImage: "/stores/butafuku-sign.png",
    lat: 34.7735503836104,
    lng: 135.50705801701554,
    status: "available",
    waitTime: "within_5",
    walkMinutes: 2
  }),
  createStore({
    id: "kenpei",
    name: "憲兵家",
    genre: "家系ラーメン",
    heroImage: "/stores/kenpei-sign.png",
    lat: 34.77343339593108,
    lng: 135.5060875932717,
    status: "unknown",
    waitTime: "no_wait",
    walkMinutes: 6
  }),
  createStore({
    id: "kirameki",
    name: "笑顔ノキラメキ",
    genre: "鶏白湯ラーメン",
    heroImage: "/stores/kirameki-sign.png",
    lat: 34.773432294310346,
    lng: 135.5060185264151,
    status: "full",
    waitTime: "over_20",
    walkMinutes: 6
  }),
  createStore({
    id: "semi",
    name: "蝉",
    genre: "魚介豚骨ラーメン",
    heroImage: "/stores/semi-sign.png",
    lat: 34.77327041674564,
    lng: 135.50677486778991,
    status: "stale",
    waitTime: "no_wait",
    walkMinutes: 4
  }),
  createStore({
    id: "kokoro",
    name: "麺屋　こころ",
    genre: "ラーメン",
    heroImage: "/stores/kokoro-sign.png",
    lat: 34.77283513040589,
    lng: 135.50586781314328,
    status: "limited",
    waitTime: "between_5_10",
    walkMinutes: 7
  }),
  createStore({
    id: "musou",
    name: "武双家",
    genre: "ラーメン",
    heroImage: "/stores/musou-sign.png",
    lat: 34.7729585105518,
    lng: 135.50586781308675,
    status: "available",
    waitTime: "within_5",
    walkMinutes: 7
  })
];

type StoreRow = {
  id: string;
  name: string;
  description?: string | null;
  genre?: string | null;
  price_band?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  walk_minutes?: number | null;
  hours?: string | null;
  closed?: string | null;
  accepts_takeout?: boolean | null;
  has_student_discount?: boolean | null;
  updated_at?: string | null;
  current_store_status?: StoreStatusRow | StoreStatusRow[] | null;
};

type StoreStatusRow = {
  store_id?: string;
  display_status?: string | null;
  wait_time?: string | null;
  source?: string | null;
  updated_at?: string | null;
  owner_wait_time_lock_until?: string | null;
};

const assetMatchers: { assetKey: string; includes: string[] }[] = [
  { assetKey: "toriton", includes: ["とりとん"] },
  { assetKey: "suzume", includes: ["雀"] },
  { assetKey: "kirinji", includes: ["きりん寺"] },
  { assetKey: "butafuku", includes: ["豚福"] },
  { assetKey: "kenpei", includes: ["憲兵"] },
  { assetKey: "kirameki", includes: ["キラメキ"] },
  { assetKey: "semi", includes: ["蝉"] },
  { assetKey: "kokoro", includes: ["こころ"] },
  { assetKey: "musou", includes: ["武双", "むそう"] }
];

const assetImages: Record<string, string> = {
  toriton: "/stores/toriton-sign.png",
  suzume: "/stores/suzume-sign.png",
  kirinji: "/stores/kirinji-sign.png",
  butafuku: "/stores/butafuku-sign.png",
  kenpei: "/stores/kenpei-sign.png",
  kirameki: "/stores/kirameki-sign.png",
  semi: "/stores/semi-sign.png",
  kokoro: "/stores/kokoro-sign.png",
  musou: "/stores/musou-sign.png"
};

function getAssetKey(name: string) {
  return assetMatchers.find((matcher) => matcher.includes.some((item) => name.includes(item)))?.assetKey;
}

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

const REPORT_STATUS_EXPIRES_MINUTES = 30;

function isExpiredReportStatus(status?: StoreStatusRow | null) {
  if (status?.source !== "reports" || !status.updated_at) return false;
  const updatedAt = new Date(status.updated_at).getTime();
  if (Number.isNaN(updatedAt)) return false;
  return Date.now() - updatedAt >= REPORT_STATUS_EXPIRES_MINUTES * 60 * 1000;
}

function getActiveOwnerWaitTimeLockUntil(status?: StoreStatusRow | null) {
  if (!status?.owner_wait_time_lock_until) return null;
  const lockUntil = new Date(status.owner_wait_time_lock_until).getTime();
  if (Number.isNaN(lockUntil) || lockUntil <= Date.now()) return null;
  return status.owner_wait_time_lock_until;
}

function mapStoreRow(row: StoreRow): Store {
  const lat = row.lat ?? 34.7732;
  const lng = row.lng ?? 135.5073;
  const assetKey = getAssetKey(row.name);
  const currentStatus = Array.isArray(row.current_store_status)
    ? row.current_store_status[0]
    : row.current_store_status;

  return {
    id: row.id,
    assetKey,
    name: row.name,
    description: row.description || "関大前エリアの飲食店です。",
    heroImage: assetKey ? assetImages[assetKey] : undefined,
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
    status: isExpiredReportStatus(currentStatus) ? "available" : normalizeDisplayStatus(currentStatus?.display_status),
    waitTime: isExpiredReportStatus(currentStatus) ? "no_wait" : normalizeWaitTime(currentStatus?.wait_time),
    lastUpdatedAt: currentStatus?.updated_at ?? row.updated_at ?? new Date().toISOString(),
    ownerWaitTimeLockUntil: getActiveOwnerWaitTimeLockUntil(currentStatus),
    mapPosition: latLngToMapPosition({ lat, lng })
  };
}

const getPublicStoreDetails = unstable_cache(async () => {
  const { data, error } = await createSupabasePublicClient()
    .from("stores")
    .select("id, name, description, genre, price_band, address, lat, lng, walk_minutes, hours, closed, accepts_takeout, has_student_discount, updated_at")
    .order("created_at", { ascending: true });
  if (error || !data) throw new Error(`Failed to load stores: ${error?.message ?? "No data returned."}`);
  return data as StoreRow[];
}, ["public-store-details-v1"], { revalidate: 60 });

const getPublicStoreSummaries = unstable_cache(async (): Promise<StoreSummary[]> => {
  const { data, error } = await createSupabasePublicClient()
    .from("stores")
    .select("id, name, genre")
    .order("created_at", { ascending: true });
  if (error || !data) throw new Error(`Failed to load store summaries: ${error?.message ?? "No data returned."}`);
  return data.map((row) => ({
    id: row.id,
    assetKey: getAssetKey(row.name),
    name: row.name,
    genre: row.genre || "未設定"
  }));
}, ["public-store-summaries-v1"], { revalidate: 60 });

export const getStores = cache(async function getStores() {
  if (process.env.NODE_ENV !== "production" && process.env.KANMAE_USE_SUPABASE !== "true") {
    return demoStores;
  }

  if (!hasSupabaseEnvironment()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Supabase environment variables are not configured.");
    }

    return demoStores;
  }

  try {
    noStore();
    const [data, statusResult] = await Promise.all([
      getPublicStoreDetails(),
      createSupabasePublicClient()
        .from("current_store_status")
        .select("store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until")
    ]);
    const { data: statuses, error } = statusResult;

    if (error || !data) {
      if (process.env.NODE_ENV !== "production") {
        return demoStores;
      }

      throw new Error(`Failed to load stores: ${error?.message ?? "No data returned."}`);
    }

    const statusByStore = new Map((statuses as StoreStatusRow[] ?? []).map((status) => [status.store_id, status]));
    return data.map((row) => mapStoreRow({ ...row, current_store_status: statusByStore.get(row.id) }));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      return demoStores;
    }

    throw error;
  }
});

// Record and collection screens do not need live status or store-detail fields.
export const getStoreSummaries = cache(async (): Promise<StoreSummary[]> => {
  if (process.env.NODE_ENV !== "production" && process.env.KANMAE_USE_SUPABASE !== "true") {
    return demoStores.map(({ id, name, genre }) => ({ id, name, genre, assetKey: getAssetKey(name) }));
  }

  if (!hasSupabaseEnvironment()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Supabase environment variables are not configured.");
    }
    return demoStores.map(({ id, name, genre }) => ({ id, name, genre, assetKey: getAssetKey(name) }));
  }

  noStore();
  return getPublicStoreSummaries();
});

// Reuse the catalogue already fetched by the list without waiting for live status.
export const getStoreInfoById = cache(async (storeId: string) => {
  noStore();
  if (process.env.NODE_ENV !== "production" && process.env.KANMAE_USE_SUPABASE !== "true") {
    return demoStores.find(store => store.id === storeId);
  }
  if (!hasSupabaseEnvironment()) {
    if (process.env.NODE_ENV === "production") throw new Error("Supabase environment variables are not configured.");
    return demoStores.find(store => store.id === storeId);
  }
  const rows = await getPublicStoreDetails();
  // Exact database IDs take precedence over artwork aliases.
  const row = rows.find(row => row.id === storeId) ?? rows.find(row => getAssetKey(row.name) === storeId);
  return row ? mapStoreRow(row) : undefined;
});

export const getStoreLiveStatus = cache(async (storeId: string) => {
  noStore();
  if (process.env.NODE_ENV !== "production" && process.env.KANMAE_USE_SUPABASE !== "true") {
    const store = demoStores.find(store => store.id === storeId);
    if (!store) return undefined;
    return { status: store.status, waitTime: store.waitTime, lastUpdatedAt: store.lastUpdatedAt };
  }
  if (!hasSupabaseEnvironment()) throw new Error("Supabase environment variables are not configured.");
  const { data, error } = await createSupabasePublicClient()
    .from("current_store_status")
    .select("store_id, display_status, wait_time, source, updated_at, owner_wait_time_lock_until")
    .eq("store_id", storeId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load store status: ${error.message}`);
  if (!data) return undefined;
  const expired = isExpiredReportStatus(data);
  return {
    status: expired ? "available" as const : normalizeDisplayStatus(data.display_status),
    waitTime: expired ? "no_wait" as const : normalizeWaitTime(data.wait_time),
    lastUpdatedAt: data.updated_at,
    ownerWaitTimeLockUntil: getActiveOwnerWaitTimeLockUntil(data)
  };
});

export const getStoreById = cache(async (storeId: string) => {
  const store = await getStoreInfoById(storeId);
  if (!store) return undefined;
  const status = await getStoreLiveStatus(store.id);
  return status ? { ...store, ...status, lastUpdatedAt: status.lastUpdatedAt ?? store.lastUpdatedAt } : store;
});

