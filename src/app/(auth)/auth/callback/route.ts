import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function getOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = getOrigin();
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // Read the auth-redirect cookie (set by forgot-password page)
  const cookieStore = await cookies();
  const authNext = cookieStore.get("sb-auth-next")?.value;

  // Determine destination: query param > cookie > default
  const destination = next ?? authNext ?? "/dashboard";

  // Handle Supabase error redirects (e.g. expired token)
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  if (error) {
    const msg = errorCode || error;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(msg)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(`${origin}${destination}`);
        // Clear the auth-redirect cookie
        response.cookies.set("sb-auth-next", "", { maxAge: 0, path: "/" });
        return response;
      }
      // Token expired or invalid
      return NextResponse.redirect(
        `${origin}/login?error=confirmation_expired`
      );
    } catch {
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_failed`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
