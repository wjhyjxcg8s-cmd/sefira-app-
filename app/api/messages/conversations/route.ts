import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    console.log("[conversations] userId:", userId);

    if (!userId) return NextResponse.json({ conversations: [] });

    // 1. Get conversations
    const { data: convs, error: convErr } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (convErr || !convs || convs.length === 0) {
      console.log("[conversations] none found:", convErr?.message);
      return NextResponse.json({ conversations: [] });
    }

    console.log("[conversations] found:", convs.length);

    const convIds = convs.map((c: any) => c.id);
    const otherUserIds = convs.map((c: any) => c.user1_id === userId ? c.user2_id : c.user1_id).filter(Boolean)

    // 2. Fetch listings separately by listing_id only
    const listingIds = convs.filter((c: any) => c.listing_id).map((c: any) => c.listing_id)
    let listingsMap: Record<string, any> = {}
    if (listingIds.length > 0) {
      const { data: listings } = await supabaseAdmin
        .from('listings')
        .select('id, photos, city, district, rent, currency')
        .in('id', listingIds)
      if (listings) {
        listings.forEach((l: any) => { listingsMap[l.id] = l })
      }
    }

    // 3. Fetch profiles for other users
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, avatar_url, gender")
      .in("user_id", [...new Set(otherUserIds)]);

    // 5. Get last message per conversation
    const { data: allMsgs } = await supabaseAdmin
      .from("user_messages")
      .select("conversation_id, content, created_at, sender_id")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    const lastMsgByConv: Record<string, any> = {};
    for (const msg of allMsgs || []) {
      const cid = (msg as any).conversation_id;
      if (!lastMsgByConv[cid]) lastMsgByConv[cid] = msg;
    }

    // 6. Get unread counts
    const { data: unreadMsgs } = await supabaseAdmin
      .from("user_messages")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    const unreadCounts: Record<string, number> = {};
    for (const msg of unreadMsgs || []) {
      const cid = (msg as any).conversation_id;
      unreadCounts[cid] = (unreadCounts[cid] || 0) + 1;
    }

    // 7. Build enriched conversations
    const enriched = convs.map((conv: any) => {
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
      const profile = profiles?.find((p: any) => p.user_id === otherUserId) ?? null;

      const listing = conv.listing_id ? (listingsMap[conv.listing_id] || null) : null;

      console.log(`[conversations] conv ${conv.id}: otherUser=${otherUserId}, listing=${listing?.id ?? "none"}`);

      return {
        ...conv,
        otherUser: profile || null,
        listing: listing,
        lastMessage: lastMsgByConv[conv.id] ?? null,
        unreadCount: unreadCounts[conv.id] ?? 0,
      };
    });

    console.log("Enriched convs debug:", enriched.map((c: any) => ({
      convId: c.id,
      listingId: c.listing?.id,
      listingPhotos: c.listing?.photos,
      otherUserId: c.otherUser?.user_id,
    })));
    console.log('FINAL ENRICHED SAMPLE:', JSON.stringify(enriched[0], null, 2));

    return NextResponse.json({ conversations: enriched });
  } catch (e: any) {
    console.error("[conversations] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
