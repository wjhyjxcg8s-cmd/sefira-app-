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
      subject: "Sefira - Hesap Silme Doğrulama Kodu",
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: #f97316; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Sefira</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2>Hesap Silme Doğrulama Kodu</h2>
            <p>Doğrulama kodunuz:</p>
            <h1 style="color: #f97316; font-size: 48px; letter-spacing: 10px;">${code}</h1>
            <p>Bu kod 10 dakika geçerlidir.</p>
            <p>Eğer bu işlemi siz yapmadıysanız bu e-postayı dikkate almayınız.</p>
          </div>
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
