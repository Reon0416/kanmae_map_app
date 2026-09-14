export const STAMPS_PER_CARD = 12;
export const STAMP_EVENT_FETCH_LIMIT = STAMPS_PER_CARD;

export function getCurrentStampCardNumber(totalStampCount: number) {
  return Math.max(1, Math.ceil(totalStampCount / STAMPS_PER_CARD));
}
