import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
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
