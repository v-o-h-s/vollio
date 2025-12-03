import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  console.log("Auth callback triggered");
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/dashboard/pdfs";

  console.log("Auth callback params:", {
    code: code ? "***" : null,
    next,
    origin,
  });

  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    console.log("Invalid next param, resetting to /dashboard/pdfs");
    next = "/dashboard/pdfs";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("Session exchange successful");
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      //todo update this later
      //const isLocalEnv = process.env.NODE_ENV === "development";
      const isLocalEnv = true;
      console.log("Environment check:", { isLocalEnv, forwardedHost });

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        console.log("Redirecting to local origin:", `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        console.log(
          "Redirecting to forwarded host:",
          `https://${forwardedHost}${next}`
        );
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        console.log("Redirecting to origin:", `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error("Error exchanging code for session:", error);
    }
  } else {
    console.warn("No code provided in callback");
  }

  // return the user to an error page with instructions
  console.log("Redirecting to error page");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
