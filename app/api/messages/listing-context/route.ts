import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { listingId } = await request.json();
    if (!listingId) return NextResponse.json({ listing: null });

    const { data } = await supabaseAdmin
      .from("listings")
      .select("id, city, district, rent, currency, photos, house_type, type")
      .eq("id", listingId)
      .maybeSingle();

    return NextResponse.json({ listing: data ?? null });
  } catch (e: any) {
    console.error("[messages/listing-context] error:", e);
    return NextResponse.json({ listing: null });
  }
}
