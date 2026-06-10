import { Suspense } from "react";
import { MapFilterForm } from "@/components/map/MapFilterForm";
import { getStores } from "@/features/stores/store-queries";

export default function FiltersPage() {
  return (
    <Suspense fallback={null}>
      <MapFilterForm stores={getStores()} />
    </Suspense>
  );
}
