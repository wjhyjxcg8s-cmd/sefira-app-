import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SUPABASE_URL = "https://ceetzophaybywfuhezhv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth clients — all initialised here so env vars are read at request time
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ── 2. Verify caller session
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user || !user.email) {
      console.error("[send-otp] auth:", userError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. Generate OTP and store in user metadata
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        _delete_otp: code,
        _delete_otp_expires: expiresAt,
      },
    });
    if (updateError) {
      console.error("[send-otp] metadata update:", updateError.message);
      return NextResponse.json({ error: "Could not store OTP: " + updateError.message }, { status: 500 });
    }

    // ── 4. Send email via Resend
    const { error: sendError } = await resend.emails.send({
      from: "Sefira <support@getsefira.com>",
      to: user.email,
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
    if (sendError) {
      console.error("[send-otp] resend:", sendError.message);
      return NextResponse.json({ error: "Could not send email: " + sendError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-otp] unhandled:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
