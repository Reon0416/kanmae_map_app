import { DISPLAY_STATUS } from "@/constants/crowd-status";
import { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";
import type { CrowdInput, CurrentStatus } from "@/features/crowd/crowd-types";
import {
  combineStatuses,
  displayStatusFromStoreStatus,
  displayStatusFromWaitTime,
  minutesBetween,
  RECENT_REPORT_WINDOW_MINUTES,
  waitTimeFromReports,
  weakenStaleStoreStatus
} from "@/features/crowd/crowd-rules";

export function calculateCurrentStatus(input: CrowdInput): CurrentStatus {
  const now = input.now ?? new Date();
  const recentReports = input.reports.filter((report) => {
    return minutesBetween(new Date(report.visitedAt), now) <= RECENT_REPORT_WINDOW_MINUTES;
  });

  const reportWaitTime = waitTimeFromReports(recentReports);
  const reportStatus = displayStatusFromWaitTime(reportWaitTime);

  if (!input.ownerStatus || !input.ownerUpdatedAt) {
    if (recentReports.length === 0) {
      return {
        displayStatus: DISPLAY_STATUS.UNKNOWN,
        waitTime: WAIT_TIME_BUCKET.NO_WAIT,
        source: "unknown"
      };
    }

    return {
      displayStatus: reportStatus,
      waitTime: reportWaitTime,
      source: "reports",
      lastUpdatedAt: recentReports[0]?.visitedAt
    };
  }

  const ownerUpdatedAt = new Date(input.ownerUpdatedAt);
  const ownerAgeMinutes = minutesBetween(ownerUpdatedAt, now);
  const storeDisplayStatus = weakenStaleStoreStatus(displayStatusFromStoreStatus(input.ownerStatus), ownerAgeMinutes);

  if (recentReports.length === 0) {
    return {
      displayStatus: storeDisplayStatus,
      waitTime: WAIT_TIME_BUCKET.NO_WAIT,
      source: "store",
      lastUpdatedAt: input.ownerUpdatedAt
    };
  }

  return {
    displayStatus: combineStatuses(storeDisplayStatus, reportStatus, recentReports.length),
    waitTime: reportWaitTime,
    source: "combined",
    lastUpdatedAt: [input.ownerUpdatedAt, ...recentReports.map((report) => report.visitedAt)].sort().at(-1)
  };
}
