import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(isoDate?: string) {
  if (!isoDate) return "情報なし";

  const minutes = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;

  const hours = Math.round(minutes / 60);
  return `${hours}時間前`;
}

export function priceBandLabel(priceBand: string) {
  const labels: Record<string, string> = {
    under_800: "800円未満",
    "800_1200": "800-1,200円",
    "1200_1800": "1,200-1,800円",
    over_1800: "1,800円以上"
  };

  return labels[priceBand] ?? priceBand;
}
