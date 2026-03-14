import { auth } from "@/auth";
import { NextResponse } from "next/server";

const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/set-password"] as const;
const protectedRoutes = [
  "/dashboard",
  "/subscribers",
  "/devices",
  "/tickets",
  "/monitoring",
  "/analytics",
  "/workorders",
  "/inventory",
  "/settings",
  "/team",
] as const;

function matchesPath(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const isAuthRoute = authRoutes.some((route) => matchesPath(pathname, route));
  const isProtectedRoute = protectedRoutes.some((route) => matchesPath(pathname, route));
  const isLoggedIn = Boolean(request.auth?.user);

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/set-password",
    "/dashboard/:path*",
    "/subscribers/:path*",
    "/devices/:path*",
    "/tickets/:path*",
    "/monitoring/:path*",
    "/analytics/:path*",
    "/workorders/:path*",
    "/inventory/:path*",
    "/settings/:path*",
    "/team/:path*",
  ],
};
