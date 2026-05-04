import type { BodyMode, HttpMethod } from "../types/http";

export const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

export const METHODS_WITH_BODY: HttpMethod[] = ["POST", "PUT", "PATCH", "DELETE"];

export const BODY_MODES: { value: BodyMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON" },
  { value: "text", label: "Text" },
];

/**
 * Per-method theming. `text` is for inline labels; `chip` paints the method
 * pill in the URL bar — same hue, more saturation behind it.
 */
export const METHOD_THEME: Record<
  HttpMethod,
  { text: string; chip: string; accent: string }
> = {
  GET:     { text: "text-emerald-400", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", accent: "bg-emerald-400" },
  POST:    { text: "text-amber-400",   chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",       accent: "bg-amber-400" },
  PUT:     { text: "text-sky-400",     chip: "bg-sky-500/15 text-sky-300 border-sky-500/30",             accent: "bg-sky-400" },
  PATCH:   { text: "text-violet-400",  chip: "bg-violet-500/15 text-violet-300 border-violet-500/30",    accent: "bg-violet-400" },
  DELETE:  { text: "text-rose-400",    chip: "bg-rose-500/15 text-rose-300 border-rose-500/30",          accent: "bg-rose-400" },
  HEAD:    { text: "text-stone-400",   chip: "bg-stone-500/15 text-stone-300 border-stone-500/30",       accent: "bg-stone-400" },
  OPTIONS: { text: "text-stone-400",   chip: "bg-stone-500/15 text-stone-300 border-stone-500/30",       accent: "bg-stone-400" },
};
