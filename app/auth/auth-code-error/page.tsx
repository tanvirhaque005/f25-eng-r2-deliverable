"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const shouldShowRedirectHint =
    error?.toLowerCase().includes("redirect") ||
    errorDescription?.toLowerCase().includes("redirect") ||
    errorDescription?.toLowerCase().includes("allowed");

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Authentication Error</h1>
        <p className="text-sm text-muted-foreground">
          There was an error authenticating your account. This could happen if:
        </p>
        <ul className="mt-4 list-disc text-left text-sm text-muted-foreground">
          <li>The authentication link has expired</li>
          <li>The authentication link has already been used</li>
          <li>There was a problem with the authentication code</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Please try logging in again.
        </p>
        {(error || errorDescription) && (
          <p className="mt-2 break-words text-xs text-muted-foreground">
            Details: {[error, errorDescription].filter(Boolean).join(" - ")}
          </p>
        )}
        {shouldShowRedirectHint && (
          <p className="mt-2 text-xs text-muted-foreground">
            Check Supabase Auth settings and add <code>http://localhost:3000/auth/callback</code> to
            allowed redirect URLs.
          </p>
        )}
      </div>
      <Button asChild>
        <Link href="/login">Return to Login</Link>
      </Button>
    </div>
  );
}
