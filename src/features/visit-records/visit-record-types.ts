import type { WaitTimeBucket } from "@/features/stores/store-types";

export type VisitRecord = {
  id: string;
  storeId: string;
  anonymousUserId: string;
  waitTime: WaitTimeBucket;
  visitedAt: string;
};

export type CrowdReport = Pick<VisitRecord, "storeId" | "waitTime" | "visitedAt">;
