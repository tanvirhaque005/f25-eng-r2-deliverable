import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// TODO Type errors in this file should ideally be fixed, although this is code adapted straight from Supabase docs
// https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr#create-api-endpoint-for-handling-the-code-exchange

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If there's an error parameter in the URL, redirect to error page
  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              cookieStore.delete({ name, ...options });
            },
          },
        },
      );
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError) {
        return NextResponse.redirect(`${origin}/species`);
      }
    } catch (err) {
      console.error("Error exchanging code for session:", err);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
