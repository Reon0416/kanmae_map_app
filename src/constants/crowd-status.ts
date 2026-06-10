export const STORE_STATUS = {
  AVAILABLE: "available",
  LIMITED: "limited",
  FULL: "full"
} as const;

export const DISPLAY_STATUS = {
  AVAILABLE: "available",
  LIMITED: "limited",
  SLIGHTLY_CROWDED: "slightly_crowded",
  FULL: "full",
  STALE: "stale",
  UNKNOWN: "unknown"
} as const;

export const STATUS_LABELS = {
  available: "空席あり",
  limited: "残りわずか",
  slightly_crowded: "やや混雑",
  full: "満席",
  stale: "情報が古い可能性あり",
  unknown: "情報なし"
} as const;
