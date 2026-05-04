interface ResponseHeadersProps {
  headers: Array<[string, string]>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  if (headers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-stone-500">
        No response headers.
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-stone-800/80">
      <ul className="divide-y divide-stone-800/60">
        {headers.map(([name, value], i) => (
          <li
            key={`${name}-${i}`}
            className="grid grid-cols-[180px_1fr] gap-3 px-3 py-2 text-xs"
          >
            <span className="truncate font-mono font-semibold text-stone-300">
              {name}
            </span>
            <span className="break-all font-mono text-stone-200">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
