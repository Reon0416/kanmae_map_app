export const STAMP_IMAGE_BY_STORE: Partial<Record<string, string>> = {
  butafuku: "/stamps/butafuku.png",
  kenpei: "/stamps/kenpei.png",
  kirinji: "/stamps/kirinji.png",
  musou: "/stamps/musou.png",
  semi: "/stamps/semi.png",
  suzume: "/stamps/suzume.png",
  toriton: "/stamps/toriton.png"
};

export function getStampImage(storeId: string) {
  return STAMP_IMAGE_BY_STORE[storeId];
}
