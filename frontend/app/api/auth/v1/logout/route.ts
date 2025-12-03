import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  // This clears the Supabase auth cookies
  await supabase.auth.signOut();

  return NextResponse.json({
    status: 200,
  });
}
