import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ceetzophaybywfuhezhv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";
const ADMIN_EMAIL = "supportsefira@gmail.com";

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error,
  } = await supabaseUser.auth.getUser();
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST — ban (action='ban') or unban (action='unban')
export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, email, reason, action } = await req.json();

  if (action === "ban") {
    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    console.log("Auth ban error:", banError);

    const { error: dbError } = await supabaseAdmin
      .from("banned_emails")
      .upsert([{
        email,
        user_id: userId,
        reason: reason || "Admin tarafından engellendi",
        banned_at: new Date().toISOString(),
      }], { onConflict: "email" });
    console.log("DB insert error:", dbError);

    return NextResponse.json({ success: !banError && !dbError, banError, dbError });
  }

  if (action === "unban") {
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });
    console.log("Auth unban error:", unbanError);

    await supabaseAdmin.from("banned_emails").delete().eq("user_id", userId);

    return NextResponse.json({ success: !unbanError });
  }

  // Backwards compat: no action field defaults to ban
  if (!action) {
    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    console.log("Auth ban error:", banError);

    const { error: dbError } = await supabaseAdmin
      .from("banned_emails")
      .upsert([{
        email,
        user_id: userId,
        reason: reason || "Admin tarafından engellendi",
        banned_at: new Date().toISOString(),
      }], { onConflict: "email" });
    console.log("DB insert error:", dbError);

    return NextResponse.json({ success: !banError && !dbError, banError, dbError });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// DELETE — unban (kept for backwards compatibility)
export async function DELETE(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, email } = await req.json();
  if (!userId || !email) {
    return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
  }

  const { error: unbanAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (unbanAuthError) {
    return NextResponse.json({ error: unbanAuthError.message }, { status: 500 });
  }

  const { error: dbError } = await supabaseAdmin
    .from("banned_emails")
    .delete()
    .eq("email", email);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
