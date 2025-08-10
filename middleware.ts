import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

const isProtectedRoute = createRouteMatcher([
  "/create(.*)",
  "/top10(.*)",
  "/recap(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const a = await auth();
  if (isProtectedRoute(req) && !a.userId) {
    return a.redirectToSignIn();
  }
  // Onboarding redirect: if accessing create/top10/recap without username, send to /onboarding
  if (a.userId && isProtectedRoute(req)) {
    try {
      const url = new URL(req.url);
      // Allow onboarding page itself to pass
      if (url.pathname.startsWith("/onboarding")) return;
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("username")
        .eq("id", a.userId)
        .maybeSingle();
      const hasUsername = !!(data && data.username);
      if (!hasUsername) {
        return Response.redirect(new URL("/onboarding", req.url));
      }
    } catch {
      // ignore and allow
    }
  }
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/(api|trpc)(.*)"],
};
