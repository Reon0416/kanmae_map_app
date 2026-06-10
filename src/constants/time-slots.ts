export const TIME_SLOT = {
  LUNCH: "lunch",
  DINNER: "dinner",
  OTHER: "other"
} as const;

export const TIME_SLOT_RULES = {
  lunch: {
    start: "10:30",
    end: "15:00"
  },
  dinner: {
    start: "17:00",
    end: "21:00"
  }
} as const;
