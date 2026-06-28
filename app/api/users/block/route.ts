import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { blocker_id, blocked_id } = await req.json();

    if (!blocker_id || !blocked_id) {
      return NextResponse.json({ error: "blocker_id and blocked_id are required" }, { status: 400 });
    }

    if (blocker_id === blocked_id) {
      return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("blocked_users")
      .insert([{ blocker_id, blocked_id }]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, alreadyBlocked: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}