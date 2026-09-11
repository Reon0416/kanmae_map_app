import type { Store } from "@/features/stores/store-types";
import { latLngToMapPosition } from "@/lib/map/map-config";
import { createSupabaseServerClient, hasSupabaseEnvironment } from "@/lib/supabase/server";

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
  display_status?: string | null;
  wait_time?: string | null;
  updated_at?: string | null;
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
    status: normalizeDisplayStatus(currentStatus?.display_status),
    waitTime: normalizeWaitTime(currentStatus?.wait_time),
    lastUpdatedAt: currentStatus?.updated_at ?? row.updated_at ?? new Date().toISOString(),
    mapPosition: latLngToMapPosition({ lat, lng })
  };
}

export async function getStores() {
  if (!hasSupabaseEnvironment()) {
    return demoStores;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stores")
      .select(
        "id, name, description, genre, price_band, address, lat, lng, walk_minutes, hours, closed, accepts_takeout, has_student_discount, updated_at, current_store_status(display_status, wait_time, updated_at)"
      )
      .order("created_at", { ascending: true });

    if (error || !data) {
      return demoStores;
    }

    return (data as StoreRow[]).map(mapStoreRow);
  } catch {
    return demoStores;
  }
}

export async function getStoreById(storeId: string) {
  const stores = await getStores();
  return stores.find((store) => store.id === storeId || store.assetKey === storeId);
}

