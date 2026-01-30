import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  console.log("Auth callback triggered");
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`http://localhost:3001`);
      } else {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`);
      }
    } else {
      console.error("Error exchanging code for session:", error);
    }
  } else {
    console.warn("No code provided in callback");
  }

  // return the user to an error page with instructions
  console.log("Redirecting to error page");
  return NextResponse.redirect(
    `${process.env.NODE_ENV === "development" ? "http://localhost:3001/auth/auth-code-error" : process.env.NEXT_PUBLIC_APP_URL}/auth/auth-code-error`,
  );
}
