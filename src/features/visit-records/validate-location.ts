export type Coordinates = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_METERS = 6371000;

export function distanceInMeters(a: Coordinates, b: Coordinates) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function validateVisitLocation(userLocation: Coordinates, storeLocation: Coordinates, radiusMeters = 100) {
  const distance = distanceInMeters(userLocation, storeLocation);

  return {
    isValid: distance <= radiusMeters,
    distance
  };
}
