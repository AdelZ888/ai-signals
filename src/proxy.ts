import { NextResponse, type NextRequest } from "next/server";

import { isLegacyPath } from "./lib/site/legacy.ts";

export function proxy(request: NextRequest) {
  if (isLegacyPath(request.nextUrl.pathname)) {
    return new NextResponse("410 Gone: this page was removed when AI Signals became an AI model pricing tracker.\n", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/fr", "/fr/:path*", "/posts/:path*", "/tags/:path*", "/regions/:path*", "/tutorials/:path*",
    "/search", "/start-here", "/services/:path*", "/api/services/:path*", "/newsletter/:path+",
  ],
};
