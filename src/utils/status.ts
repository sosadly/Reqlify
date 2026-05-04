/**
 * Map HTTP status to a Tailwind palette. Returns ring + text colors so we
 * can paint both the colored circle and the label consistently.
 */
export function statusTheme(status: number): { ring: string; text: string; label: string } {
  if (status === 0) return { ring: "ring-stone-700", text: "text-stone-400", label: "ERR" };
  if (status < 300) return { ring: "ring-emerald-500/60", text: "text-emerald-300", label: "OK" };
  if (status < 400) return { ring: "ring-sky-500/60", text: "text-sky-300", label: "REDIR" };
  if (status < 500) return { ring: "ring-amber-500/60", text: "text-amber-300", label: "CLIENT" };
  return { ring: "ring-rose-500/60", text: "text-rose-300", label: "SERVER" };
}
