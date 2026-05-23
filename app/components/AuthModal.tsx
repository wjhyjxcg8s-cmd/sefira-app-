"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";

const authT = {
  tr: {
    loginTab: "Giriş Yap",
    registerTab: "Kayıt Ol",
    nameLabel: "Ad Soyad",
    namePlaceholder: "Adınız Soyadınız",
    emailLabel: "E-posta",
    emailPlaceholder: "ornek@email.com",
    passwordLabel: "Şifre",
    passwordPlaceholder: "En az 6 karakter",
    loginBtn: "Giriş Yap",
    registerBtn: "Kayıt Ol",
    successRegister: "Kayıt başarılı! Lütfen e-postanızı doğrulayın.",
    switchToRegister: "Hesabınız yok mu?",
    switchToLogin: "Zaten hesabınız var mı?",
    switchRegisterLink: "Kayıt Ol",
    switchLoginLink: "Giriş Yap",
    subtitle: "Sefira'ya hoş geldiniz",
    subtitleRegister: "Hemen ücretsiz başlayın",
  },
  en: {
    loginTab: "Sign In",
    registerTab: "Create Account",
    nameLabel: "Full Name",
    namePlaceholder: "Your full name",
    emailLabel: "Email",
    emailPlaceholder: "example@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    loginBtn: "Sign In",
    registerBtn: "Create Account",
    successRegister: "Registration successful! Please verify your email.",
    switchToRegister: "Don't have an account?",
    switchToLogin: "Already have an account?",
    switchRegisterLink: "Create Account",
    switchLoginLink: "Sign In",
    subtitle: "Welcome back to Sefira",
    subtitleRegister: "Start for free today",
  },
};

interface AuthModalProps {
  lang: "tr" | "en";
  onClose: () => void;
}

export default function AuthModal({ lang, onClose }: AuthModalProps) {
  const t = authT[lang];
  const { signIn, signUp } = useAuth();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        onClose();
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
      }
    }

    setLoading(false);
  };

  const switchTab = (next: "login" | "register") => {
    setTab(next);
    setError(null);
    setSuccess(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">

        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/30">
              S
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Sefira
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-stone-900 mb-1">
            {tab === "login" ? t.subtitle : t.subtitleRegister}
          </h2>

          {/* Tabs */}
          <div className="flex bg-stone-100 rounded-xl p-1 gap-1 mb-6 mt-4">
            {(["login", "register"] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => switchTab(tabKey)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  tab === tabKey
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {tabKey === "login" ? t.loginTab : t.registerTab}
              </button>
            ))}
          </div>

          {/* Success state */}
          {success ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-stone-700 font-medium text-sm">{t.successRegister}</p>
              <button
                onClick={() => switchTab("login")}
                className="mt-4 text-sm font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2"
              >
                {t.switchLoginLink}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (register only) */}
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wide">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="text-xs text-rose-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
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
                    {tab === "login" ? t.loginBtn : t.registerBtn}
                  </span>
                ) : (
                  tab === "login" ? t.loginBtn : t.registerBtn
                )}
              </button>

              {/* Switch tab link */}
              <p className="text-center text-xs text-stone-500 pt-1">
                {tab === "login" ? t.switchToRegister : t.switchToLogin}{" "}
                <button
                  type="button"
                  onClick={() => switchTab(tab === "login" ? "register" : "login")}
                  className="font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2"
                >
                  {tab === "login" ? t.switchRegisterLink : t.switchLoginLink}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
