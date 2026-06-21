import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    // currentUserId: when provided alongside conversationId, we resolve the targetUserId
    const { conversationId, senderId, targetUserId, currentUserId, listingId } = await request.json();

    console.log("[messages/fetch] received:", { conversationId, senderId, targetUserId, currentUserId });

    let convId = conversationId;
    let resolvedTargetUserId: string | null = null;
    let resolvedListingId: string | null = null;

    // Path A: direct conversationId (from ?convId= notification link)
    if (convId && currentUserId) {
      const { data: conv } = await supabaseAdmin
        .from("conversations")
        .select("user1_id, user2_id, listing_id")
        .eq("id", convId)
        .maybeSingle();

      if (conv) {
        resolvedTargetUserId =
          conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
        resolvedListingId = conv.listing_id ?? null;
      }
    }

    // Path B: user-pair + listing lookup (from ?userId= flow)
    if (!convId && senderId && targetUserId) {
      let fetchQuery = supabaseAdmin
        .from("conversations")
        .select("id")
        .or(`and(user1_id.eq.${senderId},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${senderId})`);

      if (listingId) {
        fetchQuery = fetchQuery.eq("listing_id", listingId);
      }

      const { data: existing } = await fetchQuery.maybeSingle();

      console.log("[messages/fetch] pair lookup result:", existing);

      if (existing) {
        convId = existing.id;
      } else {
        return NextResponse.json({ messages: [], conversationId: null });
      }
    }

    if (!convId) {
      return NextResponse.json({ messages: [], conversationId: null });
    }

    const { data: rawMessages, error } = await supabaseAdmin
      .from("user_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    console.log("[messages/fetch] messages count:", rawMessages?.length, error?.message);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Resolve reply_to content for messages that have reply_to_id
    const replyIds = (rawMessages ?? [])
      .filter((m: any) => m.reply_to_id)
      .map((m: any) => m.reply_to_id as string);

    let replyMap: Record<string, { id: string; content: string; sender_id: string }> = {};
    if (replyIds.length > 0) {
      const { data: replies } = await supabaseAdmin
        .from("user_messages")
        .select("id, content, sender_id")
        .in("id", replyIds);
      for (const r of (replies ?? [])) {
        replyMap[r.id] = r;
      }
    }

    const data = (rawMessages ?? []).map((m: any) => ({
      ...m,
      reply_to: m.reply_to_id ? (replyMap[m.reply_to_id] ?? null) : null,
    }));

    return NextResponse.json({
      messages: data,
      conversationId: convId,
      ...(resolvedTargetUserId ? { targetUserId: resolvedTargetUserId } : {}),
      ...(resolvedListingId ? { listingId: resolvedListingId } : {}),
    });
  } catch (e: any) {
    console.error("[messages/fetch] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
