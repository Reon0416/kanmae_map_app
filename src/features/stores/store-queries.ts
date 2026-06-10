import type { Store } from "@/features/stores/store-types";

export const demoStores: Store[] = [
  {
    id: "ramen-kandaimae",
    name: "関前ラーメン",
    description: "授業終わりに入りやすい、回転の早いラーメン店。",
    genre: "ラーメン",
    priceBand: "800_1200",
    address: "大阪府吹田市千里山東",
    lat: 34.77041,
    lng: 135.50682,
    walkMinutes: 3,
    hours: "11:00-22:00",
    closed: "不定休",
    acceptsTakeout: false,
    hasStudentDiscount: true,
    status: "available",
    waitTime: "within_5",
    lastUpdatedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    ownerStatus: "available",
    mapPosition: { x: 42, y: 46 }
  },
  {
    id: "curry-seminar",
    name: "セミナーカレー",
    description: "昼休みは混みやすいが、少人数なら入りやすいカレー店。",
    genre: "カレー",
    priceBand: "800_1200",
    address: "大阪府吹田市千里山東",
    lat: 34.7711,
    lng: 135.50724,
    walkMinutes: 5,
    hours: "10:30-21:00",
    closed: "水曜",
    acceptsTakeout: true,
    hasStudentDiscount: false,
    status: "limited",
    waitTime: "between_5_10",
    lastUpdatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    ownerStatus: "limited",
    mapPosition: { x: 57, y: 36 }
  },
  {
    id: "don-campus",
    name: "キャンパス丼",
    description: "ボリューム重視の丼もの。ピークは列が伸びやすい。",
    genre: "定食・丼",
    priceBand: "under_800",
    address: "大阪府吹田市千里山東",
    lat: 34.77005,
    lng: 135.50594,
    walkMinutes: 4,
    hours: "11:00-20:30",
    closed: "日曜",
    acceptsTakeout: true,
    hasStudentDiscount: true,
    status: "slightly_crowded",
    waitTime: "between_10_20",
    lastUpdatedAt: new Date(Date.now() - 18 * 60000).toISOString(),
    ownerStatus: "full",
    mapPosition: { x: 31, y: 60 }
  },
  {
    id: "pasta-north",
    name: "北口パスタ",
    description: "友人同士で使いやすいパスタ店。席数はやや少なめ。",
    genre: "イタリアン",
    priceBand: "1200_1800",
    address: "大阪府吹田市千里山東",
    lat: 34.7716,
    lng: 135.50602,
    walkMinutes: 6,
    hours: "11:30-21:30",
    closed: "月曜",
    acceptsTakeout: false,
    hasStudentDiscount: false,
    status: "full",
    waitTime: "over_20",
    lastUpdatedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    ownerStatus: "full",
    mapPosition: { x: 24, y: 30 }
  },
  {
    id: "cafe-library",
    name: "ライブラリーカフェ",
    description: "軽食と作業に使えるカフェ。昼過ぎは落ち着きやすい。",
    genre: "カフェ",
    priceBand: "800_1200",
    address: "大阪府吹田市千里山東",
    lat: 34.76956,
    lng: 135.50736,
    walkMinutes: 7,
    hours: "09:00-19:00",
    closed: "なし",
    acceptsTakeout: true,
    hasStudentDiscount: true,
    status: "stale",
    waitTime: "no_wait",
    lastUpdatedAt: new Date(Date.now() - 48 * 60000).toISOString(),
    ownerStatus: "available",
    mapPosition: { x: 68, y: 70 }
  }
];

export function getStores() {
  return demoStores;
}

export function getStoreById(storeId: string) {
  return demoStores.find((store) => store.id === storeId);
}
