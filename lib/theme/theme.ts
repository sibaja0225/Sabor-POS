export type Theme = "light" | "dark";

export const THEME_COOKIE = "sabor_theme";
export const DEFAULT_THEME: Theme = "light";

export function normalizeTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}
