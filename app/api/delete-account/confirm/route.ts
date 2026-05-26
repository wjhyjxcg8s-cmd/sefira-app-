/*
  SQL to create deletion_feedback table (run once in Supabase SQL editor):

  CREATE TABLE IF NOT EXISTS deletion_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    email text,
    reasons text[],
    rating integer,
    feedback text,
    deleted_at timestamptz DEFAULT now()
  );
*/

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ceetzophaybywfuhezhv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Validate the user JWT using a client initialized with the user's own Authorization header.
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin client for privileged operations — created at request time.
  const supabaseAdmin = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { otp, reasons, rating, feedback } = await req.json();

    // Read the stored OTP from fresh user metadata (getUser() fetches live data from server)
    const storedCode = user.user_metadata?._delete_otp;
    const expiresAt = user.user_metadata?._delete_otp_expires;

    if (!storedCode || storedCode !== otp) {
      return NextResponse.json({ error: "invalid_otp" }, { status: 400 });
    }
    if (!expiresAt || Date.now() > expiresAt) {
      return NextResponse.json({ error: "otp_expired" }, { status: 400 });
    }

    // Save deletion feedback (best-effort — don't block deletion if table missing)
    await supabaseAdmin.from("deletion_feedback").insert({
      user_id: user.id,
      email: user.email,
      reasons: reasons ?? [],
      rating: rating ?? null,
      feedback: feedback || null,
      deleted_at: new Date().toISOString(),
    });

    // Delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
