export const STAMP_IMAGE_BY_STORE: Partial<Record<string, string>> = {
  butafuku: "/stamps/butafuku.png",
  kenpei: "/stamps/kenpei.png",
  kirinji: "/stamps/kirinji.png",
  kirameki: "/stamps/kirameki.png",
  kokoro: "/stamps/kokoro.png",
  musou: "/stamps/musou.png",
  semi: "/stamps/semi.png",
  suzume: "/stamps/suzume.png",
  toriton: "/stamps/toriton.png"
};

const STAMP_IMAGE_MATCHERS: { assetKey: keyof typeof STAMP_IMAGE_BY_STORE; includes: string[] }[] = [
  { assetKey: "toriton", includes: ["とりとん"] },
  { assetKey: "suzume", includes: ["雀"] },
  { assetKey: "kirinji", includes: ["きりん寺"] },
  { assetKey: "butafuku", includes: ["豚福"] },
  { assetKey: "kenpei", includes: ["憲兵"] },
  { assetKey: "kirameki", includes: ["キラメキ"] },
  { assetKey: "semi", includes: ["蝉"] },
  { assetKey: "kokoro", includes: ["こころ"] },
  { assetKey: "musou", includes: ["武双", "むそう"] }
];

export function getStampImage(storeId: string, storeName?: string, assetKey?: string) {
  if (assetKey && STAMP_IMAGE_BY_STORE[assetKey]) {
    return STAMP_IMAGE_BY_STORE[assetKey];
  }

  if (STAMP_IMAGE_BY_STORE[storeId]) {
    return STAMP_IMAGE_BY_STORE[storeId];
  }

  const matchedAssetKey = storeName
    ? STAMP_IMAGE_MATCHERS.find((matcher) => matcher.includes.some((item) => storeName.includes(item)))?.assetKey
    : undefined;

  return matchedAssetKey ? STAMP_IMAGE_BY_STORE[matchedAssetKey] : undefined;
}
