export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Try to pretty-print as JSON. If parsing fails we just hand back the
 * original text — better to show something readable than throw.
 */
export function tryFormatJson(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch {
    return input;
  }
}

/** Detect JSON-ish responses by content-type so we know whether to pretty-print. */
export function isJsonContentType(headers: Array<[string, string]>): boolean {
  const ct = headers.find(([k]) => k.toLowerCase() === "content-type")?.[1];
  return !!ct && ct.toLowerCase().includes("json");
}
