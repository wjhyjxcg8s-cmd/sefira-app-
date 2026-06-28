import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { reporter_id, reported_user_id, message_id, message_content, reason } = await req.json();

    if (!reporter_id || !reported_user_id || !message_id || !reason) {
      return NextResponse.json({ error: "reporter_id, reported_user_id, message_id and reason are required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("reported_messages")
      .insert([{
        reporter_id,
        reported_user_id,
        message_id,
        message_content: message_content ?? "",
        reason,
        status: "pending",
      }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}