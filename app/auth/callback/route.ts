import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// TODO Type errors in this file should ideally be fixed, although this is code adapted straight from Supabase docs
// https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr#create-api-endpoint-for-handling-the-code-exchange

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const errorRedirectURL = new URL("/auth/auth-code-error", origin);

  // If there's an error parameter in the URL, redirect to error page with details.
  if (error) {
    errorRedirectURL.searchParams.set("error", error);
    if (errorDescription) {
      errorRedirectURL.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(errorRedirectURL);
  }

  if (code || (tokenHash && type)) {
    try {
      const cookieStore = await cookies();
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

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          return NextResponse.redirect(`${origin}/species`);
        }
      } else if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (!verifyError) {
          return NextResponse.redirect(`${origin}/species`);
        }
      }

      if (!errorDescription) {
        errorRedirectURL.searchParams.set("error", "auth_code_exchange_failed");
      }
      return NextResponse.redirect(errorRedirectURL);
    } catch (err) {
      console.error("Error exchanging code for session:", err);
      errorRedirectURL.searchParams.set("error", "auth_callback_exception");
      if (err instanceof Error) {
        errorRedirectURL.searchParams.set("error_description", err.message);
      }
      return NextResponse.redirect(errorRedirectURL);
    }
  }

  if (!code && !tokenHash) {
    errorRedirectURL.searchParams.set("error", "missing_auth_code");
    return NextResponse.redirect(errorRedirectURL);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(errorRedirectURL);
}
