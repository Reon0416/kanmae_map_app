"use client";

import { useCallback, useEffect, useState } from "react";

export type VisitLocation = {
  lat: number;
  lng: number;
};

export type VisitLocationStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "unavailable"
  | "denied"
  | "imprecise"
  | "position_unavailable"
  | "timeout";

function getLocationMessage(status: VisitLocationStatus) {
  if (status === "requesting") return "位置情報を取得中です";
  if (status === "ready") return "位置情報を取得しました";
  if (status === "unavailable") return "このブラウザでは位置情報を取得できません";
  if (status === "denied") return "このサイトへの位置情報が許可されていません";
  if (status === "imprecise") return "正確な位置情報をオンにしてください";
  if (status === "position_unavailable") return "現在地を取得できませんでした";
  if (status === "timeout") return "位置情報の取得に時間がかかっています";
  return "位置情報を取得してください";
}

export function useVisitLocation(active = true) {
  const [location, setLocation] = useState<VisitLocation | null>(null);
  const [status, setStatus] = useState<VisitLocationStatus>("idle");

  const requestLocation = useCallback(() => {
    if (!active) return;

    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!Number.isFinite(position.coords.accuracy) || position.coords.accuracy > 500) {
          setLocation(null);
          setStatus("imprecise");
          return;
        }

        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStatus("ready");
      },
      (error) => {
        setLocation(null);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
        } else if (error.code === error.TIMEOUT) {
          setStatus("timeout");
        } else {
          setStatus("position_unavailable");
        }
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
      setLocation(null);
      setStatus("idle");
    }
  }, [active]);

  return {
    canSaveWithLocation: Boolean(location),
    location,
    locationMessage: getLocationMessage(status),
    requestLocation,
    status
  };
}
