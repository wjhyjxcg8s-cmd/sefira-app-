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
    gender: "Cinsiyet",
    genderMale: "Erkek",
    genderFemale: "Kadın",
    genderOther: "Diğer",
    profilePhoto: "Profil Fotoğrafı",
    uploadPhoto: "Fotoğraf Yükle",
    changePhoto: "Fotoğrafı Değiştir",
    choosePhoto: "Fotoğraf Seç",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Kaydedildi!",
    cancel: "İptal",
    notLoggedIn: "Profilinizi görüntülemek için giriş yapınız.",
    goHome: "Ana Sayfaya Git",
    error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    photoError: "Fotoğraf yüklenirken hata oluştu.",
    emailLabel: "E-posta (değiştirilemez)",
    memberSince: "Üyelik",
    createListing: "İlan Ver",
    myListings: "İlanlarım",
    savedListings: "Kaydedilenler",
    signOut: "Çıkış Yap",
    confirmEditTitle: "Bu bilgiyi düzenlemek istediğinizden emin misiniz?",
    confirmEditBtn: "Evet, Düzenle",
    cancelEditBtn: "İptal",
    notSet: "Belirtilmemiş",
    changePassword: "Şifre Değiştir",
    currentPassword: "Mevcut Şifre",
    newPassword: "Yeni Şifre",
    confirmNewPassword: "Yeni Şifreyi Onayla",
    passwordPlaceholder: "En az 6 karakter",
    passwordMismatch: "Şifreler eşleşmiyor.",
    passwordMinLength: "Şifre en az 6 karakter olmalıdır.",
    passwordUpdated: "Şifre başarıyla güncellendi.",
    wrongPassword: "Mevcut şifre hatalı.",
    deleteAccount: "Hesabı Sil",
    deleteWarningTitle: "Hesabınızı silmek istediğinizden emin misiniz?",
    deleteContinue: "Devam Et",
    deleteCancel: "İptal",
    deleteReasonTitle: "Neden ayrılıyorsunuz?",
    deleteReason1: "Uygulamayı beğenmedim, tasarımı zayıf",
    deleteReason2: "Uygun bir şey bulamadım",
    deleteReason3: "Artık ihtiyacım yok",
    deleteRatingTitle: "Bize 1-10 arası puan verir misiniz?",
    deleteFeedbackTitle: "Eklemek istediğiniz bir şey var mı? (İsteğe bağlı)",
    deleteFeedbackPlaceholder: "Görüşlerinizi buraya yazın...",
    deleteOtpTitle: "E-posta adresinize doğrulama kodu gönderildi.",
    deleteOtpPlaceholder: "6 haneli kodu girin",
    deleteConfirmBtn: "Hesabı Sil",
    deleteOtpInvalid: "Geçersiz kod. Lütfen tekrar deneyin.",
    deleteOtpExpired: "Kod süresi doldu. Lütfen tekrar gönderin.",
    deleteSending: "Gönderiliyor...",
    deleteDeleting: "Siliniyor...",
  },
  en: {
    title: "My Profile",
    displayName: "Display Name",
    displayNamePlaceholder: "Name shown to other users",
    birthDate: "Date of Birth",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    profilePhoto: "Profile Photo",
    uploadPhoto: "Upload Photo",
    changePhoto: "Change Photo",
    choosePhoto: "Choose Photo",
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    cancel: "Cancel",
    notLoggedIn: "Please sign in to view your profile.",
    goHome: "Go to Home",
    error: "An error occurred. Please try again.",
    photoError: "Error uploading photo.",
    emailLabel: "Email (cannot be changed)",
    memberSince: "Member since",
    createListing: "Create Listing",
    myListings: "My Listings",
    savedListings: "Saved Listings",
    signOut: "Sign Out",
    confirmEditTitle: "Are you sure you want to edit this information?",
    confirmEditBtn: "Yes, Edit",
    cancelEditBtn: "Cancel",
    notSet: "Not set",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordPlaceholder: "At least 6 characters",
    passwordMismatch: "Passwords do not match.",
    passwordMinLength: "Password must be at least 6 characters.",
    passwordUpdated: "Password updated successfully.",
    wrongPassword: "Current password is incorrect.",
    deleteAccount: "Delete Account",
    deleteWarningTitle: "Are you sure you want to delete your account?",
    deleteContinue: "Continue",
    deleteCancel: "Cancel",
    deleteReasonTitle: "Why are you leaving?",
    deleteReason1: "I didn't like the app, design is weak",
    deleteReason2: "I couldn't find anything suitable",
    deleteReason3: "I no longer need it",
    deleteRatingTitle: "How would you rate us from 1 to 10?",
    deleteFeedbackTitle: "Any additional feedback? (Optional)",
    deleteFeedbackPlaceholder: "Write your thoughts here...",
    deleteOtpTitle: "A verification code has been sent to your email.",
    deleteOtpPlaceholder: "Enter 6-digit code",
    deleteConfirmBtn: "Delete Account",
    deleteOtpInvalid: "Invalid code. Please try again.",
    deleteOtpExpired: "Code expired. Please send again.",
    deleteSending: "Sending...",
    deleteDeleting: "Deleting...",
  },
  fa: {
    title: "پروفایل من",
    displayName: "نام نمایشی",
    displayNamePlaceholder: "نامی که کاربران دیگر می‌بینند",
    birthDate: "تاریخ تولد",
    gender: "جنسیت",
    genderMale: "مرد",
    genderFemale: "زن",
    genderOther: "سایر",
    profilePhoto: "عکس پروفایل",
    uploadPhoto: "آپلود عکس",
    changePhoto: "تغییر عکس",
    choosePhoto: "انتخاب عکس",
    save: "ذخیره",
    saving: "در حال ذخیره...",
    saved: "ذخیره شد!",
    cancel: "انصراف",
    notLoggedIn: "برای مشاهده پروفایل خود لطفاً وارد شوید.",
    goHome: "رفتن به صفحه اصلی",
    error: "خطایی رخ داد. لطفاً دوباره امتحان کنید.",
    photoError: "خطا در آپلود عکس.",
    emailLabel: "ایمیل (قابل تغییر نیست)",
    memberSince: "عضو از",
    createListing: "ثبت آگهی",
    myListings: "آگهی‌های من",
    savedListings: "آگهی‌های ذخیره شده",
    signOut: "خروج",
    confirmEditTitle: "آیا مطمئن هستید که می‌خواهید این اطلاعات را ویرایش کنید؟",
    confirmEditBtn: "بله، ویرایش",
    cancelEditBtn: "انصراف",
    notSet: "تنظیم نشده",
    changePassword: "تغییر رمز عبور",
    currentPassword: "رمز عبور فعلی",
    newPassword: "رمز عبور جدید",
    confirmNewPassword: "تأیید رمز عبور جدید",
    passwordPlaceholder: "حداقل ۶ کاراکتر",
    passwordMismatch: "رمزهای عبور مطابقت ندارند.",
    passwordMinLength: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
    passwordUpdated: "رمز عبور با موفقیت بروزرسانی شد.",
    wrongPassword: "رمز عبور فعلی اشتباه است.",
    deleteAccount: "حذف حساب",
    deleteWarningTitle: "آیا مطمئن هستید که می‌خواهید حساب خود را حذف کنید؟",
    deleteContinue: "ادامه",
    deleteCancel: "لغو",
    deleteReasonTitle: "چرا می‌روید؟",
    deleteReason1: "برنامه را دوست نداشتم، طراحیش ضعیفه",
    deleteReason2: "در برنامه نتوانستم مورد مناسبی پیدا کنم",
    deleteReason3: "دیگر لازم ندارم",
    deleteRatingTitle: "از ۱ تا ۱۰ به ما چند امتیاز می‌دهید؟",
    deleteFeedbackTitle: "نکته‌ای دارید؟ (اختیاری)",
    deleteFeedbackPlaceholder: "نظر خود را اینجا بنویسید...",
    deleteOtpTitle: "کد تأیید به ایمیل شما ارسال شد.",
    deleteOtpPlaceholder: "کد ۶ رقمی را وارد کنید",
    deleteConfirmBtn: "حذف حساب",
    deleteOtpInvalid: "کد نادرست است. لطفاً دوباره امتحان کنید.",
    deleteOtpExpired: "کد منقضی شده. لطفاً مجدداً ارسال کنید.",
    deleteSending: "در حال ارسال...",
    deleteDeleting: "در حال حذف...",
  },
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en" | "fa">("tr");
  const t = translations[lang];
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as "tr" | "en" | "fa" | null;
    if (saved === "tr" || saved === "en" || saved === "fa") setLang(saved);
  }, []);
  useEffect(() => { localStorage.setItem("sefira-lang", lang); }, [lang]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Profile data state
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit-on-confirm state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [confirmField, setConfirmField] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editGender, setEditGender] = useState<"male" | "female" | "other" | "">("");

  // Change password state
  const [editCurrentPassword, setEditCurrentPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete account state
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteRating, setDeleteRating] = useState<number | null>(null);
  const [deleteExtraFeedback, setDeleteExtraFeedback] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const savedEmailRef = useRef("");

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
          setGender((data.gender ?? "") as "male" | "female" | "other" | "");
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

  const handleConfirmEdit = () => {
    if (!confirmField) return;
    if (confirmField === "displayName") setEditDisplayName(displayName);
    if (confirmField === "birthDate") setEditBirthDate(birthDate);
    if (confirmField === "gender") setEditGender(gender);
    if (confirmField === "changePassword") {
      setEditCurrentPassword("");
      setEditNewPassword("");
      setEditConfirmPassword("");
      setPasswordError(null);
    }
    setEditingField(confirmField);
    setConfirmField(null);
  };

  const handleSaveField = async (field: string) => {
    setSaving(true);
    setError(null);

    if (field === "changePassword") {
      setPasswordError(null);
      if (editNewPassword.length < 6) {
        setPasswordError(t.passwordMinLength);
        setSaving(false);
        return;
      }
      if (editNewPassword !== editConfirmPassword) {
        setPasswordError(t.passwordMismatch);
        setSaving(false);
        return;
      }
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.email) { setSaving(false); return; }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: editCurrentPassword,
      });
      if (signInError) {
        setPasswordError(t.wrongPassword);
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: editNewPassword });
      if (updateError) {
        setPasswordError(updateError.message);
        setSaving(false);
        return;
      }

      setSaved(true);
      setEditingField(null);
      setEditCurrentPassword("");
      setEditNewPassword("");
      setEditConfirmPassword("");
      setTimeout(() => setSaved(false), 2000);
      setSaving(false);
      return;
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) { setSaving(false); return; }

    if (field === "avatar") {
      if (!avatarFile) { setEditingField(null); setSaving(false); return; }
      const filePath = `${currentUser.id}/${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) {
        setError(t.photoError);
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({ user_id: currentUser.id, avatar_url: publicUrl }, { onConflict: "user_id" });
      if (dbError) { setError(dbError.message); setSaving(false); return; }
      setAvatarUrl(publicUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      const updates: Record<string, unknown> = { user_id: currentUser.id };
      if (field === "displayName") updates.display_name = editDisplayName;
      if (field === "birthDate") updates.birth_date = editBirthDate ? new Date(editBirthDate).toISOString().split("T")[0] : null;
      if (field === "gender") updates.gender = editGender || null;

      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "user_id" });
      if (dbError) { setError(dbError.message); setSaving(false); return; }

      if (field === "displayName") setDisplayName(editDisplayName);
      if (field === "birthDate") setBirthDate(editBirthDate);
      if (field === "gender") setGender(editGender);
    }

    setSaved(true);
    setEditingField(null);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const handleSendOtp = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const email = user?.email ?? "";
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      localStorage.setItem("delete_code", JSON.stringify({
        code,
        expiry: Date.now() + 600000,
        email,
      }));

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/send-delete-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (!res.ok) { setDeleteError(json.error ?? "Error"); setDeleteLoading(false); return; }
      setDeleteStep(5);
    } catch (e) {
      setDeleteError(String(e));
    }
    setDeleteLoading(false);
  };

  const handleVerifyAndDelete = async () => {
    if (deleteOtp.length !== 6) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const raw = localStorage.getItem("delete_code");
      if (!raw) { setDeleteError(t.deleteOtpInvalid); setDeleteLoading(false); return; }

      const { code, expiry } = JSON.parse(raw) as { code: string; expiry: number };
      if (deleteOtp !== code) { setDeleteError(t.deleteOtpInvalid); setDeleteLoading(false); return; }
      if (Date.now() > expiry) { setDeleteError(t.deleteOtpExpired); setDeleteLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || savedEmailRef.current || "unknown";

      const { error: fbError } = await supabase
        .from("deletion_feedback")
        .insert([{
          email: userEmail,
          reasons: deleteReasons,
          rating: deleteRating,
          feedback: deleteExtraFeedback || "",
        }]);

      console.log("Email used:", userEmail);
      console.log("Reasons:", deleteReasons);
      console.log("Rating:", deleteRating);
      console.log("FB Error:", JSON.stringify(fbError));

      const { error: rpcError } = await supabase.rpc("delete_user");
      if (rpcError) { setDeleteError(rpcError.message); setDeleteLoading(false); return; }

      localStorage.removeItem("delete_code");
      try { await supabase.auth.signOut(); } catch { /* user already deleted */ }
      router.push("/");
    } catch (e) {
      setDeleteError(String(e));
      setDeleteLoading(false);
    }
  };

  const cancelFieldEdit = (field: string) => {
    if (field === "avatar") {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    if (field === "changePassword") {
      setEditCurrentPassword("");
      setEditNewPassword("");
      setEditConfirmPassword("");
      setPasswordError(null);
    }
    setEditingField(null);
  };

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === "tr" ? "tr-TR" : lang === "fa" ? "fa-IR" : "en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  const formatBirthDate = (raw: string) => {
    if (!raw) return "";
    try {
      return new Date(raw + "T00:00:00").toLocaleDateString(
        lang === "tr" ? "tr-TR" : lang === "fa" ? "fa-IR" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );
    } catch {
      return raw;
    }
  };

  const EditIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

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
    <div className="min-h-screen bg-stone-50" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav dir="ltr" style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform" }} className="fixed top-0 left-0 right-0 w-full z-[9999] bg-white border-b border-stone-200 shadow-sm">
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
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen((o) => !o)}
                className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] font-black transition-all duration-200 hover:bg-stone-200 whitespace-nowrap"
              >
                <span className="text-sm leading-none">
                  {lang === "tr" ? "🇹🇷" : lang === "en" ? "🇬🇧" : "🇮🇷"}
                </span>
                <span className="text-stone-700">
                  {lang === "tr" ? "TR" : lang === "en" ? "EN" : "FA"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className="absolute top-full mt-1 right-0 z-[100] bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden min-w-[90px]">
                  {(["tr", "en", "fa"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangMenuOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 text-[12px] font-bold transition-colors hover:bg-stone-50 ${lang === l ? "text-orange-500" : "text-stone-700"}`}
                    >
                      <span className="text-sm">{l === "tr" ? "🇹🇷" : l === "en" ? "🇬🇧" : "🇮🇷"}</span>
                      {l === "tr" ? "TR" : l === "en" ? "EN" : "FA"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Confirmation modal */}
      {confirmField && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
            <p className="text-stone-800 font-semibold text-sm text-center leading-relaxed">
              {t.confirmEditTitle}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmEdit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
              >
                {t.confirmEditBtn}
              </button>
              <button
                onClick={() => setConfirmField(null)}
                className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition-all active:scale-95"
              >
                {t.cancelEditBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account multi-step modal */}
      {deleteStep > 0 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Step 1 — Warning */}
            {deleteStep === 1 && (
              <div className="p-6 flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-4xl">⚠️</span>
                </div>
                <p className="text-stone-800 font-semibold text-sm leading-relaxed">
                  {t.deleteWarningTitle}
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all"
                  >
                    {t.deleteContinue}
                  </button>
                  <button
                    onClick={() => setDeleteStep(0)}
                    className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    {t.deleteCancel}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Reasons */}
            {deleteStep === 2 && (
              <div className="p-6 flex flex-col gap-4">
                <p className="text-stone-800 font-bold text-base">{t.deleteReasonTitle}</p>
                <div className="flex flex-col gap-3">
                  {([t.deleteReason1, t.deleteReason2, t.deleteReason3] as const).map((label, i) => {
                    const key = String(i + 1);
                    const checked = deleteReasons.includes(key);
                    return (
                      <label key={key} className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${checked ? "bg-orange-500 border-orange-500" : "border-stone-300 group-hover:border-orange-300"}`}>
                          {checked && (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => setDeleteReasons(prev => checked ? prev.filter(r => r !== key) : [...prev, key])}
                        />
                        <span className="text-sm text-stone-700 leading-snug">{label}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  disabled={deleteReasons.length === 0}
                  onClick={() => setDeleteStep(3)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.deleteContinue}
                </button>
              </div>
            )}

            {/* Step 3 — Rating */}
            {deleteStep === 3 && (
              <div className="p-6 flex flex-col gap-5">
                <p className="text-stone-800 font-bold text-base">{t.deleteRatingTitle}</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setDeleteRating(n)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${deleteRating === n ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/25" : "border-stone-200 text-stone-600 hover:border-orange-300 hover:text-orange-600"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  disabled={deleteRating === null}
                  onClick={() => setDeleteStep(4)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.deleteContinue}
                </button>
              </div>
            )}

            {/* Step 4 — Optional feedback */}
            {deleteStep === 4 && (
              <div className="p-6 flex flex-col gap-4">
                <p className="text-stone-800 font-bold text-base">{t.deleteFeedbackTitle}</p>
                <textarea
                  value={deleteExtraFeedback}
                  onChange={e => setDeleteExtraFeedback(e.target.value)}
                  placeholder={t.deleteFeedbackPlaceholder}
                  rows={4}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
                <button
                  disabled={deleteLoading}
                  onClick={handleSendOtp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                >
                  {deleteLoading ? t.deleteSending : t.deleteContinue}
                </button>
                {deleteError && (
                  <p className="text-xs text-rose-600 text-center">{deleteError}</p>
                )}
              </div>
            )}

            {/* Step 5 — OTP verification */}
            {deleteStep === 5 && (
              <div className="p-6 flex flex-col gap-4">
                <p className="text-stone-700 text-sm leading-relaxed">{t.deleteOtpTitle}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={deleteOtp}
                  onChange={e => { setDeleteOtp(e.target.value.replace(/\D/g, "")); setDeleteError(null); }}
                  placeholder={t.deleteOtpPlaceholder}
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.4em] text-stone-900 placeholder-stone-300 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                />
                {deleteError && (
                  <p className="text-xs text-rose-600 text-center">{deleteError}</p>
                )}
                <button
                  disabled={deleteOtp.length !== 6 || deleteLoading}
                  onClick={handleVerifyAndDelete}
                  className="w-full py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? t.deleteDeleting : t.deleteConfirmBtn}
                </button>
                <button
                  onClick={() => { setDeleteStep(0); setDeleteOtp(""); setDeleteError(null); }}
                  className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {t.deleteCancel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
        {/* Back to home */}
        <Link href="/" dir="ltr" className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
            <polyline points={lang === "fa" ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
          </svg>
          <span>{lang === "tr" ? "Ana Sayfa" : lang === "fa" ? "صفحه اصلی" : "Home"}</span>
        </Link>

        <h1 className="text-2xl font-black text-stone-900 mb-6">{t.title}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {/* Avatar section */}
          <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col items-center gap-3">
            <div className="relative flex-shrink-0">
              {avatarPreview || avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview ?? avatarUrl!}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-2xl text-white shadow-md shadow-orange-500/30">
                  {initials}
                </div>
              )}
              <button
                onClick={() => setConfirmField("avatar")}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:border-orange-400 hover:bg-orange-50 transition-all"
                title={avatarPreview || avatarUrl ? t.changePhoto : t.uploadPhoto}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-stone-600">
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

            <div className="text-center">
              <p className="font-bold text-stone-900">
                {displayName || user.email?.split("@")[0]}
              </p>
              <p className="text-sm text-stone-400 mt-0.5">{user.email}</p>
              {joinDate && (
                <p className="text-xs text-stone-400 mt-1">
                  {t.memberSince} {joinDate}
                </p>
              )}
            </div>

            {/* Avatar edit controls */}
            {editingField === "avatar" && (
              <div className="flex flex-col items-center gap-2 w-full">
                {!avatarFile ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"
                    >
                      {t.choosePhoto}
                    </button>
                    <button
                      onClick={() => cancelFieldEdit("avatar")}
                      className="px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-bold hover:bg-stone-50 transition-all active:scale-95"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveField("avatar")}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
                    >
                      {saving ? t.saving : t.save}
                    </button>
                    <button
                      onClick={() => cancelFieldEdit("avatar")}
                      className="px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-500 text-sm font-bold hover:bg-stone-50 transition-all active:scale-95"
                    >
                      {t.cancel}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="divide-y divide-stone-100">
            {/* Display Name */}
            <div className="px-6 sm:px-8 py-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{t.displayName}</p>
                {editingField === "displayName" ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder={t.displayNamePlaceholder}
                      autoFocus
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField("displayName")}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
                      >
                        {saving ? t.saving : t.save}
                      </button>
                      <button
                        onClick={() => cancelFieldEdit("displayName")}
                        className="flex-1 py-2 rounded-lg border-2 border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 transition-all active:scale-95"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-stone-900">
                    {displayName || <span className="text-stone-400 italic font-normal">{t.notSet}</span>}
                  </p>
                )}
              </div>
              {editingField !== "displayName" && (
                <button
                  onClick={() => setConfirmField("displayName")}
                  className="mt-5 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-all flex-shrink-0"
                >
                  <EditIcon />
                </button>
              )}
            </div>

            {/* Email — read-only, no edit icon */}
            <div className="px-6 sm:px-8 py-4">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{t.emailLabel}</p>
              <p className="text-sm text-stone-400">{user.email}</p>
            </div>

            {/* Birth Date */}
            <div className="px-6 sm:px-8 py-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{t.birthDate}</p>
                {editingField === "birthDate" ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      autoFocus
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField("birthDate")}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
                      >
                        {saving ? t.saving : t.save}
                      </button>
                      <button
                        onClick={() => cancelFieldEdit("birthDate")}
                        className="flex-1 py-2 rounded-lg border-2 border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 transition-all active:scale-95"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-stone-900">
                    {birthDate ? formatBirthDate(birthDate) : <span className="text-stone-400 italic font-normal">{t.notSet}</span>}
                  </p>
                )}
              </div>
              {editingField !== "birthDate" && (
                <button
                  onClick={() => setConfirmField("birthDate")}
                  className="mt-5 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-all flex-shrink-0"
                >
                  <EditIcon />
                </button>
              )}
            </div>

            {/* Gender */}
            <div className="px-6 sm:px-8 py-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{t.gender}</p>
                {editingField === "gender" ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      {(["male", "female", "other"] as const).map((g) => {
                        const icon = g === "male" ? "👨" : g === "female" ? "👩" : "🧑";
                        const label = g === "male" ? t.genderMale : g === "female" ? t.genderFemale : t.genderOther;
                        const selected = editGender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setEditGender(selected ? "" : g)}
                            className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-bold text-xs transition-all duration-200 active:scale-95 ${
                              selected
                                ? "border-orange-400 bg-orange-50 text-orange-700 shadow-md shadow-orange-500/15"
                                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white hover:text-stone-700"
                            }`}
                          >
                            <span className="text-xl leading-none">{icon}</span>
                            <span className="font-black tracking-tight text-[11px]">{label}</span>
                            {selected && (
                              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-orange-500/20 flex items-center justify-center text-[8px] text-orange-600">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField("gender")}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
                      >
                        {saving ? t.saving : t.save}
                      </button>
                      <button
                        onClick={() => cancelFieldEdit("gender")}
                        className="flex-1 py-2 rounded-lg border-2 border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 transition-all active:scale-95"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {gender ? (
                      <>
                        <span className="text-xl">{gender === "male" ? "👨" : gender === "female" ? "👩" : "🧑"}</span>
                        <span className="text-sm font-semibold text-stone-900">
                          {gender === "male" ? t.genderMale : gender === "female" ? t.genderFemale : t.genderOther}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-stone-400 italic font-normal">{t.notSet}</span>
                    )}
                  </div>
                )}
              </div>
              {editingField !== "gender" && (
                <button
                  onClick={() => setConfirmField("gender")}
                  className="mt-5 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-all flex-shrink-0"
                >
                  <EditIcon />
                </button>
              )}
            </div>
            {/* Change Password */}
            <div className="px-6 sm:px-8 py-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{t.changePassword}</p>
                {editingField === "changePassword" ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="password"
                      value={editCurrentPassword}
                      onChange={(e) => setEditCurrentPassword(e.target.value)}
                      placeholder={t.currentPassword}
                      autoFocus
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                    />
                    <input
                      type="password"
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder={t.newPassword}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                    />
                    <input
                      type="password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      placeholder={t.confirmNewPassword}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                    />
                    {passwordError && (
                      <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {passwordError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField("changePassword")}
                        disabled={saving}
                        className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
                      >
                        {saving ? t.saving : t.save}
                      </button>
                      <button
                        onClick={() => cancelFieldEdit("changePassword")}
                        className="flex-1 py-2 rounded-lg border-2 border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 transition-all active:scale-95"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-400">••••••••</p>
                )}
              </div>
              {editingField !== "changePassword" && (
                <button
                  onClick={() => setConfirmField("changePassword")}
                  className="mt-5 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-all flex-shrink-0"
                >
                  <EditIcon />
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 sm:mx-8 mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          )}

          {/* Saved toast */}
          {saved && (
            <div className="mx-6 sm:mx-8 mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              {t.saved}
            </div>
          )}

          {/* Action buttons */}
          <div className="p-6 sm:p-8 flex flex-col gap-3 border-t border-stone-100">
            {/* Create listing button */}
            <Link
              href="/create-listing"
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm text-center bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {t.createListing}
            </Link>

            {/* My Listings + Saved Listings */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/my-listings"
                className="py-3.5 rounded-xl font-bold text-sm text-center border-2 border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="3" />
                </svg>
                {t.myListings}
              </Link>
              <Link
                href="/saved-listings"
                className="py-3.5 rounded-xl font-bold text-sm text-center border-2 border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {t.savedListings}
              </Link>
            </div>

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

            {/* Delete account — intentionally small and unattractive */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => { savedEmailRef.current = user?.email || ""; setDeleteStep(1); setDeleteError(null); setDeleteReasons([]); setDeleteRating(null); setDeleteExtraFeedback(""); setDeleteOtp(""); }}
                className="text-[11px] text-stone-400 hover:text-stone-500 transition-colors"
              >
                {t.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
