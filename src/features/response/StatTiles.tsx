import { Clock, Database, Hash } from "lucide-react";
import { ReactNode } from "react";

import type { HttpResponse } from "../../types/http";
import { formatBytes, formatMs } from "../../utils/format";
import { statusTheme } from "../../utils/status";

interface StatTilesProps {
  response: HttpResponse;
}

interface TileProps {
  icon: ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  ringClass?: string;
}

function Tile({ icon, label, value, valueClass = "text-stone-100", ringClass }: TileProps) {
  return (
    <div
      className={`flex flex-1 items-center gap-2.5 rounded-lg border border-stone-800/80 bg-stone-900/40 px-3 py-2 ${
        ringClass ? `ring-1 ${ringClass}` : ""
      }`}
    >
      <span className="text-stone-500">{icon}</span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          {label}
        </span>
        <span className={`truncate font-mono text-sm font-semibold ${valueClass}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function StatTiles({ response }: StatTilesProps) {
  const theme = statusTheme(response.status);
  return (
    <div className="flex gap-2">
      <Tile
        icon={<Hash size={14} />}
        label={theme.label}
        value={`${response.status} ${response.statusText}`}
        valueClass={theme.text}
        ringClass={theme.ring}
      />
      <Tile
        icon={<Clock size={14} />}
        label="Time"
        value={formatMs(response.timeMs)}
      />
      <Tile
        icon={<Database size={14} />}
        label="Size"
        value={formatBytes(response.sizeBytes)}
      />
    </div>
  );
}
