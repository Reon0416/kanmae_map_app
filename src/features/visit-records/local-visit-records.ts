import type { WaitTimeBucket } from "@/features/stores/store-types";

export const LOCAL_VISIT_RECORDS_KEY = "kanmae:visit-records";

export type LocalVisitRecord = {
  id: string;
  storeId: string;
  storeName: string;
  waitTime: WaitTimeBucket;
  visitedAt: string;
};

export function readLocalVisitRecords(): LocalVisitRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_VISIT_RECORDS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((record): record is LocalVisitRecord => {
      return (
        typeof record?.id === "string" &&
        typeof record.storeId === "string" &&
        typeof record.storeName === "string" &&
        typeof record.waitTime === "string" &&
        typeof record.visitedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

export function saveLocalVisitRecord(record: Omit<LocalVisitRecord, "id" | "visitedAt">) {
  const nextRecord: LocalVisitRecord = {
    ...record,
    id: crypto.randomUUID(),
    visitedAt: new Date().toISOString()
  };

  const records = [nextRecord, ...readLocalVisitRecords()].slice(0, 120);
  window.localStorage.setItem(LOCAL_VISIT_RECORDS_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("kanmae:visit-record-created", { detail: nextRecord }));
  return nextRecord;
}
