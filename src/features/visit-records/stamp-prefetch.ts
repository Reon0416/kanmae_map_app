"use client";

import { getStampImage } from "@/features/visit-records/stamp-images";
import { getOrCreateAnonymousVisitorId } from "@/features/visit-records/anonymous-visitor";

type StampPrefetchResponse = {
  stores?: {
    storeId?: string;
    storeName?: string;
    stampCount?: number;
  }[];
  cardStamps?: {
    storeId?: string;
    storeName?: string;
  }[];
};

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

let stampPrefetchPromise: Promise<void> | null = null;
const preloadedUrls = new Set<string>();
const preloadedImages: HTMLImageElement[] = [];

function shouldSkipImagePrefetch() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

function getOptimizedImageUrl(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function preloadImage(src: string) {
  const widths = [96, 256];

  for (const width of widths) {
    const url = getOptimizedImageUrl(src, width);
    if (preloadedUrls.has(url)) continue;

    preloadedUrls.add(url);
    await new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = url;
      preloadedImages.push(image);
    });
  }
}

function collectStampImageSources(data: StampPrefetchResponse) {
  const sources = new Set<string>();

  for (const stamp of data.cardStamps ?? []) {
    if (!stamp.storeId) continue;
    const image = getStampImage(stamp.storeId, stamp.storeName);
    if (image) sources.add(image);
  }

  for (const store of data.stores ?? []) {
    if (!store.storeId || !store.stampCount) continue;
    const image = getStampImage(store.storeId, store.storeName);
    if (image) sources.add(image);
  }

  return [...sources];
}

export function prefetchMyPageStamps() {
  if (typeof window === "undefined") return;
  if (stampPrefetchPromise) return;

  stampPrefetchPromise = (async () => {
    if (shouldSkipImagePrefetch()) return;

    const visitorId = getOrCreateAnonymousVisitorId();
    const response = await fetch(`/api/stamps?visitorId=${encodeURIComponent(visitorId)}`, {
      credentials: "same-origin",
      cache: "no-store"
    });

    if (!response.ok) return;

    const data = await response.json() as StampPrefetchResponse;
    const imageSources = collectStampImageSources(data);

    for (const imageSource of imageSources) {
      await preloadImage(imageSource);
      await wait(180);
    }
  })().catch(() => {
    stampPrefetchPromise = null;
  });
}
