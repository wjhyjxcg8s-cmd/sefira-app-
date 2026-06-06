import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "Missing conversationId or userId" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("user_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId);

    console.log("[messages/mark-read] convId:", conversationId, "error:", error?.message);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[messages/mark-read] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
