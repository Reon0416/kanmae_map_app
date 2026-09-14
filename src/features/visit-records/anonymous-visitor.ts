"use client";

const ANONYMOUS_VISITOR_STORAGE_KEY = "kanmae_anonymous_visitor_id";

export function getOrCreateAnonymousVisitorId() {
  const existingId = window.localStorage.getItem(ANONYMOUS_VISITOR_STORAGE_KEY);
  if (existingId) return existingId;

  const visitorId = window.crypto.randomUUID();
  window.localStorage.setItem(ANONYMOUS_VISITOR_STORAGE_KEY, visitorId);
  return visitorId;
}
