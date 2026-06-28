import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("FULL REQUEST BODY:", JSON.stringify(body));

    const { conversationId, senderId, content, targetUserId, listingId, replyToId } = body;

    console.log("listingId received:", listingId);
    console.log("targetUserId received:", targetUserId);

    if (!senderId || !content || !targetUserId) {
      return NextResponse.json(
        { error: "Missing required fields: senderId, content, targetUserId" },
        { status: 400 }
      );
    }

    // Block check — reject if either user has blocked the other
    const { data: blockCheck } = await supabaseAdmin
      .from("blocked_users")
      .select("id")
      .or(
        `and(blocker_id.eq.${senderId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${senderId})`
      )
      .limit(1);

    if (blockCheck && blockCheck.length > 0) {
      return NextResponse.json({ error: "blocked" }, { status: 403 });
    }

    let convId = conversationId;

    // Find or create a real conversation if we don't have one yet
    if (!convId) {
      // Match by user pair AND listing — each listing gets its own conversation
      let existingQuery = supabaseAdmin
        .from("conversations")
        .select("id")
        .or(`and(user1_id.eq.${senderId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${senderId})`);

      if (listingId) {
        existingQuery = existingQuery.eq("listing_id", listingId);
      } else {
        existingQuery = existingQuery.is("listing_id", null);
      }

      const { data: existing } = await existingQuery.maybeSingle();

      console.log("[messages/send] existing conv:", existing);

      if (existing) {
        convId = existing.id;
      } else {
        console.log("Creating conversation:", {
          user1_id: senderId,
          user2_id: targetUserId,
          listing_id: listingId,
        });
        const { data: newConv, error: convErr } = await supabaseAdmin
          .from("conversations")
          .insert({
            user1_id: senderId,
            user2_id: targetUserId,
            listing_id: listingId ?? null,
          })
          .select("id, listing_id")
          .single();

        console.log("Created conv result:", newConv, convErr);

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
        reply_to_id: replyToId ?? null,
      })
      .select()
      .single();

    console.log("[messages/send] insert result:", msg, msgErr);

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    // Resolve reply_to content if applicable
    let replyTo = null;
    if (msg?.reply_to_id) {
      const { data: replyMsg } = await supabaseAdmin
        .from("user_messages")
        .select("id, content, sender_id")
        .eq("id", msg.reply_to_id)
        .maybeSingle();
      replyTo = replyMsg ?? null;
    }

    // Update conversation timestamp
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);

    return NextResponse.json({ message: { ...msg, reply_to: replyTo }, conversationId: convId });
  } catch (e: any) {
    console.error("[messages/send] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
