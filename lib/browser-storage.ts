"use client";

import type { Property } from "@/types/property";

export const favoritesStorageKey = "gmt-favorite-properties";
export const themeStorageKey = "gmt-theme-preference";
export const communityPropertiesStorageKey = "gmt-community-properties";
export const favoritesEvent = "gmt-favorites-updated";
export const themeEvent = "gmt-theme-updated";
export const communityPropertiesEvent = "gmt-community-properties-updated";

export type ThemeMode = "light" | "dark";
const emptyFavoriteSlugs: string[] = [];
const emptyCommunityProperties: Property[] = [];
let favoriteSlugsRawCache: string | null | undefined;
let favoriteSlugsSnapshotCache: string[] = emptyFavoriteSlugs;
let communityPropertiesRawCache: string | null | undefined;
let communityPropertiesSnapshotCache: Property[] = emptyCommunityProperties;

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

export function readFavoriteSlugs() {
  if (typeof window === "undefined") {
    return emptyFavoriteSlugs;
  }

  const rawValue = window.localStorage.getItem(favoritesStorageKey);

  if (rawValue === favoriteSlugsRawCache) {
    return favoriteSlugsSnapshotCache;
  }

  favoriteSlugsRawCache = rawValue;

  if (!rawValue) {
    favoriteSlugsSnapshotCache = emptyFavoriteSlugs;
    return favoriteSlugsSnapshotCache;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    favoriteSlugsSnapshotCache = Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : emptyFavoriteSlugs;
  } catch {
    favoriteSlugsSnapshotCache = emptyFavoriteSlugs;
  }

  return favoriteSlugsSnapshotCache;
}

export function getFavoriteSlugsServerSnapshot() {
  return emptyFavoriteSlugs;
}

export function writeFavoriteSlugs(favorites: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  favoriteSlugsSnapshotCache = favorites;
  favoriteSlugsRawCache = JSON.stringify(favorites);
  window.localStorage.setItem(favoritesStorageKey, favoriteSlugsRawCache);
  window.dispatchEvent(new Event(favoritesEvent));
}

export function subscribeToFavoriteSlugs(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleFavorites = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== favoritesStorageKey) {
      return;
    }

    callback();
  };

  window.addEventListener(favoritesEvent, handleFavorites);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(favoritesEvent, handleFavorites);
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
