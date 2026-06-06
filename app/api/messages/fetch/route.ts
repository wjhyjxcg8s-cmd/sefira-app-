import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { conversationId, senderId, targetUserId } = await request.json();

    console.log("[messages/fetch] received:", { conversationId, senderId, targetUserId });

    let convId = conversationId;

    // If no direct convId, look up by user pair
    if (!convId && senderId && targetUserId) {
      const { data: existing } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${senderId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${senderId})`
        )
        .maybeSingle();

      console.log("[messages/fetch] lookup result:", existing);

      if (existing) {
        convId = existing.id;
      } else {
        // No conversation yet — return empty
        return NextResponse.json({ messages: [], conversationId: null });
      }
    }

    if (!convId) {
      return NextResponse.json({ messages: [], conversationId: null });
    }

    const { data, error } = await supabaseAdmin
      .from("user_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    console.log("[messages/fetch] messages count:", data?.length, error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [], conversationId: convId });
  } catch (e: any) {
    console.error("[messages/fetch] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
