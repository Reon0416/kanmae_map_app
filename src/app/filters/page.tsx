import { Suspense } from "react";
import { MapFilterForm } from "@/components/map/MapFilterForm";
import { getStores } from "@/features/stores/store-queries";

export default async function FiltersPage() {
  const stores = await getStores();

  return (
    <Suspense fallback={null}>
      <MapFilterForm stores={stores} />
    </Suspense>
  );
}
