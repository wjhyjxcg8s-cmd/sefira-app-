import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { storyId } = await req.json();
    if (!storyId) return Response.json({ error: "No storyId" }, { status: 400 });

    const { data: story, error: fetchError } = await supabaseAdmin
      .from("weekly_stories")
      .select("id, views")
      .eq("id", storyId)
      .single();

    console.log("Current story:", story, fetchError?.message);

    if (!story) return Response.json({ error: "Story not found" }, { status: 404 });

    const currentViews = typeof story.views === "number" ? story.views : 0;
    const newViews = currentViews + 1;

    const { error: updateError } = await supabaseAdmin
      .from("weekly_stories")
      .update({ views: newViews })
      .eq("id", storyId);

    console.log("Updated views to:", newViews, "error:", updateError?.message);

    return Response.json({ success: true, views: newViews });
  } catch (err) {
    console.error("View API error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
