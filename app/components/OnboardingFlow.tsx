"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/app/lib/supabase";
import CountrySelect from "@/app/components/CountrySelect";

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";
type StepName = "displayname" | "birthdate" | "gender" | "country" | "photo";
type ViewStep = "welcome" | StepName | "celebration";

export interface MissingFields {
  displayName: boolean;
  birthDate: boolean;
  gender: boolean;
  country: boolean;
  photo: boolean;
}

const i18n: Record<Lang, {
  welcomeTitle: string; welcomeMsg: string; letsGo: string;
  nameQ: string; namePlaceholder: string;
  birthdateQ: string; thanks: string; genderQ: string;
  male: string; female: string; other: string;
  countryQ: string; searchCountry: string; countryConfirm: string;
  photoQ: string; choosePhoto: string; photoConfirm: string; photoSkip: string;
  celebration: string; stepLabel: string;
  day: string; month: string; year: string; confirm: string;
}> = {
  tr: {
    welcomeTitle: "Hoş geldiniz! 🌟", welcomeMsg: "Devam etmeden önce birkaç bilgiye ihtiyacımız var. Tam erişim için profili tamamlayın!",
    letsGo: "Başlayalım", nameQ: "Adınız nedir? 😊", namePlaceholder: "Adınızı girin...",
    birthdateQ: "Doğum tarihiniz nedir? 🎂", thanks: "Teşekkürler! 🎉",
    genderQ: "Cinsiyetiniz nedir?", male: "Erkek", female: "Kadın", other: "Diğer",
    countryQ: "Hangi ülkenin vatandaşısınız?", searchCountry: "Ülke ara...", countryConfirm: "Devam Et",
    photoQ: "Sevgilim, güzel bir profil fotoğrafı seç! 🌟", choosePhoto: "Fotoğraf Seç", photoConfirm: "Kaydet", photoSkip: "Şimdilik Atla",
    celebration: "Profiliniz tamamlandı! Sefira'ya hoş geldiniz! 🌹❤️", stepLabel: "Adım",
    day: "Gün", month: "Ay", year: "Yıl", confirm: "Onayla",
  },
  en: {
    welcomeTitle: "Welcome! 🌟", welcomeMsg: "Before continuing, we need a few details. Complete your profile for full access!",
    letsGo: "Let's Go", nameQ: "What's your name? 😊", namePlaceholder: "Enter your name...",
    birthdateQ: "When is your birthday? 🎂", thanks: "Thank you! 🎉",
    genderQ: "What is your gender?", male: "Male", female: "Female", other: "Other",
    countryQ: "Which country are you from?", searchCountry: "Search country...", countryConfirm: "Continue",
    photoQ: "Darling, choose a beautiful profile photo! 🌟", choosePhoto: "Choose Photo", photoConfirm: "Save", photoSkip: "Skip for now",
    celebration: "Profile complete! Welcome to Sefira! 🌹❤️", stepLabel: "Step",
    day: "Day", month: "Month", year: "Year", confirm: "Confirm",
  },
  fa: {
    welcomeTitle: "خوش آمدید! 🌟", welcomeMsg: "قبل از ادامه، به چند اطلاعات نیاز داریم. برای دسترسی کامل، پروفایل را تکمیل کنید!",
    letsGo: "بزن بریم", nameQ: "اسمت چیه؟ 😊", namePlaceholder: "اسمت رو بنویس...",
    birthdateQ: "تاریخ تولدت کیه؟ 🎂", thanks: "ممنون! 🎉",
    genderQ: "جنسیتت چیه؟", male: "مرد", female: "زن", other: "سایر",
    countryQ: "اهل کدام کشور هستی؟", searchCountry: "جستجوی کشور...", countryConfirm: "ادامه",
    photoQ: "عزیزم، یه عکس پروفایل قشنگ انتخاب کن! 🌟", choosePhoto: "انتخاب عکس", photoConfirm: "ذخیره", photoSkip: "فعلاً رد کن",
    celebration: "پروفایلت کامل شد! به سفیرا خوش اومدی! 🌹❤️", stepLabel: "مرحله",
    day: "روز", month: "ماه", year: "سال", confirm: "تأیید",
  },
  ar: {
    welcomeTitle: "مرحباً بك! 🌟", welcomeMsg: "قبل المتابعة، نحتاج بعض المعلومات. أكمل ملفك للوصول الكامل!",
    letsGo: "هيا بنا", nameQ: "ما اسمك؟ 😊", namePlaceholder: "أدخل اسمك...",
    birthdateQ: "متى ميلادك؟ 🎂", thanks: "شكراً! 🎉",
    genderQ: "ما هو جنسك؟", male: "ذكر", female: "أنثى", other: "آخر",
    countryQ: "من أي دولة أنت؟", searchCountry: "ابحث عن دولة...", countryConfirm: "متابعة",
    photoQ: "عزيزي، اختر صورة ملف شخصي جميلة! 🌟", choosePhoto: "اختر صورة", photoConfirm: "حفظ", photoSkip: "تخطي الآن",
    celebration: "اكتمل ملفك! مرحباً بك في سفيرا! 🌹❤️", stepLabel: "خطوة",
    day: "يوم", month: "شهر", year: "سنة", confirm: "تأكيد",
  },
  de: {
    welcomeTitle: "Willkommen! 🌟", welcomeMsg: "Bevor Sie fortfahren, benötigen wir einige Angaben. Vervollständigen Sie Ihr Profil!",
    letsGo: "Los geht's", nameQ: "Wie heißen Sie? 😊", namePlaceholder: "Namen eingeben...",
    birthdateQ: "Wann ist Ihr Geburtstag? 🎂", thanks: "Danke! 🎉",
    genderQ: "Was ist Ihr Geschlecht?", male: "Mann", female: "Frau", other: "Andere",
    countryQ: "Aus welchem Land kommen Sie?", searchCountry: "Land suchen...", countryConfirm: "Weiter",
    photoQ: "Liebling, wähle ein schönes Profilbild! 🌟", choosePhoto: "Foto wählen", photoConfirm: "Speichern", photoSkip: "Jetzt überspringen",
    celebration: "Profil abgeschlossen! Willkommen bei Sefira! 🌹❤️", stepLabel: "Schritt",
    day: "Tag", month: "Monat", year: "Jahr", confirm: "Bestätigen",
  },
  ru: {
    welcomeTitle: "Добро пожаловать! 🌟", welcomeMsg: "Прежде чем продолжить, нам нужно несколько данных. Заполните профиль для полного доступа!",
    letsGo: "Начать", nameQ: "Как вас зовут? 😊", namePlaceholder: "Введите ваше имя...",
    birthdateQ: "Когда ваш день рождения? 🎂", thanks: "Спасибо! 🎉",
    genderQ: "Ваш пол?", male: "Мужской", female: "Женский", other: "Другой",
    countryQ: "Из какой вы страны?", searchCountry: "Поиск страны...", countryConfirm: "Продолжить",
    photoQ: "Дорогой, выбери красивое фото профиля! 🌟", choosePhoto: "Выбрать фото", photoConfirm: "Сохранить", photoSkip: "Пропустить пока",
    celebration: "Профиль заполнен! Добро пожаловать в Sefira! 🌹❤️", stepLabel: "Шаг",
    day: "День", month: "Месяц", year: "Год", confirm: "Подтвердить",
  },
};


const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS  = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i);

const FLAG: Record<Lang, string> = { tr: "🇹🇷", en: "🇬🇧", fa: "🇮🇷", ar: "🇸🇦", de: "🇩🇪", ru: "🇷🇺" };
const CODE: Record<Lang, string> = { tr: "TR", en: "EN", fa: "FA", ar: "AR", de: "DE", ru: "RU" };

interface Props {
  userId: string;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  missingFields: MissingFields;
  onComplete: () => void;
}

const ANIM_CSS = `
  @keyframes ob-heart-float { 0%{transform:translateY(0) scale(1);opacity:.9} 100%{transform:translateY(-140px) scale(.4);opacity:0} }
  @keyframes ob-heart-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
  @keyframes ob-star-spin    { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.15)} 100%{transform:rotate(360deg) scale(1)} }
  @keyframes ob-globe-spin   { 0%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} 100%{transform:rotate(-15deg)} }
  @keyframes ob-wave         { 0%,100%{transform:rotate(0deg) scale(1)} 20%{transform:rotate(22deg) scale(1.1)} 60%{transform:rotate(-18deg) scale(1.05)} 80%{transform:rotate(12deg) scale(1.08)} }
  @keyframes ob-camera-bob   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.08)} }
  @keyframes ob-rose-fall    { 0%{transform:translateY(-60px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(600deg);opacity:.2} }
  @keyframes ob-heart-up     { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-220px) scale(1.6);opacity:0} }
  @keyframes ob-card-in      { 0%{transform:scale(.88) translateY(24px);opacity:0} 60%{transform:scale(1.02) translateY(-4px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
  @keyframes ob-thanks-pop   { 0%{transform:scale(.6);opacity:0} 50%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
  @keyframes ob-celebrate-in { 0%{transform:scale(.8) translateY(30px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
  .ob-card-in      { animation: ob-card-in 0.45s cubic-bezier(.34,1.56,.64,1) forwards; }
  .ob-heart-pulse  { animation: ob-heart-pulse 1.1s ease-in-out infinite; }
  .ob-star-spin    { animation: ob-star-spin 2.8s linear infinite; display:inline-block; }
  .ob-globe-spin   { animation: ob-globe-spin 2s ease-in-out infinite; display:inline-block; }
  .ob-wave         { animation: ob-wave 1.6s ease-in-out infinite; display:inline-block; transform-origin: 70% 70%; }
  .ob-camera-bob   { animation: ob-camera-bob 1.8s ease-in-out infinite; display:inline-block; }
  .ob-thanks-pop   { animation: ob-thanks-pop .5s cubic-bezier(.34,1.56,.64,1) forwards; }
  .ob-celebrate-in { animation: ob-celebrate-in .6s cubic-bezier(.34,1.56,.64,1) forwards; }
`;

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 100;
  return (
    <div className="h-1.5 bg-stone-100 w-full">
      <div
        className="h-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function OnboardingFlow({ userId, lang: initialLang, onLangChange, missingFields, onComplete }: Props) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = i18n[lang];
  const isRtl = lang === "fa" || lang === "ar";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLangChange = (l: Lang) => {
    setLang(l);
    onLangChange(l);
    setLangOpen(false);
  };

  // Build the ordered queue of only the steps that need filling
  const stepQueue = useMemo<StepName[]>(() => {
    const q: StepName[] = [];
    if (missingFields.displayName) q.push("displayname");
    if (missingFields.birthDate)   q.push("birthdate");
    if (missingFields.gender)      q.push("gender");
    if (missingFields.country)     q.push("country");
    if (missingFields.photo)       q.push("photo");
    return q;
  }, [missingFields]);

  const [step, setStep] = useState<ViewStep>("welcome");
  const [showThanks, setShowThanks] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bdDay, setBdDay] = useState("");
  const [bdMonth, setBdMonth] = useState("");
  const [bdYear, setBdYear] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [countryValid, setCountryValid] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Index of current step within the queue (-1 when on welcome/celebration)
  const stepIdx   = stepQueue.indexOf(step as StepName);
  const totalSteps = stepQueue.length;

  const advanceStep = () => {
    const idx  = stepQueue.indexOf(step as StepName);
    const next = stepQueue[idx + 1];
    if (next) { setStep(next); }
    else       { setStep("celebration"); setTimeout(() => onComplete(), 3000); }
  };

  const goToFirstStep = () => {
    if (stepQueue.length === 0) { setStep("celebration"); setTimeout(() => onComplete(), 3000); }
    else                        { setStep(stepQueue[0]); }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveDisplayName = async () => {
    if (!displayName.trim() || saving) return;
    setSaving(true);
    await supabase.from("profiles").upsert({ user_id: userId, display_name: displayName.trim() }, { onConflict: "user_id" });
    setSaving(false);
    setShowThanks(true);
    setTimeout(() => { setShowThanks(false); advanceStep(); }, 1500);
  };

  const saveBirthDate = async () => {
    if (!bdDay || !bdMonth || !bdYear || saving) return;
    const monthNum = MONTHS.indexOf(bdMonth) + 1;
    const dateStr  = `${bdYear}-${String(monthNum).padStart(2, "0")}-${String(Number(bdDay)).padStart(2, "0")}`;
    setSaving(true);
    await supabase.from("profiles").upsert({ user_id: userId, birth_date: dateStr }, { onConflict: "user_id" });
    setSaving(false);
    setShowThanks(true);
    setTimeout(() => { setShowThanks(false); advanceStep(); }, 1500);
  };

  const saveGender = async (g: string) => {
    if (saving) return;
    setGender(g);
    setSaving(true);
    await supabase.from("profiles").upsert({ user_id: userId, gender: g }, { onConflict: "user_id" });
    setSaving(false);
    setShowThanks(true);
    setTimeout(() => { setShowThanks(false); advanceStep(); }, 1500);
  };

  const saveCountry = async () => {
    if (!country || saving) return;
    setSaving(true);
    await supabase.from("profiles").upsert({ user_id: userId, country }, { onConflict: "user_id" });
    setSaving(false);
    advanceStep();
  };

  const savePhoto = async () => {
    if (!photoFile || saving) return;
    setSaving(true);
    const ext = photoFile.name.split(".").pop() ?? "jpg";
    const filePath = `${userId}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(filePath, photoFile, { upsert: true });
    if (!uploadErr) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").upsert({ user_id: userId, avatar_url: publicUrl }, { onConflict: "user_id" });
    }
    setSaving(false);
    setStep("celebration");
    setTimeout(() => onComplete(), 3000);
  };

  const skipPhoto = () => {
    setStep("celebration");
    setTimeout(() => onComplete(), 3000);
  };

  // Thanks overlay shared by steps that use it
  const ThanksOverlay = () => (
    <div className="text-center py-8 ob-thanks-pop">
      <div className="text-5xl mb-3">❤️❤️❤️</div>
      <p className="font-black text-teal-500 text-xl">{t.thanks}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "rgba(12,8,24,.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
    >
      <style>{ANIM_CSS}</style>

      {/* ── Language switcher — always visible top-right ── */}
      <div ref={langRef} className="absolute top-4 right-4 z-[10001]" dir="ltr">
        <button
          onClick={() => setLangOpen((o) => !o)}
          className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white font-black text-sm hover:bg-white/30 active:scale-95 transition-all duration-200 shadow-lg"
        >
          <span className="text-base leading-none">{FLAG[lang]}</span>
          <span>{CODE[lang]}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {langOpen && (
          <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden min-w-[110px]">
            {(["tr", "en", "fa", "ar", "de", "ru"] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-bold transition-colors hover:bg-stone-50 ${lang === l ? "text-teal-500 bg-teal-50" : "text-stone-700"}`}
              >
                <span className="text-base">{FLAG[l]}</span>
                {CODE[l]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── WELCOME ── */}
      {step === "welcome" && (
        <div className="relative w-full max-w-sm ob-card-in">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="absolute text-xl pointer-events-none select-none"
              style={{
                left: `${8 + i * 10}%`, bottom: `${25 + (i % 4) * 18}%`,
                animation: `ob-heart-float ${1.8 + (i % 3) * 0.6}s ease-in infinite`,
                animationDelay: `${i * 0.35}s`,
              }}>❤️</div>
          ))}
          <div className="relative bg-gradient-to-br from-teal-500 via-amber-500 to-rose-500 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative flex justify-center mb-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/40">
                <Image src="/images/sefira-cat.jpg" alt="Sefira" width={112} height={112} className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-3 leading-snug">{t.welcomeTitle}</h2>
            <p className="text-white/88 text-sm text-center leading-relaxed mb-7">{t.welcomeMsg}</p>
            <button
              onClick={goToFirstStep}
              className="w-full py-4 rounded-2xl bg-white font-black text-teal-500 text-sm hover:bg-teal-50 active:scale-95 transition-all duration-200 shadow-xl"
            >
              {t.letsGo} ✨
            </button>
          </div>
        </div>
      )}

      {/* ── DISPLAY NAME ── */}
      {step === "displayname" && (
        <div className="relative w-full max-w-sm ob-card-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ProgressBar current={stepIdx + 1} total={totalSteps} />
            <div className="p-7">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-5">
                {t.stepLabel} {stepIdx + 1} / {totalSteps}
              </p>
              <div className="text-5xl text-center mb-5 ob-wave">👋</div>
              <h3 className="text-lg font-black text-stone-900 text-center mb-6">{t.nameQ}</h3>
              {showThanks ? <ThanksOverlay /> : (
                <>
                  <input
                    type="text" placeholder={t.namePlaceholder} value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveDisplayName()}
                    autoFocus
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-teal-400 transition-colors mb-5"
                  />
                  <button onClick={saveDisplayName} disabled={!displayName.trim() || saving}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-amber-500 font-black text-white text-sm disabled:opacity-40 hover:opacity-95 active:scale-95 transition-all duration-200 shadow-lg shadow-teal-500/25">
                    {t.confirm} 👋
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BIRTH DATE ── */}
      {step === "birthdate" && (
        <div className="relative w-full max-w-sm ob-card-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ProgressBar current={stepIdx + 1} total={totalSteps} />
            <div className="p-7">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-5">
                {t.stepLabel} {stepIdx + 1} / {totalSteps}
              </p>
              <div className="text-5xl text-center mb-5 ob-heart-pulse">❤️</div>
              <h3 className="text-lg font-black text-stone-900 text-center mb-6">{t.birthdateQ}</h3>
              {showThanks ? <ThanksOverlay /> : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <select value={bdDay} onChange={(e) => setBdDay(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-3 text-sm text-stone-700 outline-none focus:border-teal-400 transition-colors cursor-pointer">
                      <option value="">{t.day}</option>
                      {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={bdMonth} onChange={(e) => setBdMonth(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-3 text-sm text-stone-700 outline-none focus:border-teal-400 transition-colors cursor-pointer">
                      <option value="">{t.month}</option>
                      {MONTHS.map((m, i) => <option key={m} value={m}>{i + 1}</option>)}
                    </select>
                    <select value={bdYear} onChange={(e) => setBdYear(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-2 py-3 text-sm text-stone-700 outline-none focus:border-teal-400 transition-colors cursor-pointer">
                      <option value="">{t.year}</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button onClick={saveBirthDate} disabled={!bdDay || !bdMonth || !bdYear || saving}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-amber-500 font-black text-white text-sm disabled:opacity-40 hover:opacity-95 active:scale-95 transition-all duration-200 shadow-lg shadow-teal-500/25">
                    {t.confirm} ❤️
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GENDER ── */}
      {step === "gender" && (
        <div className="relative w-full max-w-sm ob-card-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ProgressBar current={stepIdx + 1} total={totalSteps} />
            <div className="p-7">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-5">
                {t.stepLabel} {stepIdx + 1} / {totalSteps}
              </p>
              <div className="text-5xl text-center mb-5 ob-star-spin">⭐</div>
              <h3 className="text-lg font-black text-stone-900 text-center mb-6">{t.genderQ}</h3>
              {showThanks ? <ThanksOverlay /> : (
                <div className="flex flex-col gap-3">
                  {[
                    { value: "male",   icon: "👨", label: t.male },
                    { value: "female", icon: "👩", label: t.female },
                    { value: "other",  icon: "🧑", label: t.other },
                  ].map(({ value, icon, label }) => (
                    <button key={value} onClick={() => saveGender(value)} disabled={saving}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg ${
                        gender === value
                          ? "border-teal-400 bg-teal-50 text-teal-800 shadow-md shadow-teal-500/20"
                          : "border-stone-200 text-stone-700 hover:border-teal-300 hover:bg-teal-50/60"
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="font-black text-base">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COUNTRY ── */}
      {step === "country" && (
        <div className="relative w-full max-w-sm ob-card-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ProgressBar current={stepIdx + 1} total={totalSteps} />
            <div className="p-7">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-5">
                {t.stepLabel} {stepIdx + 1} / {totalSteps}
              </p>
              <div className="text-5xl text-center mb-5 ob-globe-spin">🌍</div>
              <h3 className="text-lg font-black text-stone-900 text-center mb-4">{t.countryQ}</h3>
              <div className="mb-4">
                <CountrySelect
                  value={country}
                  onChange={(val, isValid) => {
                    setCountry(val);
                    setCountryValid(isValid);
                  }}
                  lang={lang}
                  placeholder={t.searchCountry}
                />
              </div>
              <button onClick={saveCountry} disabled={!country || !countryValid || saving}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-amber-500 font-black text-white text-sm disabled:opacity-40 hover:opacity-95 active:scale-95 transition-all duration-200 shadow-lg shadow-teal-500/25">
                {t.countryConfirm} 🌍
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO ── */}
      {step === "photo" && (
        <div className="relative w-full max-w-sm ob-card-in">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ProgressBar current={stepIdx + 1} total={totalSteps} />
            <div className="p-7">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center mb-5">
                {t.stepLabel} {stepIdx + 1} / {totalSteps}
              </p>
              <div className="text-5xl text-center mb-5 ob-camera-bob">📸</div>
              <h3 className="text-base font-black text-stone-900 text-center mb-6 leading-snug">{t.photoQ}</h3>
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full border-4 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-all duration-200 active:scale-95 overflow-hidden group"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-3xl">📷</span>
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-wide">{t.choosePhoto}</span>
                    </div>
                  )}
                  {photoPreview && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-black">{t.choosePhoto}</span>
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
              <button onClick={savePhoto} disabled={!photoFile || saving}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-amber-500 font-black text-white text-sm disabled:opacity-40 hover:opacity-95 active:scale-95 transition-all duration-200 shadow-lg shadow-teal-500/25 mb-3">
                {saving ? "..." : `${t.photoConfirm} 📸`}
              </button>
              <button onClick={skipPhoto}
                className="w-full py-3 rounded-2xl border-2 border-stone-200 font-bold text-stone-500 text-sm hover:border-stone-300 hover:bg-stone-50 active:scale-95 transition-all duration-200">
                {t.photoSkip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CELEBRATION ── */}
      {step === "celebration" && (
        <>
          {[...Array(14)].map((_, i) => (
            <div key={i} className="fixed text-3xl pointer-events-none select-none"
              style={{
                left: `${(i * 7.4) % 100}%`, top: "-60px",
                animation: `ob-rose-fall ${1.8 + (i % 5) * 0.45}s linear infinite`,
                animationDelay: `${i * 0.22}s`,
              }}>🌹</div>
          ))}
          {[...Array(7)].map((_, i) => (
            <div key={i} className="fixed text-2xl pointer-events-none select-none"
              style={{
                left: `${10 + i * 13}%`, bottom: "15%",
                animation: `ob-heart-up ${1.6 + i * 0.35}s ease-in infinite`,
                animationDelay: `${i * 0.45}s`,
              }}>❤️</div>
          ))}
          <div className="relative w-full max-w-sm ob-celebrate-in">
            <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-teal-500 rounded-3xl p-10 shadow-2xl text-center overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="relative text-6xl mb-5">🌹❤️🌹</div>
              <h2 className="relative text-lg font-black text-white leading-relaxed">{t.celebration}</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
