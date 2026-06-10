export function getAnonymousUserId() {
  if (typeof window === "undefined") return undefined;

  const storageKey = "kanmae_anonymous_user_id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(storageKey, id);
  return id;
}
