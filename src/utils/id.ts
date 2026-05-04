/**
 * Short, URL-safe identifier. We don't need cryptographic uniqueness here,
 * just something short and unlikely to collide within one window.
 */
export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}
