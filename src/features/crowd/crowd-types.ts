import type { DisplayStatus, StoreStatus, WaitTimeBucket } from "@/features/stores/store-types";

export type CrowdInput = {
  ownerStatus?: StoreStatus;
  ownerUpdatedAt?: string;
  reports: {
    waitTime: WaitTimeBucket;
    visitedAt: string;
  }[];
  now?: Date;
};

export type CurrentStatus = {
  displayStatus: DisplayStatus;
  waitTime: WaitTimeBucket;
  source: "store" | "reports" | "combined" | "unknown";
  lastUpdatedAt?: string;
};
