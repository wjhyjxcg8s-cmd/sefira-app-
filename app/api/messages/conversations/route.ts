import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ conversations: [] });

    const { data: convs, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("id, user1_id, user2_id, listing_id, updated_at")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (convErr || !convs || convs.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const convIds = convs.map((c: any) => c.id);
    const otherUserIds = [
      ...new Set(
        convs.map((c: any) => (c.user1_id === userId ? c.user2_id : c.user1_id))
      ),
    ];

    // Fetch profiles for all other users
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", otherUserIds);

    // Fetch listing previews for conversations that have listing_id
    const listingIds = [
      ...new Set(
        convs.filter((c: any) => c.listing_id).map((c: any) => c.listing_id as string)
      ),
    ];
    let listings: any[] = [];
    if (listingIds.length > 0) {
      const { data: l } = await supabaseAdmin
        .from("listings")
        .select("id, city, district, rent, currency, photos")
        .in("id", listingIds);
      listings = l || [];
    }

    // Fetch last message per conversation (N queries but each returns 1 row)
    const lastMessages: Record<string, any> = {};
    for (const convId of convIds) {
      const { data: msgs } = await supabaseAdmin
        .from("user_messages")
        .select("content, created_at, sender_id")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (msgs?.[0]) lastMessages[convId] = msgs[0];
    }

    // Fetch unread counts in a single batch query
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

    const result = convs.map((c: any) => {
      const otherUserId = c.user1_id === userId ? c.user2_id : c.user1_id;
      const profile = profiles?.find((p: any) => p.user_id === otherUserId) ?? null;
      const listing = listings.find((l: any) => l.id === c.listing_id) ?? null;
      return {
        id: c.id,
        otherUserId,
        otherUserProfile: profile,
        listingId: c.listing_id ?? null,
        listingPreview: listing,
        lastMessage: lastMessages[c.id] ?? null,
        unreadCount: unreadCounts[c.id] ?? 0,
        updatedAt: c.updated_at,
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (e: any) {
    console.error("[messages/conversations] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
