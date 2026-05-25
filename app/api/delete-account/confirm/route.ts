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

const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { otp, reasons, rating, feedback } = await req.json();

    // Verify OTP from user metadata
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
