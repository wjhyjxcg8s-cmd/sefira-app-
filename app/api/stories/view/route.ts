import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  const { storyId } = await req.json();
  if (!storyId) return Response.json({ error: "No storyId" }, { status: 400 });

  const { data: current, error: fetchErr } = await supabaseAdmin
    .from("weekly_stories")
    .select("views")
    .eq("id", storyId)
    .single();

  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });

  const newViews = (current?.views ?? 0) + 1;

  const { error: updateErr } = await supabaseAdmin
    .from("weekly_stories")
    .update({ views: newViews })
    .eq("id", storyId);

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });

  return Response.json({ success: true, views: newViews });
}
