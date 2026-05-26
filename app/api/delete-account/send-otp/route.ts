import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SUPABASE_URL = "https://ceetzophaybywfuhezhv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Both clients are initialised here so process.env is read at request time,
    // not at module-load time. This is required for env vars to be available on
    // the production server.
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const resend = new Resend(process.env.RESEND_API_KEY);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        _delete_otp: code,
        _delete_otp_expires: expiresAt,
      },
    });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: sendError } = await resend.emails.send({
      from: "Sefira <support@getsefira.com>",
      to: user.email!,
      subject: "Sefira — Hesap Silme Kodu / Account Deletion Code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="margin-bottom:24px">
            <span style="font-size:20px;font-weight:900;color:#f97316">Sefira</span>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:8px">
            Hesap Silme Doğrulama / Account Deletion Verification
          </h2>
          <p style="color:#57534e;font-size:14px;margin-bottom:24px">
            Hesabınızı silmek için aşağıdaki 6 haneli kodu kullanın.<br>
            Use the 6-digit code below to delete your account.<br>
            <span dir="rtl">برای حذف حساب خود از کد ۶ رقمی زیر استفاده کنید.</span>
          </p>
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#ea580c">${code}</span>
          </div>
          <p style="color:#a8a29e;font-size:12px">
            Bu kod 10 dakika geçerlidir. / This code is valid for 10 minutes.<br>
            <span dir="rtl">این کد ۱۰ دقیقه معتبر است.</span>
          </p>
        </div>
      `,
    });

    if (sendError) return NextResponse.json({ error: sendError.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
