import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { conversationId, senderId, content, targetUserId, listingId } =
      await request.json();

    console.log("[messages/send] received:", { conversationId, senderId, targetUserId, listingId });

    if (!senderId || !content || !targetUserId) {
      return NextResponse.json(
        { error: "Missing required fields: senderId, content, targetUserId" },
        { status: 400 }
      );
    }

    let convId = conversationId;

    // Find or create a real conversation if we don't have one yet
    if (!convId) {
      const { data: existing } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${senderId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${senderId})`
        )
        .maybeSingle();

      console.log("[messages/send] existing conv:", existing);

      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv, error: convErr } = await supabaseAdmin
          .from("conversations")
          .insert({
            user1_id: senderId,
            user2_id: targetUserId,
            listing_id: listingId || null,
          })
          .select("id")
          .single();

        console.log("[messages/send] created conv:", newConv, convErr);

        if (convErr) {
          return NextResponse.json({ error: convErr.message }, { status: 500 });
        }
        convId = newConv.id;
      }
    }

    // Insert the message
    const { data: msg, error: msgErr } = await supabaseAdmin
      .from("user_messages")
      .insert({
        conversation_id: convId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    console.log("[messages/send] insert result:", msg, msgErr);

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    // Update conversation timestamp
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);

    return NextResponse.json({ message: msg, conversationId: convId });
  } catch (e: any) {
    console.error("[messages/send] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
