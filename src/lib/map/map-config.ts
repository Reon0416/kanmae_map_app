export const KANDAI_MAE_CENTER = {
  lat: 34.7734,
  lng: 135.5074
};

export const DEFAULT_VISIT_RADIUS_METERS = 100;

export const KANMAE_MAP_IMAGE = "/maps/サンプル完成図.png";

export const KANMAE_MAP_CORNERS = {
  topLeft: { lat: 34.772735, lng: 135.505862 },
  topRight: { lat: 34.774043, lng: 135.505792 },
  bottomRight: { lat: 34.773958, lng: 135.509021 },
  bottomLeft: { lat: 34.772797, lng: 135.509036 }
};

type LatLng = {
  lat: number;
  lng: number;
};

type MapPosition = {
  x: number;
  y: number;
};

function interpolateCorners(u: number, v: number) {
  const { topLeft, topRight, bottomRight, bottomLeft } = KANMAE_MAP_CORNERS;

  return {
    lat:
      (1 - u) * (1 - v) * topLeft.lat +
      u * (1 - v) * topRight.lat +
      u * v * bottomRight.lat +
      (1 - u) * v * bottomLeft.lat,
    lng:
      (1 - u) * (1 - v) * topLeft.lng +
      u * (1 - v) * topRight.lng +
      u * v * bottomRight.lng +
      (1 - u) * v * bottomLeft.lng
  };
}

export function latLngToMapPosition(point: LatLng): MapPosition {
  let u = 0.5;
  let v = 0.5;

  for (let i = 0; i < 12; i += 1) {
    const current = interpolateCorners(u, v);
    const duPoint = interpolateCorners(u + 0.0001, v);
    const dvPoint = interpolateCorners(u, v + 0.0001);
    const fLat = current.lat - point.lat;
    const fLng = current.lng - point.lng;
    const a = (duPoint.lat - current.lat) / 0.0001;
    const b = (dvPoint.lat - current.lat) / 0.0001;
    const c = (duPoint.lng - current.lng) / 0.0001;
    const d = (dvPoint.lng - current.lng) / 0.0001;
    const det = a * d - b * c;

    if (Math.abs(det) < 1e-12) break;

    const deltaU = (d * fLat - b * fLng) / det;
    const deltaV = (-c * fLat + a * fLng) / det;

    u = Math.min(1, Math.max(0, u - deltaU));
    v = Math.min(1, Math.max(0, v - deltaV));
  }

  return {
    x: Number((u * 100).toFixed(2)),
    y: Number((v * 100).toFixed(2))
  };
}
