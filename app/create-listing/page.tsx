"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  tr: {
    pageTitle: "İlan Ver",
    stepOf: (current: number, total: number) => `Adım ${current} / ${total}`,
    // Step 1
    step1Title: "Ne tür bir ilan vermek istiyorsunuz?",
    hasPlace: "Ev sahibiyim, ev arkadaşı arıyorum",
    hasPlaceSub: "Evinizde birlikte yaşayın",
    needsPlace: "Evim yok, birlikte yaşayacak biri arıyorum",
    needsPlaceSub: "Uygun bir ev bulmak için eşleşin",
    next: "İleri",
    back: "Geri",
    submit: "İlanı Yayınla",
    submitting: "Yayınlanıyor...",
    edit: "Düzenle",
    // Step 2
    step2Title: "Evinizin detayları",
    smoking: "Sigara İzni",
    smokingYes: "İzin Var",
    smokingNo: "İzin Yok",
    parking: "Otopark",
    parkingYes: "Mevcut",
    parkingNo: "Yok",
    currentResidents: "Mevcut Ev Arkadaşı Sayısı",
    neededRoommates: "Aranan Ev Arkadaşı Sayısı",
    rooms: "Oda Sayısı",
    rent: "Aylık Paylaşım Ücreti",
    currency: "Para Birimi",
    photos: "Ev Fotoğrafları (Maks. 3)",
    uploadPhotos: "Fotoğraf Yükle",
    addMorePhotos: "Daha Fazla Ekle",
    address: "Adres",
    addressPlaceholder: "Mahalle, sokak, şehir, ülke",
    // Step 3
    step3Title: "İlanınızı Onaylayın",
    typeLabel: "İlan Türü",
    hasPlaceLabel: "Ev sahibi — ev arkadaşı arıyor",
    needsPlaceLabel: "Ev arıyor — birlikte yaşayacak biri arıyor",
    smokingLabel: "Sigara",
    parkingLabel: "Otopark",
    residentsLabel: "Mevcut Ev Arkadaşı",
    roommatesLabel: "Aranan Ev Arkadaşı",
    roomsLabel: "Oda Sayısı",
    rentLabel: "Aylık Paylaşım Ücreti",
    addressLabel: "Adres",
    photosLabel: "Fotoğraflar",
    yes: "Var",
    no: "Yok",
    person: "kişi",
    // Auth
    notLoggedIn: "İlan verebilmek için giriş yapınız.",
    goHome: "Ana Sayfaya Dön",
    // Errors
    errorSubmit: "İlan yayınlanırken hata oluştu. Lütfen tekrar deneyin.",
    errorPhoto: "Fotoğraf yüklenirken hata oluştu.",
    successTitle: "İlanınız Yayınlandı!",
    successSub: "İlanınız başarıyla oluşturuldu.",
    viewListings: "İlanlara Bak",
    createAnother: "Yeni İlan Ver",
    requiredField: "Bu alan zorunludur.",
    selectType: "Lütfen bir ilan türü seçin.",
    fillRequired: "Lütfen zorunlu alanları doldurun.",
  },
  en: {
    pageTitle: "Create Listing",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    // Step 1
    step1Title: "What type of listing would you like to create?",
    hasPlace: "I have a place and looking for roommate(s)",
    hasPlaceSub: "Share your home with someone",
    needsPlace: "I don't have a place and looking to share with someone",
    needsPlaceSub: "Match with others to find a home together",
    next: "Next",
    back: "Back",
    submit: "Publish Listing",
    submitting: "Publishing...",
    edit: "Edit",
    // Step 2
    step2Title: "Details about your place",
    smoking: "Smoking",
    smokingYes: "Allowed",
    smokingNo: "Not Allowed",
    parking: "Parking",
    parkingYes: "Available",
    parkingNo: "Not Available",
    currentResidents: "Current Number of Residents",
    neededRoommates: "Number of Roommates Needed",
    rooms: "Number of Rooms",
    rent: "Monthly Sharing Cost",
    currency: "Currency",
    photos: "Photos of the Place (Max 3)",
    uploadPhotos: "Upload Photos",
    addMorePhotos: "Add More",
    address: "Address",
    addressPlaceholder: "Street, neighbourhood, city, country",
    // Step 3
    step3Title: "Confirm Your Listing",
    typeLabel: "Listing Type",
    hasPlaceLabel: "Has a place — looking for roommate(s)",
    needsPlaceLabel: "No place — looking to share with someone",
    smokingLabel: "Smoking",
    parkingLabel: "Parking",
    residentsLabel: "Current Residents",
    roommatesLabel: "Roommates Needed",
    roomsLabel: "Number of Rooms",
    rentLabel: "Monthly Sharing Cost",
    addressLabel: "Address",
    photosLabel: "Photos",
    yes: "Yes",
    no: "No",
    person: "person",
    // Auth
    notLoggedIn: "Please sign in to create a listing.",
    goHome: "Go to Home",
    // Errors
    errorSubmit: "Error publishing listing. Please try again.",
    errorPhoto: "Error uploading photo.",
    successTitle: "Listing Published!",
    successSub: "Your listing has been created successfully.",
    viewListings: "Browse Listings",
    createAnother: "Create Another",
    requiredField: "This field is required.",
    selectType: "Please select a listing type.",
    fillRequired: "Please fill in all required fields.",
  },
  fa: {
    pageTitle: "ثبت آگهی",
    stepOf: (current: number, total: number) => `مرحله ${current} از ${total}`,
    // Step 1
    step1Title: "چه نوع آگهی می‌خواهید ثبت کنید؟",
    hasPlace: "خانه دارم و دنبال هم‌خانه می‌گردم",
    hasPlaceSub: "خانه‌تان را با کسی به اشتراک بگذارید",
    needsPlace: "خانه ندارم و دنبال هم‌خانه می‌گردم",
    needsPlaceSub: "با دیگران برای پیدا کردن خانه همکاری کنید",
    next: "بعدی",
    back: "برگشت",
    submit: "ثبت آگهی",
    submitting: "در حال ثبت...",
    edit: "ویرایش",
    // Step 2
    step2Title: "جزئیات خانه شما",
    smoking: "سیگار مجاز است؟",
    smokingYes: "بله",
    smokingNo: "خیر",
    parking: "پارکینگ دارد؟",
    parkingYes: "بله",
    parkingNo: "خیر",
    currentResidents: "تعداد ساکنان فعلی",
    neededRoommates: "تعداد هم‌خانه مورد نیاز",
    rooms: "تعداد اتاق‌ها",
    rent: "هزینه مشترک",
    currency: "واحد پول",
    photos: "عکس‌های خانه (حداکثر ۳)",
    uploadPhotos: "آپلود عکس",
    addMorePhotos: "افزودن بیشتر",
    address: "آدرس",
    addressPlaceholder: "خیابان، محله، شهر، کشور",
    // Step 3
    step3Title: "تأیید نهایی",
    typeLabel: "نوع آگهی",
    hasPlaceLabel: "خانه دارد — دنبال هم‌خانه",
    needsPlaceLabel: "خانه ندارد — دنبال هم‌خانه",
    smokingLabel: "سیگار",
    parkingLabel: "پارکینگ",
    residentsLabel: "ساکنان فعلی",
    roommatesLabel: "هم‌خانه مورد نیاز",
    roomsLabel: "تعداد اتاق‌ها",
    rentLabel: "هزینه مشترک ماهانه",
    addressLabel: "آدرس",
    photosLabel: "عکس‌ها",
    yes: "بله",
    no: "خیر",
    person: "نفر",
    // Auth
    notLoggedIn: "برای ثبت آگهی لطفاً وارد شوید.",
    goHome: "برو به صفحه اصلی",
    // Errors
    errorSubmit: "خطا در ثبت آگهی. لطفاً دوباره امتحان کنید.",
    errorPhoto: "خطا در آپلود عکس.",
    successTitle: "آگهی ثبت شد!",
    successSub: "آگهی شما با موفقیت ایجاد شد.",
    viewListings: "مرور آگهی‌ها",
    createAnother: "ثبت آگهی جدید",
    requiredField: "این فیلد الزامی است.",
    selectType: "لطفاً نوع آگهی را انتخاب کنید.",
    fillRequired: "لطفاً همه فیلدهای الزامی را پر کنید.",
  },
  de: {
    pageTitle: "Inserat aufgeben",
    stepOf: (current: number, total: number) => `Schritt ${current} von ${total}`,
    step1Title: "Welche Art von Inserat möchten Sie aufgeben?",
    hasPlace: "Ich habe eine Wohnung und suche Mitbewohner",
    hasPlaceSub: "Teilen Sie Ihr Zuhause mit jemandem",
    needsPlace: "Ich habe keine Wohnung und suche jemanden zum Miteinanderwohnen",
    needsPlaceSub: "Gemeinsam mit anderen eine Wohnung finden",
    next: "Weiter",
    back: "Zurück",
    submit: "Inserat veröffentlichen",
    submitting: "Wird veröffentlicht...",
    edit: "Bearbeiten",
    step2Title: "Details zu Ihrer Wohnung",
    smoking: "Rauchen erlaubt?",
    smokingYes: "Erlaubt",
    smokingNo: "Nicht erlaubt",
    parking: "Parkplatz vorhanden?",
    parkingYes: "Vorhanden",
    parkingNo: "Nicht vorhanden",
    currentResidents: "Aktuelle Anzahl der Bewohner",
    neededRoommates: "Benötigte Anzahl Mitbewohner",
    rooms: "Anzahl der Zimmer",
    rent: "Monatliche Mietkosten",
    currency: "Währung",
    photos: "Fotos der Wohnung (max. 3)",
    uploadPhotos: "Fotos hochladen",
    addMorePhotos: "Weitere hinzufügen",
    address: "Adresse",
    addressPlaceholder: "Straße, Stadtteil, Stadt, Land",
    step3Title: "Inserat bestätigen",
    typeLabel: "Inseratstyp",
    hasPlaceLabel: "Hat Wohnung — sucht Mitbewohner",
    needsPlaceLabel: "Keine Wohnung — sucht Mitbewohner",
    smokingLabel: "Rauchen",
    parkingLabel: "Parkplatz",
    residentsLabel: "Aktuelle Bewohner",
    roommatesLabel: "Benötigte Mitbewohner",
    roomsLabel: "Anzahl der Zimmer",
    rentLabel: "Monatliche Mietkosten",
    addressLabel: "Adresse",
    photosLabel: "Fotos",
    yes: "Ja",
    no: "Nein",
    person: "Person",
    notLoggedIn: "Bitte melden Sie sich an, um ein Inserat aufzugeben.",
    goHome: "Zur Startseite",
    errorSubmit: "Fehler beim Veröffentlichen des Inserats. Bitte versuchen Sie es erneut.",
    errorPhoto: "Fehler beim Hochladen des Fotos.",
    successTitle: "Inserat veröffentlicht!",
    successSub: "Ihr Inserat wurde erfolgreich erstellt.",
    viewListings: "Inserate durchsuchen",
    createAnother: "Weiteres Inserat aufgeben",
    requiredField: "Dieses Feld ist erforderlich.",
    selectType: "Bitte wählen Sie einen Inseratstyp.",
    fillRequired: "Bitte füllen Sie alle Pflichtfelder aus.",
  },
  // Always add "ar" key when adding new translations
  ar: {
    pageTitle: "نشر إعلان",
    stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    // Step 1
    step1Title: "ما نوع الإعلان الذي تريد نشره؟",
    hasPlace: "لديَّ مكان وأبحث عن شريك سكن",
    hasPlaceSub: "شارك منزلك مع شخص آخر",
    needsPlace: "ليس لديَّ مكان وأبحث عن شريك سكن",
    needsPlaceSub: "تعاون مع الآخرين لإيجاد منزل معاً",
    next: "التالي",
    back: "رجوع",
    submit: "نشر الإعلان",
    submitting: "جارٍ النشر...",
    edit: "تعديل",
    // Step 2
    step2Title: "تفاصيل المكان",
    smoking: "التدخين مسموح؟",
    smokingYes: "مسموح",
    smokingNo: "غير مسموح",
    parking: "مواقف سيارات؟",
    parkingYes: "متوفر",
    parkingNo: "غير متوفر",
    currentResidents: "عدد السكان الحاليين",
    neededRoommates: "عدد شركاء السكن المطلوبين",
    rooms: "عدد الغرف",
    rent: "تكلفة المشاركة الشهرية",
    currency: "العملة",
    photos: "صور المكان (حد أقصى ٣)",
    uploadPhotos: "رفع الصور",
    addMorePhotos: "إضافة المزيد",
    address: "العنوان",
    addressPlaceholder: "الشارع، الحي، المدينة، البلد",
    // Step 3
    step3Title: "تأكيد الإعلان",
    typeLabel: "نوع الإعلان",
    hasPlaceLabel: "لديه مكان — يبحث عن شريك سكن",
    needsPlaceLabel: "ليس لديه مكان — يبحث عن المشاركة",
    smokingLabel: "التدخين",
    parkingLabel: "مواقف السيارات",
    residentsLabel: "السكان الحاليون",
    roommatesLabel: "شركاء السكن المطلوبون",
    roomsLabel: "عدد الغرف",
    rentLabel: "تكلفة المشاركة الشهرية",
    addressLabel: "العنوان",
    photosLabel: "الصور",
    yes: "نعم",
    no: "لا",
    person: "شخص",
    // Auth
    notLoggedIn: "يرجى تسجيل الدخول لنشر إعلان.",
    goHome: "الذهاب إلى الرئيسية",
    // Errors
    errorSubmit: "خطأ في نشر الإعلان. يرجى المحاولة مرة أخرى.",
    errorPhoto: "خطأ في رفع الصورة.",
    successTitle: "تم نشر الإعلان!",
    successSub: "تم إنشاء إعلانك بنجاح.",
    viewListings: "تصفّح الإعلانات",
    createAnother: "نشر إعلان آخر",
    requiredField: "هذا الحقل مطلوب.",
    selectType: "يرجى اختيار نوع الإعلان.",
    fillRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
  },
};

type ListingType = "has_place" | "needs_place";
type Currency = "USD" | "EUR" | "TRY";

interface ListingForm {
  type: ListingType | null;
  smoking: boolean;
  parking: boolean;
  current_residents: number;
  needed_roommates: number;
  rooms: number;
  rent: string;
  currency: Currency;
  photos: File[];
  photoPreviews: string[];
  address: string;
}

const initialForm: ListingForm = {
  type: null,
  smoking: false,
  parking: false,
  current_residents: 1,
  needed_roommates: 1,
  rooms: 2,
  rent: "",
  currency: "USD",
  photos: [],
  photoPreviews: [],
  address: "",
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  TRY: "₺",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({
  value,
  labelOn,
  labelOff,
  onChange,
}: {
  value: boolean;
  labelOn: string;
  labelOff: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm font-semibold">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-2.5 transition-all duration-200 ${
          value
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-inner"
            : "bg-white text-stone-500 hover:bg-stone-50"
        }`}
      >
        {labelOn}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-2.5 transition-all duration-200 ${
          !value
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-inner"
            : "bg-white text-stone-500 hover:bg-stone-50"
        }`}
      >
        {labelOff}
      </button>
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:border-orange-400 hover:text-orange-500 transition-all active:scale-90 font-bold text-lg"
      >
        −
      </button>
      <span className="w-10 text-center text-lg font-black text-stone-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:border-orange-400 hover:text-orange-500 transition-all active:scale-90 font-bold text-lg"
      >
        +
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en" | "fa" | "ar" | "de" | "ru">("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang");
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar" || saved === "de" || saved === "ru") setLang(saved);
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
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ListingForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = form.type === "has_place" ? 3 : 2;

  const set = <K extends keyof ListingForm>(key: K, val: ListingForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Photo handling
  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - form.photos.length;
    const newFiles = files.slice(0, remaining);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    set("photos", [...form.photos, ...newFiles]);
    set("photoPreviews", [...form.photoPreviews, ...previews]);
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(form.photoPreviews[idx]);
    set("photos", form.photos.filter((_, i) => i !== idx));
    set("photoPreviews", form.photoPreviews.filter((_, i) => i !== idx));
  };

  // Navigation
  const goNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!form.type) { setValidationError(t.selectType); return; }
      if (form.type === "needs_place") {
        setStep(form.type === "needs_place" ? 3 : 2);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!form.address.trim()) { setValidationError(t.requiredField + " (" + t.addressLabel + ")"); return; }
      if (!form.rent.trim()) { setValidationError(t.requiredField + " (" + t.rentLabel + ")"); return; }
      setStep(3);
    }
  };

  const goBack = () => {
    setValidationError(null);
    if (step === 3 && form.type === "needs_place") { setStep(1); return; }
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); return; }
  };

  // Submit
  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    // Upload photos
    const photoUrls: string[] = [];
    for (const file of form.photos) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { upsert: false });
      if (upErr) {
        setSubmitError(t.errorPhoto);
        setSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("listing-photos").getPublicUrl(path);
      photoUrls.push(publicUrl);
    }

    const payload: Record<string, unknown> = {
      user_id: user.id,
      type: form.type,
    };

    if (form.type === "has_place") {
      payload.smoking = form.smoking;
      payload.parking = form.parking;
      payload.current_residents = form.current_residents;
      payload.needed_roommates = form.needed_roommates;
      payload.rooms = form.rooms;
      payload.rent = parseFloat(form.rent) || null;
      payload.currency = form.currency;
      payload.photos = photoUrls;
      payload.address = form.address;
    }

    const { error: dbErr } = await supabase.from("listings").insert(payload);

    if (dbErr) {
      setSubmitError(t.errorSubmit);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-stone-900">{t.successTitle}</h2>
          <p className="text-stone-500 mt-1">{t.successSub}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 transition-all text-center text-sm"
          >
            {t.viewListings}
          </Link>
          <button
            onClick={() => { setForm(initialForm); setStep(1); setSubmitted(false); }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all text-sm"
          >
            {t.createAnother}
          </button>
        </div>
      </div>
    );
  }

  // ── Shared mini-navbar ────────────────────────────────────────────────────
  const Navbar = () => (
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
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen((o) => !o)}
            className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] font-black transition-all duration-200 hover:bg-stone-200 whitespace-nowrap"
          >
            <span className="text-sm leading-none">
              {lang === "tr" ? "🇹🇷" : lang === "en" ? "🇬🇧" : lang === "fa" ? "🇮🇷" : lang === "ar" ? "🇸🇦" : lang === "ru" ? "🇷🇺" : "🇩🇪"}
            </span>
            <span className="text-stone-700">
              {lang === "tr" ? "TR" : lang === "en" ? "EN" : lang === "fa" ? "FA" : lang === "ar" ? "AR" : lang === "ru" ? "RU" : "DE"}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langMenuOpen && (
            <div className="absolute top-full mt-1 right-0 z-[100] bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden min-w-[90px]">
              {(["tr", "en", "fa", "ar", "de", "ru"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 text-[12px] font-bold transition-colors hover:bg-stone-50 ${lang === l ? "text-orange-500" : "text-stone-700"}`}
                >
                  <span className="text-sm">{l === "tr" ? "🇹🇷" : l === "en" ? "🇬🇧" : l === "fa" ? "🇮🇷" : l === "ar" ? "🇸🇦" : l === "ru" ? "🇷🇺" : "🇩🇪"}</span>
                  {l === "tr" ? "TR" : l === "en" ? "EN" : l === "fa" ? "FA" : l === "ar" ? "AR" : l === "ru" ? "RU" : "DE"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  // ── Progress bar ──────────────────────────────────────────────────────────
  const ProgressBar = () => {
    const displayTotal = form.type === "needs_place" ? 2 : form.type === "has_place" ? 3 : 3;
    const displayStep = step === 3 && form.type === "needs_place" ? 2 : step;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-stone-500">{t.stepOf(displayStep, displayTotal)}</p>
          <p className="text-xs font-bold text-orange-500">{Math.round((displayStep / displayTotal) * 100)}%</p>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(displayStep / displayTotal) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // ── STEP 1: Type selection ────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          {/* Back to home */}
          <Link href="/" dir="ltr" className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
              <polyline points={lang === "fa" || lang === "ar" ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
            </svg>
            <span>{lang === "tr" ? "Ana Sayfa" : lang === "fa" ? "صفحه اصلی" : lang === "ar" ? "الرئيسية" : "Home"}</span>
          </Link>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step1Title}</p>

          <div className="flex flex-col gap-4">
            {(["has_place", "needs_place"] as ListingType[]).map((type) => {
              const isSelected = form.type === type;
              const label = type === "has_place" ? t.hasPlace : t.needsPlace;
              const sub = type === "has_place" ? t.hasPlaceSub : t.needsPlaceSub;
              const icon =
                type === "has_place" ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                );
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("type", type)}
                  className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-500/10"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-base leading-snug ${isSelected ? "text-orange-600" : "text-stone-900"}`}>
                      {label}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">{sub}</p>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                    isSelected ? "border-orange-500 bg-orange-500" : "border-stone-300"
                  }`}>
                    {isSelected && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white p-0.5">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {validationError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {validationError}
            </p>
          )}

          <button
            onClick={goNext}
            className="mt-8 w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
          >
            {t.next}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 2: Place details (only for has_place) ────────────────────────────
  if (step === 2 && form.type === "has_place") {
    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          {/* Back to home */}
          <Link href="/" dir="ltr" className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
              <polyline points={lang === "fa" || lang === "ar" ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
            </svg>
            <span>{lang === "tr" ? "Ana Sayfa" : lang === "fa" ? "صفحه اصلی" : lang === "ar" ? "الرئيسية" : "Home"}</span>
          </Link>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step2Title}</p>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
            {/* Smoking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.smoking}</label>
              <Toggle
                value={form.smoking}
                labelOn={t.smokingYes}
                labelOff={t.smokingNo}
                onChange={(v) => set("smoking", v)}
              />
            </div>

            {/* Parking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.parking}</label>
              <Toggle
                value={form.parking}
                labelOn={t.parkingYes}
                labelOff={t.parkingNo}
                onChange={(v) => set("parking", v)}
              />
            </div>

            {/* Current residents */}
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.currentResidents}</label>
              <NumberStepper
                value={form.current_residents}
                onChange={(v) => set("current_residents", v)}
                min={0}
                max={20}
              />
            </div>

            {/* Needed roommates */}
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.neededRoommates}</label>
              <NumberStepper
                value={form.needed_roommates}
                onChange={(v) => set("needed_roommates", v)}
                min={1}
                max={20}
              />
            </div>

            {/* Rooms */}
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.rooms}</label>
              <NumberStepper
                value={form.rooms}
                onChange={(v) => set("rooms", v)}
                min={1}
                max={50}
              />
            </div>

            {/* Rent + Currency */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.rent}</label>
              <div className="flex gap-2">
                <div className="flex bg-stone-100 border border-stone-200 rounded-xl p-0.5 gap-0.5 flex-shrink-0">
                  {(["USD", "EUR", "TRY"] as Currency[]).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => set("currency", cur)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-black transition-all duration-200 ${
                        form.currency === cur
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-400 hover:text-stone-700"
                      }`}
                    >
                      {CURRENCY_SYMBOLS[cur]}&thinsp;{cur}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  value={form.rent}
                  onChange={(e) => set("rent", e.target.value)}
                  placeholder="0"
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm min-w-0"
                />
              </div>
            </div>

            {/* Address */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">{t.address}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder={t.addressPlaceholder}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
              />
            </div>

            {/* Photos */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                {t.photos}
                <span className="ml-2 text-xs font-normal text-stone-400">{form.photos.length}/3</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {form.photoPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                ))}
                {form.photos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-orange-400 hover:text-orange-400 transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    <span className="text-[10px] font-semibold leading-none">
                      {form.photos.length === 0 ? t.uploadPhotos : t.addMorePhotos}
                    </span>
                  </button>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotos}
              />
            </div>
          </div>

          {validationError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {validationError}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.back}
            </button>
            <button
              onClick={goNext}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: Confirmation ──────────────────────────────────────────────────
  if (step === 3 || (step === 3 && form.type === "needs_place")) {
    const isHasPlace = form.type === "has_place";

    const rows: { label: string; value: string }[] = [
      {
        label: t.typeLabel,
        value: isHasPlace ? t.hasPlaceLabel : t.needsPlaceLabel,
      },
      ...(isHasPlace
        ? [
            { label: t.smokingLabel, value: form.smoking ? t.yes : t.no },
            { label: t.parkingLabel, value: form.parking ? t.yes : t.no },
            { label: t.residentsLabel, value: `${form.current_residents} ${t.person}` },
            { label: t.roommatesLabel, value: `${form.needed_roommates} ${t.person}` },
            { label: t.roomsLabel, value: `${form.rooms}` },
            {
              label: t.rentLabel,
              value: form.rent
                ? `${CURRENCY_SYMBOLS[form.currency]}${form.rent} / ${lang === "tr" ? "ay" : lang === "fa" ? "ماه" : lang === "ar" ? "شهر" : "mo"}`
                : "—",
            },
            { label: t.addressLabel, value: form.address || "—" },
          ]
        : []),
    ];

    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          {/* Back to home */}
          <Link href="/" dir="ltr" className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
              <polyline points={lang === "fa" || lang === "ar" ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
            </svg>
            <span>{lang === "tr" ? "Ana Sayfa" : lang === "fa" ? "صفحه اصلی" : lang === "ar" ? "الرئيسية" : "Home"}</span>
          </Link>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step3Title}</p>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {/* Photos preview */}
            {form.photoPreviews.length > 0 && (
              <div className="flex gap-1">
                {form.photoPreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="flex-1 h-40 object-cover"
                    style={{ maxWidth: `${100 / form.photoPreviews.length}%` }}
                  />
                ))}
              </div>
            )}

            {/* Detail rows */}
            <div className="divide-y divide-stone-100">
              {rows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between px-5 py-4 gap-4">
                  <span className="text-sm text-stone-500 font-medium flex-shrink-0">{label}</span>
                  <span className="text-sm font-semibold text-stone-900 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.edit}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t.submitting}
                </span>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
