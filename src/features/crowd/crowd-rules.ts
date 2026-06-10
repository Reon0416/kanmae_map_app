import { DISPLAY_STATUS, STORE_STATUS } from "@/constants/crowd-status";
import { WAIT_TIME_BUCKET, WAIT_TIME_SCORE } from "@/constants/wait-time-options";
import type { DisplayStatus, StoreStatus, WaitTimeBucket } from "@/features/stores/store-types";

export const RECENT_REPORT_WINDOW_MINUTES = 15;
export const FRESH_STORE_UPDATE_MINUTES = 15;
export const STALE_STORE_UPDATE_MINUTES = 30;

export function minutesBetween(from: Date, to: Date) {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
}

export function displayStatusFromStoreStatus(status?: StoreStatus): DisplayStatus {
  if (status === STORE_STATUS.AVAILABLE) return DISPLAY_STATUS.AVAILABLE;
  if (status === STORE_STATUS.LIMITED) return DISPLAY_STATUS.LIMITED;
  if (status === STORE_STATUS.FULL) return DISPLAY_STATUS.FULL;
  return DISPLAY_STATUS.UNKNOWN;
}

export function waitTimeFromReports(reports: { waitTime: WaitTimeBucket }[]): WaitTimeBucket {
  if (reports.length === 0) return WAIT_TIME_BUCKET.NO_WAIT;

  const sortedScores = reports.map((report) => WAIT_TIME_SCORE[report.waitTime]).sort((a, b) => a - b);
  const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
  const option = Object.entries(WAIT_TIME_SCORE).find(([, score]) => score === medianScore)?.[0];

  return (option ?? WAIT_TIME_BUCKET.NO_WAIT) as WaitTimeBucket;
}

export function displayStatusFromWaitTime(waitTime: WaitTimeBucket): DisplayStatus {
  if (waitTime === WAIT_TIME_BUCKET.NO_WAIT || waitTime === WAIT_TIME_BUCKET.WITHIN_5) {
    return DISPLAY_STATUS.AVAILABLE;
  }

  if (waitTime === WAIT_TIME_BUCKET.BETWEEN_5_10) {
    return DISPLAY_STATUS.LIMITED;
  }

  if (waitTime === WAIT_TIME_BUCKET.BETWEEN_10_20) {
    return DISPLAY_STATUS.SLIGHTLY_CROWDED;
  }

  return DISPLAY_STATUS.FULL;
}

export function weakenStaleStoreStatus(status: DisplayStatus, ageMinutes: number): DisplayStatus {
  if (ageMinutes < FRESH_STORE_UPDATE_MINUTES) return status;

  if (ageMinutes >= STALE_STORE_UPDATE_MINUTES) {
    if (status === DISPLAY_STATUS.AVAILABLE) return DISPLAY_STATUS.STALE;
    if (status === DISPLAY_STATUS.FULL) return DISPLAY_STATUS.SLIGHTLY_CROWDED;
  }

  if (status === DISPLAY_STATUS.AVAILABLE) return DISPLAY_STATUS.AVAILABLE;
  if (status === DISPLAY_STATUS.FULL) return DISPLAY_STATUS.SLIGHTLY_CROWDED;

  return status;
}

export function combineStatuses(storeStatus: DisplayStatus, reportStatus: DisplayStatus, reportCount: number) {
  if (reportCount >= 3 && reportStatus === DISPLAY_STATUS.FULL) return DISPLAY_STATUS.FULL;
  if (reportCount >= 2 && reportStatus === DISPLAY_STATUS.SLIGHTLY_CROWDED) return DISPLAY_STATUS.SLIGHTLY_CROWDED;
  if (reportCount >= 2 && reportStatus === DISPLAY_STATUS.LIMITED && storeStatus === DISPLAY_STATUS.AVAILABLE) {
    return DISPLAY_STATUS.LIMITED;
  }

  return storeStatus;
}
