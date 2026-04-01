"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getFavoriteSlugsServerSnapshot,
  getThemeServerSnapshot,
  getThemeSnapshot,
  readFavoriteSlugs,
  subscribeToFavoriteSlugs,
  subscribeToTheme,
  type ThemeMode,
  writeFavoriteSlugs,
  writeTheme,
} from "@/lib/browser-storage";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

type FavoritesContextValue = {
  favorites: string[];
  favoriteCount: number;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = (nextTheme: ThemeMode) => {
    writeTheme(nextTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ setTheme, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function FavoritesProvider({
  children,
  viewerId,
}: {
  children: ReactNode;
  viewerId: string | null;
}) {
  const favorites = useSyncExternalStore(
    (callback) => subscribeToFavoriteSlugs(callback, viewerId),
    () => readFavoriteSlugs(viewerId),
    getFavoriteSlugsServerSnapshot,
  );

  const toggleFavorite = (slug: string) => {
    const nextFavorites = favorites.includes(slug)
      ? favorites.filter((value) => value !== slug)
      : [...favorites, slug];

    writeFavoriteSlugs(nextFavorites, viewerId);
  };

  const value: FavoritesContextValue = {
    favoriteCount: favorites.length,
    favorites,
    isFavorite: (slug) => favorites.includes(slug),
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function AppProviders({
  children,
  viewerId,
}: {
  children: ReactNode;
  viewerId: string | null;
}) {
  return (
    <ThemeProvider>
      <FavoritesProvider key={viewerId ?? "guest"} viewerId={viewerId}>
        {children}
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within AppProviders.");
  }

  return context;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within AppProviders.");
  }

  return context;
}
