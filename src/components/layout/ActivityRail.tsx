import { History, Info } from "lucide-react";

import { IconButton } from "../ui/IconButton";

export type ActivityKey = "history" | "about";

interface ActivityRailProps {
  active: ActivityKey | null;
  onSelect: (key: ActivityKey | null) => void;
}

interface Item {
  key: ActivityKey;
  label: string;
  icon: typeof History;
}

const ITEMS: Item[] = [
  { key: "history", label: "History", icon: History },
  { key: "about", label: "About", icon: Info },
];

export function ActivityRail({ active, onSelect }: ActivityRailProps) {
  return (
    <nav className="flex h-full w-12 flex-col items-center gap-1 border-r border-stone-800/80 bg-stone-950 py-3">
      <div className="mb-2">
        <img src="/logo.png" alt="Reqlify" className="h-8 w-8 rounded-md" />
      </div>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <IconButton
            key={item.key}
            label={item.label}
            active={isActive}
            onClick={() => onSelect(isActive ? null : item.key)}
          >
            <Icon size={18} />
          </IconButton>
        );
      })}
    </nav>
  );
}
