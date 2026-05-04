import { ChevronDown, ChevronRight } from "lucide-react";
import { ReactNode, useState } from "react";

interface SectionProps {
  title: string;
  icon?: ReactNode;
  /** Pinned indicator on the right of the header (count, dot, etc.). */
  meta?: ReactNode;
  /** Color accent shown as a thin left bar when expanded. Tailwind class. */
  accentClass?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Collapsible vertical section. The accordion lives in the request panel
 * so all parts of a request (params, headers, body) are visible at once,
 * not hidden behind tab switches.
 */
export function Section({
  title,
  icon,
  meta,
  accentClass = "bg-fuchsia-500/70",
  defaultOpen = true,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`overflow-hidden rounded-lg border border-stone-800/80 bg-stone-900/40`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-stone-900/70"
      >
        {open && (
          <span
            className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r ${accentClass}`}
          />
        )}
        <span className="text-stone-400">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {icon && <span className="text-stone-400">{icon}</span>}
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-200">
          {title}
        </span>
        <span className="ml-auto text-xs text-stone-500">{meta}</span>
      </button>
      {open && <div className="border-t border-stone-800/60 p-3">{children}</div>}
    </section>
  );
}
