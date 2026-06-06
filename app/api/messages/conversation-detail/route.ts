import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { conversationId } = await request.json();
    console.log("[conversation-detail] conversationId:", conversationId);

    if (!conversationId) {
      return NextResponse.json({ conversation: null, listing: null });
    }

    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();

    console.log("[conversation-detail] conv:", conv);

    let listing = null;
    if (conv?.listing_id) {
      const { data: l } = await supabaseAdmin
        .from("listings")
        .select("id, city, district, rent, currency, photos, house_type")
        .eq("id", conv.listing_id)
        .maybeSingle();
      listing = l;
      console.log("[conversation-detail] listing:", listing);
    }

    return NextResponse.json({ conversation: conv ?? null, listing });
  } catch (e: any) {
    console.error("[conversation-detail] error:", e);
    return NextResponse.json({ conversation: null, listing: null });
  }
}
