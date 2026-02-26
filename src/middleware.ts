import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - Static assets (svg, png, jpg, etc.)
     * - /overlay/* routes (OBS browser sources, must stay public)
     */
    "/((?!_next/static|_next/image|favicon.ico|overlay|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
