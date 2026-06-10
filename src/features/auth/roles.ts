export const USER_ROLE = {
  USER: "user",
  STORE: "store",
  ADMIN: "admin"
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "ユーザー",
  store: "飲食店の店舗様",
  admin: "KANMAE運営者"
};

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  user: "/",
  store: "/store-admin",
  admin: "/admin"
};

export const ROLE_STORAGE_KEY = "kanmae_role";
