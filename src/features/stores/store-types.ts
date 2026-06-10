import type { DISPLAY_STATUS, STORE_STATUS } from "@/constants/crowd-status";
import type { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];
export type DisplayStatus = (typeof DISPLAY_STATUS)[keyof typeof DISPLAY_STATUS];
export type WaitTimeBucket = (typeof WAIT_TIME_BUCKET)[keyof typeof WAIT_TIME_BUCKET];

export type PriceBand = "under_800" | "800_1200" | "1200_1800" | "over_1800";

export type Store = {
  id: string;
  name: string;
  description: string;
  genre: string;
  priceBand: PriceBand;
  address: string;
  lat: number;
  lng: number;
  walkMinutes: number;
  hours: string;
  closed: string;
  acceptsTakeout: boolean;
  hasStudentDiscount: boolean;
  status: DisplayStatus;
  waitTime: WaitTimeBucket;
  lastUpdatedAt: string;
  ownerStatus?: StoreStatus;
  mapPosition: {
    x: number;
    y: number;
  };
};

export type StoreStatusUpdate = {
  storeId: string;
  status: StoreStatus;
  updatedAt: string;
};
