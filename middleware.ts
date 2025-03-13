// just give me a middleware function that doesn't look for auth and just returns true

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

//todo:  use the connect wallet method for authentication
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/:id", "/api/:path*"],
};
