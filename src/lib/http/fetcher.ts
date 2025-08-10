export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  opts: { timeoutMs?: number; retries?: number } = {}
): Promise<Response> {
  const { timeoutMs = 8000, retries = 1 } = opts;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "User-Agent": "youreview-bot", ...(init.headers || {}) },
      signal: controller.signal,
    });
    if (!res.ok && retries > 0 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 300));
      return fetchWithTimeout(url, init, { timeoutMs, retries: retries - 1 });
    }
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
