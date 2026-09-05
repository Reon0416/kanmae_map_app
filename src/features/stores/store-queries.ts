import type { Store } from "@/features/stores/store-types";
import { latLngToMapPosition } from "@/lib/map/map-config";

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
    name: "とりとん",
    genre: "居酒屋",
    lat: 34.773298685190646,
    lng: 135.50875504614464,
    status: "available",
    waitTime: "within_5",
    walkMinutes: 4
  }),
  createStore({
    id: "suzume",
    name: "すずめ",
    genre: "つけ麺",
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
    lat: 34.77360601434054,
    lng: 135.5078827963048,
    status: "slightly_crowded",
    waitTime: "between_10_20",
    walkMinutes: 3
  }),
  createStore({
    id: "butafuku",
    name: "豚福",
    genre: "家系ラーメン",
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
    name: "こころ",
    genre: "ラーメン",
    lat: 34.77283513040589,
    lng: 135.50586781314328,
    status: "limited",
    waitTime: "between_5_10",
    walkMinutes: 7
  }),
  createStore({
    id: "musou",
    name: "無双屋",
    genre: "ラーメン",
    lat: 34.7729585105518,
    lng: 135.50586781308675,
    status: "available",
    waitTime: "within_5",
    walkMinutes: 7
  })
];

export function getStores() {
  return demoStores;
}

export function getStoreById(storeId: string) {
  return demoStores.find((store) => store.id === storeId);
}

