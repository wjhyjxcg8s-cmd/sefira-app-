import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { userId, targetUserId } = await req.json();

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: "userId and targetUserId are required" }, { status: 400 });
    }

    const [{ data: byUser }, { data: byTarget }] = await Promise.all([
      supabaseAdmin
        .from("blocked_users")
        .select("id")
        .eq("blocker_id", userId)
        .eq("blocked_id", targetUserId)
        .limit(1),
      supabaseAdmin
        .from("blocked_users")
        .select("id")
        .eq("blocker_id", targetUserId)
        .eq("blocked_id", userId)
        .limit(1),
    ]);

    return NextResponse.json({
      blockedByUser: (byUser?.length ?? 0) > 0,
      blockedByTarget: (byTarget?.length ?? 0) > 0,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
