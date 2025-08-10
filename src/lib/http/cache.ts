type Entry = { v: unknown; exp: number };
const store = new Map<string, Entry>();

export function getCache<T = unknown>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (e.exp < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return e.v as T;
}

export function setCache(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { v: value, exp: Date.now() + ttlMs });
}
