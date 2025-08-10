export async function fetchJson<T>(
  input: string,
  init?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    signal: init?.signal,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as unknown as { error?: string };
      if (j?.error) msg += ` – ${j.error}`;
    } catch {
      // ignore json parse error
    }
    throw new Error(msg);
  }
  return res.json() as unknown as Promise<T>;
}
