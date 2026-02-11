// Add util functions that should only be run in server components. Importing these in client components will throw an error.
// For more info on how to avoid poisoning your server/client components: https://www.youtube.com/watch?v=BZlwtR9pDp4
import { env } from "@/env.mjs";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { type Database } from "./schema";

export const createServerSupabaseClient = cache(() => {
  let cookieStore: ReturnType<typeof cookies>;
  try {
    cookieStore = cookies();
  } catch (error) {
    // If cookies() fails, create a minimal client without cookie support
    // This should not happen, but provides a fallback
    console.error("Failed to get cookies:", error);
    return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    });
  }

  const supabase = createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        try {
          // Check if get method exists and is callable
          if (cookieStore && "get" in cookieStore && typeof (cookieStore as any).get === "function") {
            return (cookieStore as any).get(name)?.value;
          }
        } catch {
          // Ignore errors
        }
        return undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          if (cookieStore && "set" in cookieStore && typeof (cookieStore as any).set === "function") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            (cookieStore as any).set({ name, value, ...options });
          }
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          if (cookieStore && "delete" in cookieStore && typeof (cookieStore as any).delete === "function") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            (cookieStore as any).delete({ name, ...options });
          } else if (cookieStore && "set" in cookieStore && typeof (cookieStore as any).set === "function") {
            // Fallback: set to empty with maxAge 0
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            (cookieStore as any).set({ name, value: "", ...options, maxAge: 0 });
          }
        } catch {
          // Ignore errors in Server Components
        }
      },
    },
  });
  return supabase;
});
