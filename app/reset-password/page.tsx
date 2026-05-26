"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

const t = {
  tr: {
    title: "Şifremi Güncelle",
    newPassword: "Yeni Şifre",
    confirmPassword: "Yeni Şifreyi Onayla",
    placeholder: "En az 6 karakter",
    updateBtn: "Şifremi Güncelle",
    updating: "Güncelleniyor...",
    passwordMismatch: "Şifreler eşleşmiyor.",
    minLength: "Şifre en az 6 karakter olmalıdır.",
    success: "Şifreniz güncellendi! Ana sayfaya yönlendiriliyorsunuz...",
    error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    goHome: "Ana Sayfaya Git",
    invalidLink: "Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar deneyin.",
  },
  en: {
    title: "Update Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    placeholder: "At least 6 characters",
    updateBtn: "Update Password",
    updating: "Updating...",
    passwordMismatch: "Passwords do not match.",
    minLength: "Password must be at least 6 characters.",
    success: "Your password has been updated! Redirecting to home...",
    error: "An error occurred. Please try again.",
    goHome: "Go to Home",
    invalidLink: "Invalid or expired link. Please try again.",
  },
  fa: {
    title: "بروزرسانی رمز عبور",
    newPassword: "رمز عبور جدید",
    confirmPassword: "تأیید رمز عبور جدید",
    placeholder: "حداقل ۶ کاراکتر",
    updateBtn: "بروزرسانی رمز عبور",
    updating: "در حال بروزرسانی...",
    passwordMismatch: "رمزهای عبور مطابقت ندارند.",
    minLength: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
    success: "رمز عبور شما بروزرسانی شد! در حال انتقال به صفحه اصلی...",
    error: "خطایی رخ داد. لطفاً دوباره امتحان کنید.",
    goHome: "رفتن به صفحه اصلی",
    invalidLink: "لینک نامعتبر یا منقضی شده. لطفاً دوباره تلاش کنید.",
  },
  // Always add "ar" key when adding new translations
  ar: {
    title: "تحديث كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    placeholder: "٦ أحرف على الأقل",
    updateBtn: "تحديث كلمة المرور",
    updating: "جارٍ التحديث...",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    minLength: "يجب أن تكون كلمة المرور ٦ أحرف على الأقل.",
    success: "تم تحديث كلمة مرورك! جارٍ التحويل إلى الصفحة الرئيسية...",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    goHome: "الذهاب إلى الرئيسية",
    invalidLink: "رابط غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.",
  },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en" | "fa" | "ar">("tr");
  const tr = t[lang];

  // null = still checking, true = valid token, false = invalid/missing
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as "tr" | "en" | "fa" | "ar" | null;
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar") setLang(saved);
  }, []);

  useEffect(() => {
    // Abort early if there's an explicit error in the hash (e.g. expired link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("error")) {
      setTokenValid(false);
      return;
    }

    // PASSWORD_RECOVERY fires for both implicit (#access_token) and PKCE (?code) flows
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setTokenValid(true);
      }
    });

    // Fallback: if a session already exists (e.g. page refreshed after exchange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setTokenValid(true);
      // If neither event nor session resolves in time, mark invalid after a short grace period
      else setTimeout(() => setTokenValid((v) => v ?? false), 3000);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.push("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(tr.minLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(tr.passwordMismatch);
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || tr.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4" dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-orange-500/30">
                  S
                </div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Sefira
                </span>
              </Link>
            </div>

            {tokenValid === false ? (
              <div className="py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8 text-rose-500">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
                <p className="text-stone-700 font-medium text-sm mb-5">{tr.invalidLink}</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
                >
                  {tr.goHome}
                </Link>
              </div>
            ) : tokenValid === null ? (
              <div className="py-12 flex justify-center">
                <svg className="animate-spin w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <>
            <h1 className="text-2xl font-black text-stone-900 mb-6">{tr.title}</h1>

            {success ? (
              <div className="py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-stone-700 font-medium text-sm">{tr.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">
                    {tr.newPassword}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={tr.placeholder}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">
                    {tr.confirmPassword}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tr.placeholder}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    <p className="text-xs text-rose-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      {tr.updating}
                    </span>
                  ) : tr.updateBtn}
                </button>

                <p className="text-center">
                  <Link href="/" className="text-sm font-semibold text-stone-400 hover:text-stone-700 transition-colors">
                    {tr.goHome}
                  </Link>
                </p>
              </form>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
