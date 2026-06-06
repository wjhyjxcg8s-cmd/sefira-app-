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

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    // Fetch unread messages not sent by this user, in conversations they belong to
    const { data: unread, error } = await supabaseAdmin
      .from("user_messages")
      .select(
        `id, content, created_at, sender_id, conversation_id, is_read,
         conversations!inner(user1_id, user2_id)`
      )
      .eq("is_read", false)
      .neq("sender_id", userId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`, {
        foreignTable: "conversations",
      })
      .order("created_at", { ascending: false })
      .limit(10);

    console.log("[messages/unread] unread count:", unread?.length, error?.message);

    if (!unread || unread.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    // Fetch sender profiles
    const senderIds = [...new Set(unread.map((m: any) => m.sender_id))];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", senderIds);

    const notifications = unread.map((msg: any) => {
      const sender = profiles?.find((p: any) => p.user_id === msg.sender_id);
      return {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: sender?.display_name || "Kullanıcı",
        senderAvatar: sender?.avatar_url || null,
        content: msg.content,
        createdAt: msg.created_at,
      };
    });

    return NextResponse.json({ notifications });
  } catch (e: any) {
    console.error("[messages/unread] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
