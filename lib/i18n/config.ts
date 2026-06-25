// Configuración de internacionalización (i18n).
// La app soporta español e inglés. La factura (vista y PDF) SIEMPRE va en inglés;
// esto solo controla el idioma de la interfaz.

export const LOCALES = ["es", "en"] as const
export type Locale = (typeof LOCALES)[number]

// Idioma por defecto al abrir la app por primera vez (sin cookie todavía).
export const DEFAULT_LOCALE: Locale = "es"

// Nombre de la cookie donde se guarda la preferencia de idioma.
export const LOCALE_COOKIE = "everterra_locale"

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "es" || value === "en"
}
