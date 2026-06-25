// Función de traducción pura (sin React ni APIs de servidor), reutilizada tanto
// por el provider de cliente como por el helper de servidor.
//
// `t("dashboard.welcome", { name: "Ana" })` busca la clave por ruta de puntos en
// el diccionario y sustituye los marcadores {name}. Si la clave no existe,
// devuelve la propia clave para que el texto faltante sea visible.

export function translate(
  dict: Record<string, unknown>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dict)

  let str = typeof value === "string" ? value : key

  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${name}\\}`, "g"), String(replacement))
    }
  }

  return str
}
