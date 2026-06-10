export const WAIT_TIME_BUCKET = {
  NO_WAIT: "no_wait",
  WITHIN_5: "within_5",
  BETWEEN_5_10: "between_5_10",
  BETWEEN_10_20: "between_10_20",
  OVER_20: "over_20"
} as const;

export const WAIT_TIME_SCORE = {
  no_wait: 0,
  within_5: 1,
  between_5_10: 2,
  between_10_20: 3,
  over_20: 4
} as const;

export const WAIT_TIME_LABELS = {
  no_wait: "待ちなし",
  within_5: "5分以内",
  between_5_10: "5-10分",
  between_10_20: "10-20分",
  over_20: "20分以上"
} as const;
