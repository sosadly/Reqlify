/**
 * Versioned localStorage keys. Bump the version suffix if the persisted
 * shape changes in a non-backward-compatible way.
 */
export const STORAGE_KEYS = {
  tabs: "reqlify:tabs:v1",
  history: "reqlify:history:v1",
  env: "reqlify:env:v1",
  collections: "reqlify:collections:v1",
} as const;

/** Cap history so localStorage doesn't grow unbounded. */
export const HISTORY_LIMIT = 100;
