import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host === "ktltc.vercel.app") {
    const url = request.nextUrl.clone();
    url.hostname = "ktltc.site";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
}

export const config = {
  matcher: "/:path*",
};
