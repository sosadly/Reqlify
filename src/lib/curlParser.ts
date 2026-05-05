import type { AuthConfig, BodyMode, HttpMethod, RequestDraft } from "../types/http";
import { emptyAuth, emptyDraft, makeKvEntry } from "../utils/request";
import { createId } from "../utils/id";

/**
 * Tokenize a cURL command string the same way a shell would — respecting
 * single-quoted, double-quoted and unquoted segments with backslash escapes.
 * Line continuations (`\` followed by a newline) are collapsed first.
 */
function tokenize(raw: string): string[] {
  // Collapse bash line continuations.
  const input = raw.replace(/\\\n/g, " ").trim();

  const tokens: string[] = [];
  let current = "";
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === "'" ) {
      // Single-quoted: no escape processing, read until closing quote.
      i++;
      while (i < input.length && input[i] !== "'") {
        current += input[i++];
      }
      i++; // skip closing '
    } else if (ch === '"') {
      // Double-quoted: honour backslash escapes for \", \\, \$.
      i++;
      while (i < input.length && input[i] !== '"') {
        if (input[i] === '\\' && i + 1 < input.length) {
          const next = input[i + 1];
          current += (next === '"' || next === '\\' || next === '$') ? next : '\\' + next;
          i += 2;
        } else {
          current += input[i++];
        }
      }
      i++; // skip closing "
    } else if (ch === '\\' && i + 1 < input.length) {
      current += input[i + 1];
      i += 2;
    } else if (ch === ' ' || ch === '\t') {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      i++;
    } else {
      current += ch;
      i++;
    }
  }

  if (current.length > 0) tokens.push(current);
  return tokens;
}

const KNOWN_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);

/** Flags that consume the next token as their value. */
const VALUE_FLAGS = new Set([
  "-X", "--request",
  "-H", "--header",
  "-d", "--data", "--data-raw", "--data-binary", "--data-ascii",
  "-u", "--user",
  "--url",
  "-A", "--user-agent",
  "--connect-timeout", "--max-time",
  "-o", "--output",
  "-e", "--referer",
]);

/** Flags we recognise but silently ignore (don't treat them as the URL). */
const IGNORED_FLAGS = new Set([
  "-L", "--location",
  "-v", "--verbose",
  "-s", "--silent",
  "-i", "--include",
  "-k", "--insecure",
  "--compressed",
  "-g", "--globoff",
  "-G", "--get",
  "--http1.1", "--http2",
  "--no-keepalive",
]);

export interface CurlParseResult {
  draft: RequestDraft;
  /** Non-fatal notes the user might want to know about (e.g. ignored flags). */
  warnings: string[];
}

export function parseCurl(raw: string): CurlParseResult {
  const warnings: string[] = [];
  const tokens = tokenize(raw.trim());

  // Strip leading "curl" command token.
  if (tokens[0]?.toLowerCase() === "curl") tokens.shift();

  let method: HttpMethod | null = null;
  let url = "";
  const rawHeaders: Array<[string, string]> = [];
  let body = "";
  let hasBody = false;
  let basicUser = "";
  let basicPassword = "";

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    if (VALUE_FLAGS.has(tok)) {
      const val = tokens[i + 1] ?? "";
      i += 2;

      if (tok === "-X" || tok === "--request") {
        const m = val.toUpperCase();
        method = KNOWN_METHODS.has(m) ? (m as HttpMethod) : null;
      } else if (tok === "-H" || tok === "--header") {
        const colon = val.indexOf(":");
        if (colon !== -1) {
          rawHeaders.push([val.slice(0, colon).trim(), val.slice(colon + 1).trim()]);
        }
      } else if (tok === "-d" || tok.startsWith("--data")) {
        body = val;
        hasBody = true;
      } else if (tok === "-u" || tok === "--user") {
        const colon = val.indexOf(":");
        basicUser = colon !== -1 ? val.slice(0, colon) : val;
        basicPassword = colon !== -1 ? val.slice(colon + 1) : "";
      } else if (tok === "--url") {
        url = val;
      } else if (tok === "-A" || tok === "--user-agent") {
        rawHeaders.push(["User-Agent", val]);
      }
    } else if (IGNORED_FLAGS.has(tok)) {
      i++;
    } else if (tok.startsWith("-")) {
      // Unknown flag — skip it (and its value if it looks like one follows).
      warnings.push(`Ignored unknown flag: ${tok}`);
      i++;
    } else if (!url) {
      // First non-flag positional argument is the URL.
      url = tok;
      i++;
    } else {
      i++;
    }
  }

  // Infer method from presence of body if not explicit.
  if (!method) method = hasBody ? "POST" : "GET";

  // Try to parse the URL and split out query params.
  let baseUrl = url;
  const params: ReturnType<typeof makeKvEntry>[] = [];
  try {
    const u = new URL(url);
    baseUrl = `${u.origin}${u.pathname}`;
    u.searchParams.forEach((v, k) => {
      params.push(makeKvEntry({ key: k, value: v }));
    });
  } catch {
    /* keep url as-is */
  }
  params.push(makeKvEntry()); // trailing empty row

  // Separate out the Authorization header if present.
  const auth: AuthConfig = emptyAuth();
  if (basicUser) {
    auth.mode = "basic";
    auth.basicUser = basicUser;
    auth.basicPassword = basicPassword;
  }

  const headers: ReturnType<typeof makeKvEntry>[] = [];
  for (const [k, v] of rawHeaders) {
    if (k.toLowerCase() === "authorization" && !basicUser) {
      if (v.toLowerCase().startsWith("bearer ")) {
        auth.mode = "bearer";
        auth.bearerToken = v.slice(7).trim();
        continue; // don't add to headers table — it'll live in Auth section
      }
    }
    headers.push(makeKvEntry({ id: createId(), key: k, value: v }));
  }
  headers.push(makeKvEntry()); // trailing empty row

  // Detect body content type.
  const contentType = rawHeaders.find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "";
  let bodyMode: BodyMode = "none";
  if (hasBody) {
    bodyMode = contentType.toLowerCase().includes("json") ? "json" : "text";
  }

  const draft: RequestDraft = {
    ...emptyDraft(method),
    url: baseUrl,
    params,
    headers,
    bodyMode,
    body,
    auth,
  };

  return { draft, warnings };
}
