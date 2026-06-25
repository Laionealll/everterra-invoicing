"use client"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Languages } from "lucide-react"

// Botón para alternar el idioma de la interfaz entre español e inglés.
// Muestra el código del idioma al que cambiarás (no el actual).
export function LanguageToggle({
  className,
  variant = "ghost",
}: {
  className?: string
  variant?: "ghost" | "outline"
}) {
  const { locale, setLocale, t } = useI18n()
  const next = locale === "es" ? "en" : "es"

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={() => setLocale(next)}
      aria-label={t("language.label")}
      title={t("language.label")}
      className={cn("gap-2", className)}
    >
      <Languages className="size-4" />
      <span className="font-medium">{next.toUpperCase()}</span>
    </Button>
  )
}
