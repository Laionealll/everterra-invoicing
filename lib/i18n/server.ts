// Helpers de i18n para Server Components (páginas, layouts y server actions).
// Leen el idioma desde la cookie y devuelven la función de traducción.

import { cookies } from "next/headers"
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config"
import { getDictionary } from "./dictionaries"
import { translate } from "./translate"

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export async function getDict() {
  return getDictionary(await getLocale())
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string

export async function getT(): Promise<TFunction> {
  const dict = await getDict()
  return (key, vars) => translate(dict as unknown as Record<string, unknown>, key, vars)
}
