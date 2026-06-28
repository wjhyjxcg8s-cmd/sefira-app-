import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
