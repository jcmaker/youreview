const RESERVED = new Set([
  "admin",
  "youreview",
  "api",
  "login",
  "sign-in",
  "u",
  "top10",
  "create",
  "recap",
  "onboarding",
]);

export function normalizeUsername(input: string): string {
  const lower = (input || "").trim().toLowerCase();
  return lower;
}

export function validateUsername(username: string): {
  ok: boolean;
  reason?: string;
} {
  const u = normalizeUsername(username);
  if (u.length < 3 || u.length > 20)
    return { ok: false, reason: "3~20자여야 합니다" };
  if (!/^[a-z0-9_-]+$/.test(u))
    return { ok: false, reason: "영문 소문자, 숫자, -, _ 만 허용" };
  if (RESERVED.has(u))
    return { ok: false, reason: "사용할 수 없는 이름입니다" };
  return { ok: true };
}

export async function isUsernameAvailable(_username: string): Promise<boolean> {
  // Client-side availability check is disabled to avoid exposing service role in client bundles.
  // Use server action or API endpoint instead.
  return true;
}
