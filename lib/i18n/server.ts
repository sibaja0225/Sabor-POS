import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  getDictionary as getDictionaryFor,
  normalizeLocale,
  type Dictionary,
  type Locale,
} from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE);
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return getDictionaryFor(locale);
}
