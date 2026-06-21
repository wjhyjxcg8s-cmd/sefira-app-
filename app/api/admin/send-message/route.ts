import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ceetzophaybywfuhezhv.supabase.co";
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

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log('API RECEIVED:', JSON.stringify(body));
    const { userId, userEmail, title, message, sendToAll, convId } = body;

    // Write reply into a listing conversation (user_messages table)
    if (convId) {
      if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });
      const { error: msgErr } = await supabaseAdmin.from("user_messages").insert({
        conversation_id: convId,
        sender_id: adminUser.id,
        content: message,
      });
      if (!msgErr) {
        await supabaseAdmin
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      }
      return NextResponse.json({ error: msgErr?.message ?? null });
    }

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
    }

    if (sendToAll) {
      const { error } = await supabaseAdmin.from("admin_messages").insert([{
        user_id: null,
        email: null,
        title,
        message,
        is_global: true,
        sender: "admin",
      }]);
      return NextResponse.json({ error: error?.message ?? null });
    } else {
      if (!userId) {
        return NextResponse.json({ error: "Missing userId for single user message" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from("admin_messages").insert([{
        user_id: userId,
        email: userEmail ?? null,
        title,
        message,
        is_global: false,
        sender: "admin",
      }]);
      return NextResponse.json({ error: error?.message ?? null });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
