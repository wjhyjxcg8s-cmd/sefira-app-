import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  const { conversationId, currentUserId } = await request.json();
  console.log("[conversation-detail] conversationId:", conversationId, "currentUserId:", currentUserId);

  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  console.log("[conversation-detail] conv:", conv);

  if (!conv) return NextResponse.json({ conversation: null, listing: null });

  let listing = null;

  // Try the conversation's listing_id first
  if (conv.listing_id) {
    const { data: l } = await supabaseAdmin
      .from("listings")
      .select("id, city, district, rent, currency, photos, house_type, rooms")
      .eq("id", conv.listing_id)
      .maybeSingle();
    listing = l;
    console.log("[conversation-detail] listing from conv.listing_id:", listing);
  }

  // FALLBACK: if no listing, find the OTHER user's listing
  if (!listing) {
    const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
    console.log("[conversation-detail] no listing_id, looking up otherUserId:", otherUserId);

    const { data: otherListing } = await supabaseAdmin
      .from("listings")
      .select("id, city, district, rent, currency, photos, house_type, rooms")
      .eq("user_id", otherUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    listing = otherListing;
    console.log("[conversation-detail] fallback listing:", listing);

    // Save to conversation so next call hits the fast path
    if (otherListing) {
      await supabaseAdmin
        .from("conversations")
        .update({ listing_id: otherListing.id })
        .eq("id", conversationId);
      console.log("[conversation-detail] saved listing_id to conversation");
    }
  }

  console.log("[conversation-detail] final listing:", listing);
  return NextResponse.json({ conversation: conv, listing });
}
