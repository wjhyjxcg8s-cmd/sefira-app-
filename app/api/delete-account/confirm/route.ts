import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ceetzophaybywfuhezhv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Authenticated client — uses the user's own JWT, no service role needed.
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reasons, rating, feedback } = await req.json();

    // Capture profile snapshot and listings count BEFORE deletion.
    const { data: profileSnap } = await supabaseUser
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { count: listingsCount } = await supabaseUser
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const profileSnapshot = profileSnap
      ? { ...profileSnap, listings_count: listingsCount ?? 0 }
      : null;

    // Save feedback BEFORE deletion while the JWT is still valid.
    const { error: feedbackError } = await supabaseUser
      .from("deletion_feedback")
      .insert([{
        email: user.email,
        reasons: reasons ?? [],
        rating: rating ?? null,
        feedback: feedback || null,
        deleted_at: new Date().toISOString(),
        profile_snapshot: profileSnapshot,
      }]);
    if (feedbackError) {
      console.error("[confirm] feedback insert failed:", JSON.stringify(feedbackError));
    }

    // Delete the user via the same authenticated client — no service role needed.
    const { error: deleteError } = await supabaseUser.rpc("delete_user");
    if (deleteError) {
      console.error("[confirm] delete_user rpc failed:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[confirm] unhandled:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
