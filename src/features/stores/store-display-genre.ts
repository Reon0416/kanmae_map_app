import type { StoreSummary } from "@/features/stores/store-types";

const storeGenres: Partial<Record<string, string>> = {
  butafuku: "二郎系ラーメン",
  kirameki: "ラーメン、台湾まぜそば",
  toriton: "鶏豚骨ラーメン",
  musou: "家系ラーメン",
  kokoro: "台湾まぜそば",
  semi: "魚介豚骨ラーメン",
  yoyoyo: "ラム白湯ラーメン"
};

export function getStoreDisplayGenre(store: Pick<StoreSummary, "id" | "assetKey" | "genre">) {
  return storeGenres[store.assetKey ?? store.id] ?? store.genre;
}
