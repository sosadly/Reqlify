import { ReactNode } from "react";

interface SidePaneProps {
  children: ReactNode;
}

/**
 * The middle column shown when an activity is selected. Renders nothing
 * visible itself — just a sized, scrollable host.
 */
export function SidePane({ children }: SidePaneProps) {
  return (
    <div className="flex h-full w-72 flex-col border-r border-stone-800/80 bg-stone-950">
      {children}
    </div>
  );
}
