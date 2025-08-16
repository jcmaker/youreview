import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/(api|trpc)(.*)"],
};
