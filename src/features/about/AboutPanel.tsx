import { CodeXml, Globe, ShieldCheck } from "lucide-react";

export function AboutPanel() {
  return (
    <div className="flex h-full flex-col px-4 py-4">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Reqlify" className="h-10 w-10 rounded-md" />
        <div>
          <div className="text-sm font-semibold text-stone-100">Reqlify</div>
          <div className="text-[10px] text-stone-500">v0.1.0 · MVP</div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-stone-400">
        A fast, offline-first HTTP client. No accounts. No cloud sync. No
        backend at all — your requests live on your machine.
      </p>

      <ul className="mt-4 flex flex-col gap-2 text-xs text-stone-300">
        <li className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          Local-only storage
        </li>
        <li className="flex items-center gap-2">
          <Globe size={14} className="text-sky-400" />
          Native networking, no CORS
        </li>
        <li className="flex items-center gap-2">
          <CodeXml size={14} className="text-stone-300" />
          Open source &amp; free
        </li>
      </ul>
    </div>
  );
}
