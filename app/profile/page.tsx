"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

const translations = {
  tr: {
    title: "Profilim",
    displayName: "Görünen Ad",
    displayNamePlaceholder: "Diğer kullanıcıların göreceği isim",
    birthDate: "Doğum Tarihi",
    profilePhoto: "Profil Fotoğrafı",
    uploadPhoto: "Fotoğraf Yükle",
    changePhoto: "Fotoğrafı Değiştir",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Kaydedildi!",
    notLoggedIn: "Profilinizi görüntülemek için giriş yapınız.",
    goHome: "Ana Sayfaya Git",
    error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    photoError: "Fotoğraf yüklenirken hata oluştu.",
    emailLabel: "E-posta",
    memberSince: "Üyelik",
    createListing: "İlan Ver",
    signOut: "Çıkış Yap",
  },
  en: {
    title: "My Profile",
    displayName: "Display Name",
    displayNamePlaceholder: "Name shown to other users",
    birthDate: "Date of Birth",
    profilePhoto: "Profile Photo",
    uploadPhoto: "Upload Photo",
    changePhoto: "Change Photo",
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    notLoggedIn: "Please sign in to view your profile.",
    goHome: "Go to Home",
    error: "An error occurred. Please try again.",
    photoError: "Error uploading photo.",
    emailLabel: "Email",
    memberSince: "Member since",
    createListing: "Create Listing",
    signOut: "Sign Out",
  },
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const t = translations[lang];

  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { setProfileLoading(false); return; }

    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? "");
          setBirthDate(data.birth_date ?? "");
          setAvatarUrl(data.avatar_url ?? null);
        } else {
          setDisplayName(user.user_metadata?.full_name ?? "");
        }
        setProfileLoading(false);
      });
  }, [user, loading]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const filePath = `${user.id}/${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error('Avatar upload error:', JSON.stringify(uploadError));
        setError(t.photoError);
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      finalAvatarUrl = publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          display_name: displayName,
          birth_date: birthDate ? new Date(birthDate).toISOString().split("T")[0] : null,
          avatar_url: finalAvatarUrl,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("SUPABASE ERROR:", error.message, error.details, error.hint);
      setError(error.message);
    } else {
      setSaved(true);
      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <p className="text-stone-600 text-center font-medium">{t.notLoggedIn}</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
        >
          {t.goHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200 shadow-sm shadow-stone-200/80">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-all duration-300">
              S
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Sefira
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/create-listing"
              className="hidden sm:block text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
            >
              {t.createListing}
            </Link>
            <button
              onClick={() => setLang((l) => (l === "tr" ? "en" : "tr"))}
              className="flex items-center gap-1.5 text-xs font-bold bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-all duration-200"
            >
              <span className="text-sm leading-none">{lang === "tr" ? "🇹🇷" : "🇬🇧"}</span>
              <span>{lang === "tr" ? "TR" : "EN"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-stone-900 mb-6">{t.title}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {/* Avatar + identity strip */}
          <div className="p-6 sm:p-8 border-b border-stone-100 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {avatarPreview || avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview ?? avatarUrl!}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-2xl text-white shadow-md shadow-orange-500/30">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:border-orange-400 transition-all"
                title={avatarPreview || avatarUrl ? t.changePhoto : t.uploadPhoto}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3 text-stone-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 16H7v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-stone-900 truncate">
                {displayName || user.email?.split("@")[0]}
              </p>
              <p className="text-sm text-stone-500 truncate mt-0.5">{user.email}</p>
              {joinDate && (
                <p className="text-xs text-stone-400 mt-1">
                  {t.memberSince} {joinDate}
                </p>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold mt-1.5 transition-colors"
              >
                {avatarPreview || avatarUrl ? t.changePhoto : t.uploadPhoto}
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="p-6 sm:p-8 flex flex-col gap-5">
            {/* Display name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                {t.displayName}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.displayNamePlaceholder}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={user.email ?? ""}
                readOnly
                className="w-full border border-stone-100 bg-stone-50 rounded-xl px-4 py-3 text-stone-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                {t.birthDate}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 shadow-lg text-sm ${
                saved
                  ? "bg-emerald-500 shadow-emerald-500/25"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/25 hover:opacity-90 active:scale-95"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t.saving}
                </span>
              ) : saved ? (
                <span className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {t.saved}
                </span>
              ) : (
                t.save
              )}
            </button>

            {/* Create listing button */}
            <Link
              href="/create-listing"
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm text-center bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {t.createListing}
            </Link>

            {/* Logout button */}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-400 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              {t.signOut}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
