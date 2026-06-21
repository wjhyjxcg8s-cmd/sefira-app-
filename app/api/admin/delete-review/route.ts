import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";
const ADMIN_EMAIL = "supportsefira@gmail.com";

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await supabaseUser.auth.getUser();
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const { reviewId, updates } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    if (updates) {
      // Edit review
      const { error } = await supabaseAdmin
        .from("reviews")
        .update(updates)
        .eq("id", reviewId);
      return NextResponse.json({ error: error?.message ?? null });
    } else {
      // Delete review
      const { error } = await supabaseAdmin
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      return NextResponse.json({ error: error?.message ?? null });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
