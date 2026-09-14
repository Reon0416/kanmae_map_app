import { getImageProps } from "next/image";
import type { StoreSummary } from "@/features/stores/store-types";
import { getStampImage } from "@/features/visit-records/stamp-images";

export const loadStampReward = () => import("@/components/visit-records/StampRewardOverlay").then(module => module.StampRewardOverlay);

export function prepareStampReward(store: Pick<StoreSummary, "id" | "name" | "assetKey">) {
  void loadStampReward().catch(() => {});
  const src = getStampImage(store.id, store.name, store.assetKey);
  if (!src) return;
  const { props } = getImageProps({ src, alt: "", width: 132, height: 132, sizes: "128px" });
  const image = new window.Image();
  image.sizes = props.sizes ?? "128px";
  image.srcset = props.srcSet ?? "";
  image.src = props.src;
}
