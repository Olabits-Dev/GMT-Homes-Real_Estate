import { NextRequest, NextResponse } from "next/server";
import { decrypt, sessionCookieName } from "@/lib/session";

const protectedRoutes = ["/add-property", "/dashboard"];
const authRoutes = ["/login", "/signup"];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  return loginUrl;
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let session = null;

  try {
    session = await decrypt(request.cookies.get(sessionCookieName)?.value);
  } catch (error) {
    console.error("Failed to read the proxy session.", error);
  }

  if (matchesRoute(pathname, protectedRoutes) && !session?.userId) {
    return NextResponse.redirect(buildLoginRedirect(request));
  }

  if (matchesRoute(pathname, authRoutes) && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)"],
};
