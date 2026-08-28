"use client";

export const STAMP_SOUND_CONFIG = {
  // Edit these numbers to tune the stamp sound.
  // Larger ms values make the timing later or longer. volume is 0 to 1.
  src: "/sounds/stamp.m4a",
  startDelayMs: 0,
  volume: 1,
  fadeOutStartMs: 650,
  fadeOutDurationMs: 350,
  stopMs: 1000,
  fadeSteps: 12
};

export function playStampSound() {
  if (typeof window === "undefined") {
    return;
  }

  const {
    src,
    startDelayMs,
    volume,
    fadeOutStartMs,
    fadeOutDurationMs,
    stopMs,
    fadeSteps
  } = STAMP_SOUND_CONFIG;
  const sound = new Audio(src);
  const timers: number[] = [];
  const baseVolume = Math.min(1, Math.max(0, volume));
  const safeStartDelayMs = Math.max(0, startDelayMs);
  const safeFadeOutStartMs = Math.max(0, fadeOutStartMs);
  const safeFadeOutDurationMs = Math.max(0, fadeOutDurationMs);
  const safeStopMs = Math.max(0, stopMs);
  const safeFadeSteps = Math.max(1, fadeSteps);

  const stopSound = () => {
    sound.pause();
    sound.currentTime = 0;
  };

  const fadeOutSound = () => {
    const fadeIntervalMs = safeFadeOutDurationMs / safeFadeSteps;

    for (let step = 1; step <= safeFadeSteps; step += 1) {
      timers.push(window.setTimeout(() => {
        sound.volume = Math.max(0, baseVolume * (1 - step / safeFadeSteps));
      }, fadeIntervalMs * step));
    }
  };

  const makeAudible = () => {
    sound.currentTime = 0;
    sound.volume = baseVolume;
  };

  sound.volume = safeStartDelayMs > 0 ? 0 : baseVolume;
  sound.currentTime = 0;
  sound.play().catch(() => {
    stopSound();
  });

  if (safeStartDelayMs > 0) {
    timers.push(window.setTimeout(makeAudible, safeStartDelayMs));
  }

  timers.push(window.setTimeout(
    fadeOutSound,
    safeStartDelayMs + safeFadeOutStartMs
  ));
  timers.push(window.setTimeout(
    stopSound,
    safeStartDelayMs + safeStopMs
  ));
}
