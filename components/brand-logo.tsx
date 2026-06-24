"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const SOURCES = {
  full: "/everterra-logo.png",
  mark: "/everterra-mark.png",
} as const

export function BrandLogo({
  variant = "full",
  className,
  imgClassName,
}: {
  variant?: "full" | "mark"
  className?: string
  imgClassName?: string
}) {
  const [errored, setErrored] = useState(false)
  const src = SOURCES[variant]

  if (errored) {
    return (
      <span className={cn("flex items-center gap-2", className)}>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground">
          E
        </span>
        <span className="font-serif text-lg font-semibold tracking-tight leading-none">
          Everterra
        </span>
      </span>
    )
  }

  return (
    <img
      src={src || "/placeholder.svg"}
      alt="Everterra LLC"
      className={cn(
        variant === "mark" ? "h-8 w-auto object-contain" : "h-9 w-auto object-contain",
        className,
        imgClassName,
      )}
      onError={() => setErrored(true)}
    />
  )
}
