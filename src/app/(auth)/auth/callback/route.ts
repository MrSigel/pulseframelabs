import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/confirmed";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
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
