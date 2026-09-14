"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VisitLocation = {
  lat: number;
  lng: number;
};

type VisitLocationStatus = "idle" | "requesting" | "ready" | "unavailable" | "denied" | "failed";

function getLocationMessage(status: VisitLocationStatus) {
  if (status === "requesting") return "位置情報を取得中です";
  if (status === "ready") return "位置情報を取得しました";
  if (status === "unavailable") return "このブラウザでは位置情報を取得できません";
  if (status === "denied") return "位置情報の許可が必要です";
  if (status === "failed") return "位置情報を取得できませんでした";
  return "位置情報を取得してください";
}

export function useVisitLocation(active = true) {
  const [location, setLocation] = useState<VisitLocation | null>(null);
  const [status, setStatus] = useState<VisitLocationStatus>("idle");
  const requestedRef = useRef(false);

  const requestLocation = useCallback(() => {
    if (!active) return;

    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStatus("ready");
      },
      (error) => {
        setLocation(null);
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "failed");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 8_000
      }
    );
  }, [active]);

  useEffect(() => {
    if (!active) {
      requestedRef.current = false;
      setLocation(null);
      setStatus("idle");
      return;
    }

    if (requestedRef.current) return;
    requestedRef.current = true;
    requestLocation();
  }, [active, requestLocation]);

  return {
    canSaveWithLocation: Boolean(location),
    location,
    locationMessage: getLocationMessage(status),
    requestLocation,
    status
  };
}
