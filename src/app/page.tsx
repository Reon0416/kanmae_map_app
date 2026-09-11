import { Suspense } from "react";
import { MapHome } from "@/components/map/MapHome";
import { getStores } from "@/features/stores/store-queries";

export default async function HomePage() {
  const stores = await getStores();

  return (
    <Suspense fallback={null}>
      <MapHome stores={stores} />
    </Suspense>
  );
}
