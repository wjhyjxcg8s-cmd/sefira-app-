import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
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
  const { data: { user }, error } = await supabaseUser.auth.getUser();
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action, ids, userId } = await req.json();

    if (action === "delete_selected") {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No ids provided" }, { status: 400 });
      }
      const { error } = await supabaseAdmin
        .from("admin_messages")
        .delete()
        .in("id", ids);
      return NextResponse.json({ error: error?.message ?? null });
    }

    if (action === "delete_user") {
      if (!userId) {
        return NextResponse.json({ error: "No userId provided" }, { status: 400 });
      }
      const { error } = await supabaseAdmin
        .from("admin_messages")
        .delete()
        .eq("user_id", userId);
      return NextResponse.json({ error: error?.message ?? null });
    }

    if (action === "delete_global") {
      const { error } = await supabaseAdmin
        .from("admin_messages")
        .delete()
        .eq("is_global", true);
      return NextResponse.json({ error: error?.message ?? null });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
