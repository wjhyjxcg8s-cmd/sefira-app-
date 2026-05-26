import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }

    const { error: sendError } = await resend.emails.send({
      from: "Sefira <support@getsefira.com>",
      to: email,
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
      console.error("[send-delete-code] resend:", sendError.message);
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-delete-code] unhandled:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
