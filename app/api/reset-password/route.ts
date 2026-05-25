import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: "http://178.105.209.146:3000/reset-password" },
    });

    if (linkError || !data?.properties?.action_link) {
      return NextResponse.json({ error: linkError?.message ?? "Could not generate link" }, { status: 500 });
    }

    const { error: sendError } = await resend.emails.send({
      from: "Sefira <support@getsefira.com>",
      to: email,
      subject: "Sefira - Şifre Sıfırlama / Password Reset",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <div style="margin-bottom:24px">
            <span style="font-size:20px;font-weight:900;background:linear-gradient(to right,#f97316,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Sefira</span>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:8px">Şifre Sıfırlama / Password Reset</h2>
          <p style="color:#57534e;font-size:14px;margin-bottom:24px">
            Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın.<br>
            Click the link below to reset your password.
          </p>
          <a href="${data.properties.action_link}"
             style="display:inline-block;padding:12px 28px;background:linear-gradient(to right,#f97316,#f59e0b);color:#fff;font-weight:700;font-size:14px;border-radius:12px;text-decoration:none">
            Şifremi Sıfırla / Reset Password
          </a>
          <p style="color:#a8a29e;font-size:12px;margin-top:32px">
            Bu bağlantı 1 saat geçerlidir. / This link is valid for 1 hour.
          </p>
        </div>
      `,
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
