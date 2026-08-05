import { cookies } from "next/headers";
import { DEFAULT_THEME, THEME_COOKIE, normalizeTheme, type Theme } from "./theme";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;
  return value ? normalizeTheme(value) : DEFAULT_THEME;
}
