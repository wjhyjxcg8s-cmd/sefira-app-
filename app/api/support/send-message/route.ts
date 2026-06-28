import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const AUTO_REPLY: Record<string, string> = {
  tr: "Mesajınız için teşekkür ederiz! Bir öneriniz, sorununuz veya başka bir konunuz varsa lütfen açıkça belirtin. En kısa sürede inceleyip size yanıt vereceğiz.",
  en: "Thank you for your message! If you have a suggestion, problem, or any other matter, please describe it clearly. We will review it and get back to you as soon as possible.",
  fa: "از پیام شما متشکریم! لطفاً اگر پیشنهاد، مشکل یا هر موضوع دیگری دارید، به صورت واضح توضیح دهید. در اولین فرصت بررسی کرده و پاسخ خواهیم داد.",
  ar: "شكراً على رسالتك! إذا كان لديك اقتراح أو مشكلة أو أي موضوع آخر، يرجى شرحه بوضوح. سنراجعه ونرد عليك في أقرب وقت ممكن.",
  de: "Vielen Dank für Ihre Nachricht! Wenn Sie einen Vorschlag, ein Problem oder ein anderes Anliegen haben, beschreiben Sie es bitte klar. Wir werden es so schnell wie möglich prüfen und Ihnen antworten.",
  ru: "Спасибо за ваше сообщение! Если у вас есть предложение, проблема или другой вопрос, пожалуйста, опишите его четко. Мы рассмотрим его и ответим вам как можно скорее.",
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user session
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { message, lang } = body;
  if (!message?.trim()) return NextResponse.json({ error: "Missing message" }, { status: 400 });

  // Insert the user's message
  const { data: userMsg, error: insertError } = await supabaseAdmin
    .from("admin_messages")
    .insert([{
      user_id: user.id,
      title: "reply",
      message: message.trim(),
      is_global: false,
      sender: "user",
      is_read: false,
    }])
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Check if this is the user's first message (count = 1 after insert)
  const { count: userMsgCount } = await supabaseAdmin
    .from("admin_messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("sender", "user");

  const isFirstMessage = (userMsgCount ?? 0) === 1;

  // Find the most recent auto-reply sent to this user
  const { data: lastAutoReply } = await supabaseAdmin
    .from("admin_messages")
    .select("created_at")
    .eq("user_id", user.id)
    .eq("sender", "admin")
    .eq("title", "auto-reply")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const lastAutoReplyAt = lastAutoReply?.created_at ? new Date(lastAutoReply.created_at) : null;
  const hoursElapsed = lastAutoReplyAt
    ? (Date.now() - lastAutoReplyAt.getTime()) / (1000 * 60 * 60)
    : Infinity;

  const shouldAutoReply = isFirstMessage || hoursElapsed > 24;

  let autoReplyMsg = null;
  if (shouldAutoReply) {
    const replyText = AUTO_REPLY[lang] ?? AUTO_REPLY["en"];
    const { data } = await supabaseAdmin
      .from("admin_messages")
      .insert([{
        user_id: user.id,
        title: "auto-reply",
        message: replyText,
        is_global: false,
        sender: "admin",
        is_read: false,
      }])
      .select()
      .single();
    autoReplyMsg = data;
  }

  return NextResponse.json({ userMsg, autoReplyMsg });
}
