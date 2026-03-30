"use client";

import type { Property } from "@/types/property";

export const favoritesStorageKeyPrefix = "gmt-favorite-properties";
export const themeStorageKey = "gmt-theme-preference";
export const communityPropertiesStorageKey = "gmt-community-properties";
export const favoritesEventPrefix = "gmt-favorites-updated";
export const themeEvent = "gmt-theme-updated";
export const communityPropertiesEvent = "gmt-community-properties-updated";

export type ThemeMode = "light" | "dark";
const emptyFavoriteSlugs: string[] = [];
const emptyCommunityProperties: Property[] = [];
const favoriteSlugsRawCache = new Map<string, string | null | undefined>();
const favoriteSlugsSnapshotCache = new Map<string, string[]>();
let communityPropertiesRawCache: string | null | undefined;
let communityPropertiesSnapshotCache: Property[] = emptyCommunityProperties;

export function getFavoritesStorageKey(userId?: string | null) {
  return `${favoritesStorageKeyPrefix}:${userId ?? "guest"}`;
}

export function getFavoritesEventName(userId?: string | null) {
  return `${favoritesEventPrefix}:${userId ?? "guest"}`;
}

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readFavoriteSlugs(userId?: string | null) {
  if (typeof window === "undefined") {
    return emptyFavoriteSlugs;
  }

  const storageKey = getFavoritesStorageKey(userId);
  const rawValue = window.localStorage.getItem(storageKey);
  const cachedRawValue = favoriteSlugsRawCache.get(storageKey);

  if (rawValue === cachedRawValue) {
    return favoriteSlugsSnapshotCache.get(storageKey) ?? emptyFavoriteSlugs;
  }

  favoriteSlugsRawCache.set(storageKey, rawValue);

  if (!rawValue) {
    favoriteSlugsSnapshotCache.set(storageKey, emptyFavoriteSlugs);
    return favoriteSlugsSnapshotCache.get(storageKey) ?? emptyFavoriteSlugs;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    favoriteSlugsSnapshotCache.set(
      storageKey,
      Array.isArray(parsedValue)
        ? parsedValue.filter((value): value is string => typeof value === "string")
        : emptyFavoriteSlugs,
    );
  } catch {
    favoriteSlugsSnapshotCache.set(storageKey, emptyFavoriteSlugs);
  }

  return favoriteSlugsSnapshotCache.get(storageKey) ?? emptyFavoriteSlugs;
}

export function getFavoriteSlugsServerSnapshot() {
  return emptyFavoriteSlugs;
}

export function writeFavoriteSlugs(favorites: string[], userId?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getFavoritesStorageKey(userId);
  const eventName = getFavoritesEventName(userId);
  const serializedValue = JSON.stringify(favorites);
  favoriteSlugsSnapshotCache.set(storageKey, favorites);
  favoriteSlugsRawCache.set(storageKey, serializedValue);
  window.localStorage.setItem(storageKey, serializedValue);
  window.dispatchEvent(new Event(eventName));
}

export function subscribeToFavoriteSlugs(
  callback: () => void,
  userId?: string | null,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const storageKey = getFavoritesStorageKey(userId);
  const eventName = getFavoritesEventName(userId);
  const handleFavorites = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== storageKey) {
      return;
    }

    callback();
  };

  window.addEventListener(eventName, handleFavorites);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(eventName, handleFavorites);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = readJSON<ThemeMode | null>(themeStorageKey, null);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getThemeServerSnapshot(): ThemeMode {
  return "light";
}

export function writeTheme(theme: ThemeMode) {
  if (typeof window === "undefined") {
    return;
  }

  writeJSON(themeStorageKey, theme);
  window.dispatchEvent(new Event(themeEvent));
}

export function subscribeToTheme(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleTheme = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== themeStorageKey) {
      return;
    }

    callback();
  };
  const handleMediaChange = () => callback();

  window.addEventListener(themeEvent, handleTheme);
  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", handleMediaChange);

  return () => {
    window.removeEventListener(themeEvent, handleTheme);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", handleMediaChange);
  };
}

export function readCommunityProperties() {
  if (typeof window === "undefined") {
    return emptyCommunityProperties;
  }

  const rawValue = window.localStorage.getItem(communityPropertiesStorageKey);

  if (rawValue === communityPropertiesRawCache) {
    return communityPropertiesSnapshotCache;
  }

  communityPropertiesRawCache = rawValue;

  if (!rawValue) {
    communityPropertiesSnapshotCache = emptyCommunityProperties;
    return communityPropertiesSnapshotCache;
  }

  try {
    communityPropertiesSnapshotCache = JSON.parse(rawValue) as Property[];
  } catch {
    communityPropertiesSnapshotCache = emptyCommunityProperties;
  }

  return communityPropertiesSnapshotCache;
}

export function getCommunityPropertiesServerSnapshot() {
  return emptyCommunityProperties;
}

export function writeCommunityProperties(properties: Property[]) {
  if (typeof window === "undefined") {
    return;
  }

  communityPropertiesSnapshotCache = properties;
  communityPropertiesRawCache = JSON.stringify(properties);
  window.localStorage.setItem(
    communityPropertiesStorageKey,
    communityPropertiesRawCache,
  );
  window.dispatchEvent(new Event(communityPropertiesEvent));
}

export function subscribeToCommunityProperties(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== communityPropertiesStorageKey) {
      return;
    }

    callback();
  };

  window.addEventListener(communityPropertiesEvent, handler);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(communityPropertiesEvent, handler);
    window.removeEventListener("storage", handleStorage);
  };
}
