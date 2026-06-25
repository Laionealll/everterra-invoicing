"use client"

import { createContext, useCallback, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { translate } from "@/lib/i18n/translate"

type I18nContextValue = {
  locale: Locale
  t: (key: string, vars?: Record<string, string | number>) => string
  setLocale: (next: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale
  dict: Dictionary
  children: ReactNode
}) {
  const router = useRouter()

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(dict as unknown as Record<string, unknown>, key, vars),
    [dict],
  )

  const setLocale = useCallback(
    (next: Locale) => {
      // Cookie de un año; la leen tanto el cliente como los Server Components.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
      // Refresca para que los Server Components se vuelvan a renderizar en el nuevo idioma.
      router.refresh()
    },
    [router],
  )

  return <I18nContext.Provider value={{ locale, t, setLocale }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider>")
  }
  return ctx
}
