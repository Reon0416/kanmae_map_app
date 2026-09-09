import type { WaitTimeBucket } from "@/features/stores/store-types";

export type SaveVisitRecordInput = {
  storeId: string;
  waitTime: WaitTimeBucket;
  location?: {
    lat: number;
    lng: number;
  };
};

export type SavedVisitRecord = {
  id: string;
  storeId: string;
  storeName: string;
  waitTime: WaitTimeBucket;
  stampCount: number;
  visitedAt: string;
};

export async function saveVisitRecord(input: SaveVisitRecordInput) {
  const response = await fetch("/api/visit-records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "来店記録を保存できませんでした。");
  }

  window.dispatchEvent(new CustomEvent("kanmae:visit-record-created", { detail: payload }));
  return payload as SavedVisitRecord;
}

export function getCurrentPosition() {
  return new Promise<GeolocationPosition | null>((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 8_000
      }
    );
  });
}
