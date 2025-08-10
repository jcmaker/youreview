import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_KEY = "youreview_demo_uid";

export async function getOrCreateDemoUserId(): Promise<string> {
  const store = await cookies();
  const exist = store.get(COOKIE_KEY)?.value;
  if (exist) return exist;
  const uid = randomUUID();
  store.set(COOKIE_KEY, uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return uid;
}
