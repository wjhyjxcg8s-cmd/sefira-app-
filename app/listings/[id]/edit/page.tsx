"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "TRY", label: "₺ TRY" },
  { value: "AED", label: "د.إ AED" },
  { value: "TOMAN", label: "ت تومان" },
  { value: "RUB", label: "₽ RUB" },
];

const HOUSE_TYPE_OPTIONS = ["apartment", "villa", "residence", "dormitory", "independent"] as const;

const translations = {
  tr: {
    title: "İlanı Düzenle",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "İlan başarıyla güncellendi!",
    goBack: "İlanlarıma Dön",
    photos: "Fotoğraflar (Maks. 3)",
    addPhoto: "Fotoğraf Ekle",
    city: "Şehir",
    cityPlaceholder: "İstanbul, Berlin...",
    district: "İlçe / Bölge",
    districtPlaceholder: "Kadıköy, Mitte...",
    rent: "Aylık Paylaşım Ücreti",
    rentPlaceholder: "0",
    currency: "Para Birimi",
    houseType: "Konut Tipi",
    floor: "Kat",
    elevator: "Asansör",
    parking: "Otopark",
    furnished: "Eşyalı",
    smoking: "Sigara İzni",
    currentResidents: "Şu An Kaç Kişisiniz?",
    neededRoommates: "Aranan Ev Arkadaşı Sayısı",
    rooms: "Oda Sayısı",
    description: "Açıklama",
    descPlaceholder: "Kendinizi ve aradığınız ev arkadaşını tanıtın...",
    yes: "Var",
    no: "Yok",
    houseTypeApartment: "Daire",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Rezidans",
    houseTypeDormitory: "Yurt",
    houseTypeIndependent: "Müstakil Ev",
    errorSave: "Kayıt sırasında hata oluştu. Lütfen tekrar deneyin.",
    errorNoPhoto: "En az bir fotoğraf eklemelisiniz.",
    errorPhoto: "Fotoğraf yüklenirken hata oluştu.",
    notOwner: "Bu ilanı düzenleme yetkiniz yok.",
    notFound: "İlan bulunamadı.",
    removePhoto: "Fotoğrafı kaldır",
    section_photos: "Fotoğraflar",
    section_location: "Konum",
    section_price: "Fiyat",
    section_property: "Konut Özellikleri",
    section_occupancy: "Kiracı Bilgileri",
    section_description: "Açıklama",
  },
  en: {
    title: "Edit Listing",
    save: "Save",
    saving: "Saving...",
    saved: "Listing updated successfully!",
    goBack: "Back to My Listings",
    photos: "Photos (Max 3)",
    addPhoto: "Add Photo",
    city: "City",
    cityPlaceholder: "Istanbul, Berlin...",
    district: "District / Area",
    districtPlaceholder: "Kadıköy, Mitte...",
    rent: "Monthly Sharing Cost",
    rentPlaceholder: "0",
    currency: "Currency",
    houseType: "Property Type",
    floor: "Floor",
    elevator: "Elevator",
    parking: "Parking",
    furnished: "Furnished",
    smoking: "Smoking Allowed",
    currentResidents: "Current Number of Residents",
    neededRoommates: "Roommates Needed",
    rooms: "Number of Rooms",
    description: "Description",
    descPlaceholder: "Introduce yourself and describe your ideal housemate...",
    yes: "Yes",
    no: "No",
    houseTypeApartment: "Apartment",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Residence",
    houseTypeDormitory: "Dormitory",
    houseTypeIndependent: "Independent House",
    errorSave: "Error saving. Please try again.",
    errorNoPhoto: "You must add at least one photo.",
    errorPhoto: "Error uploading photo.",
    notOwner: "You are not authorised to edit this listing.",
    notFound: "Listing not found.",
    removePhoto: "Remove photo",
    section_photos: "Photos",
    section_location: "Location",
    section_price: "Price",
    section_property: "Property Details",
    section_occupancy: "Occupancy",
    section_description: "Description",
  },
  fa: {
    title: "ویرایش آگهی",
    save: "ذخیره",
    saving: "در حال ذخیره...",
    saved: "آگهی با موفقیت به‌روز شد!",
    goBack: "بازگشت به آگهی‌هایم",
    photos: "عکس‌ها (حداکثر ۳)",
    addPhoto: "افزودن عکس",
    city: "شهر",
    cityPlaceholder: "تهران، برلین...",
    district: "منطقه",
    districtPlaceholder: "ونک، نیاوران...",
    rent: "هزینه مشترک ماهانه",
    rentPlaceholder: "0",
    currency: "واحد پول",
    houseType: "نوع خانه",
    floor: "طبقه",
    elevator: "آسانسور",
    parking: "پارکینگ",
    furnished: "با امکانات",
    smoking: "اجازه سیگار",
    currentResidents: "تعداد ساکنین فعلی",
    neededRoommates: "تعداد هم‌خانه مورد نیاز",
    rooms: "تعداد اتاق‌ها",
    description: "توضیحات",
    descPlaceholder: "خودتون رو معرفی کنید و بگید دنبال چه هم‌خانه‌ای می‌گردید...",
    yes: "بله",
    no: "خیر",
    houseTypeApartment: "آپارتمان",
    houseTypeVilla: "ویلا",
    houseTypeResidence: "رزیدانس",
    houseTypeDormitory: "خوابگاه",
    houseTypeIndependent: "خانه مستقل",
    errorSave: "خطا در ذخیره‌سازی. لطفاً دوباره تلاش کنید.",
    errorNoPhoto: "باید حداقل یک عکس اضافه کنید.",
    errorPhoto: "خطا در بارگذاری عکس.",
    notOwner: "شما مجاز به ویرایش این آگهی نیستید.",
    notFound: "آگهی یافت نشد.",
    removePhoto: "حذف عکس",
    section_photos: "عکس‌ها",
    section_location: "موقعیت",
    section_price: "قیمت",
    section_property: "مشخصات خانه",
    section_occupancy: "اطلاعات ساکنین",
    section_description: "توضیحات",
  },
  ar: {
    title: "تعديل الإعلان",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    saved: "تم تحديث الإعلان بنجاح!",
    goBack: "العودة إلى إعلاناتي",
    photos: "الصور (الحد الأقصى 3)",
    addPhoto: "إضافة صورة",
    city: "المدينة",
    cityPlaceholder: "إسطنبول، برلين...",
    district: "الحي / المنطقة",
    districtPlaceholder: "بشكتاش، ميته...",
    rent: "تكلفة المشاركة الشهرية",
    rentPlaceholder: "0",
    currency: "العملة",
    houseType: "نوع العقار",
    floor: "الطابق",
    elevator: "مصعد",
    parking: "موقف سيارات",
    furnished: "مفروش",
    smoking: "التدخين مسموح",
    currentResidents: "عدد السكان الحاليين",
    neededRoommates: "عدد شركاء السكن المطلوبين",
    rooms: "عدد الغرف",
    description: "الوصف",
    descPlaceholder: "عرّف بنفسك واوصف شريك السكن المثالي...",
    yes: "نعم",
    no: "لا",
    houseTypeApartment: "شقة",
    houseTypeVilla: "فيلا",
    houseTypeResidence: "ريزيدنس",
    houseTypeDormitory: "سكن طلابي",
    houseTypeIndependent: "بيت مستقل",
    errorSave: "خطأ في الحفظ. يرجى المحاولة مرة أخرى.",
    errorNoPhoto: "يجب إضافة صورة واحدة على الأقل.",
    errorPhoto: "خطأ في رفع الصورة.",
    notOwner: "غير مصرح لك بتعديل هذا الإعلان.",
    notFound: "الإعلان غير موجود.",
    removePhoto: "إزالة الصورة",
    section_photos: "الصور",
    section_location: "الموقع",
    section_price: "السعر",
    section_property: "تفاصيل العقار",
    section_occupancy: "معلومات السكن",
    section_description: "الوصف",
  },
  de: {
    title: "Inserat bearbeiten",
    save: "Speichern",
    saving: "Wird gespeichert...",
    saved: "Inserat erfolgreich aktualisiert!",
    goBack: "Zurück zu meinen Inseraten",
    photos: "Fotos (max. 3)",
    addPhoto: "Foto hinzufügen",
    city: "Stadt",
    cityPlaceholder: "Istanbul, Berlin...",
    district: "Bezirk / Stadtteil",
    districtPlaceholder: "Kadıköy, Mitte...",
    rent: "Monatliche Mietkosten",
    rentPlaceholder: "0",
    currency: "Währung",
    houseType: "Immobilientyp",
    floor: "Etage",
    elevator: "Aufzug",
    parking: "Parkplatz",
    furnished: "Möbliert",
    smoking: "Rauchen erlaubt",
    currentResidents: "Aktuelle Bewohnerzahl",
    neededRoommates: "Gesuchte Mitbewohner",
    rooms: "Zimmeranzahl",
    description: "Beschreibung",
    descPlaceholder: "Stellen Sie sich vor und beschreiben Sie Ihren idealen Mitbewohner...",
    yes: "Ja",
    no: "Nein",
    houseTypeApartment: "Wohnung",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Residenz",
    houseTypeDormitory: "Wohnheim",
    houseTypeIndependent: "Einfamilienhaus",
    errorSave: "Fehler beim Speichern. Bitte versuchen Sie es erneut.",
    errorNoPhoto: "Sie müssen mindestens ein Foto hinzufügen.",
    errorPhoto: "Fehler beim Hochladen des Fotos.",
    notOwner: "Sie sind nicht berechtigt, dieses Inserat zu bearbeiten.",
    notFound: "Inserat nicht gefunden.",
    removePhoto: "Foto entfernen",
    section_photos: "Fotos",
    section_location: "Standort",
    section_price: "Preis",
    section_property: "Immobiliendetails",
    section_occupancy: "Belegung",
    section_description: "Beschreibung",
  },
  ru: {
    title: "Редактировать объявление",
    save: "Сохранить",
    saving: "Сохранение...",
    saved: "Объявление успешно обновлено!",
    goBack: "Вернуться к моим объявлениям",
    photos: "Фотографии (макс. 3)",
    addPhoto: "Добавить фото",
    city: "Город",
    cityPlaceholder: "Стамбул, Берлин...",
    district: "Район",
    districtPlaceholder: "Кадыкёй, Митте...",
    rent: "Ежемесячная стоимость",
    rentPlaceholder: "0",
    currency: "Валюта",
    houseType: "Тип жилья",
    floor: "Этаж",
    elevator: "Лифт",
    parking: "Парковка",
    furnished: "С мебелью",
    smoking: "Курение разрешено",
    currentResidents: "Текущее количество жильцов",
    neededRoommates: "Нужно соседей",
    rooms: "Количество комнат",
    description: "Описание",
    descPlaceholder: "Расскажите о себе и опишите идеального соседа...",
    yes: "Есть",
    no: "Нет",
    houseTypeApartment: "Квартира",
    houseTypeVilla: "Вилла",
    houseTypeResidence: "Резиденция",
    houseTypeDormitory: "Общежитие",
    houseTypeIndependent: "Частный дом",
    errorSave: "Ошибка при сохранении. Попробуйте ещё раз.",
    errorNoPhoto: "Необходимо добавить хотя бы одно фото.",
    errorPhoto: "Ошибка при загрузке фото.",
    notOwner: "У вас нет прав на редактирование этого объявления.",
    notFound: "Объявление не найдено.",
    removePhoto: "Удалить фото",
    section_photos: "Фотографии",
    section_location: "Местоположение",
    section_price: "Цена",
    section_property: "Детали жилья",
    section_occupancy: "Жильцы",
    section_description: "Описание",
  },
};

type Lang = keyof typeof translations;

interface ListingData {
  id: number;
  user_id: string;
  photos: string[] | null;
  city: string | null;
  district: string | null;
  rent: number | null;
  currency: string;
  house_type: string | null;
  floor: number | null;
  elevator: boolean;
  parking: boolean;
  furnished: boolean;
  smoking: boolean;
  current_residents: number;
  needed_roommates: number;
  rooms: number;
  description: string | null;
}

interface FormState {
  photos: string[];
  city: string;
  district: string;
  rent: string;
  currency: string;
  house_type: string;
  floor: number;
  elevator: boolean;
  parking: boolean;
  furnished: boolean;
  smoking: boolean;
  current_residents: number;
  needed_roommates: number;
  rooms: number;
  description: string;
}

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
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
          value
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        }`}
      >
        {labelOn}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
          !value
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
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
  max = 20,
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
        className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 font-black text-stone-600 flex items-center justify-center active:scale-95 transition-all"
      >
        −
      </button>
      <span className="w-8 text-center font-black text-stone-900 text-base">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 font-black text-stone-600 flex items-center justify-center active:scale-95 transition-all"
      >
        +
      </button>
    </div>
  );
}

export default function EditListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params.id;

  const { lang } = useLang();
  const t = translations[lang];
  const dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";

  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notOwner, setNotOwner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    photos: [],
    city: "",
    district: "",
    rent: "",
    currency: "TRY",
    house_type: "apartment",
    floor: 0,
    elevator: false,
    parking: false,
    furnished: false,
    smoking: false,
    current_residents: 1,
    needed_roommates: 1,
    rooms: 2,
    description: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { setFetching(false); return; }

    supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setFetching(false); return; }
        const listing = data as ListingData;
        if (listing.user_id !== user.id) { setNotOwner(true); setFetching(false); return; }
        setForm({
          photos: listing.photos ?? [],
          city: listing.city ?? "",
          district: listing.district ?? "",
          rent: listing.rent != null ? String(listing.rent) : "",
          currency: listing.currency ?? "TRY",
          house_type: listing.house_type ?? "apartment",
          floor: listing.floor ?? 0,
          elevator: listing.elevator ?? false,
          parking: listing.parking ?? false,
          furnished: listing.furnished ?? false,
          smoking: listing.smoking ?? false,
          current_residents: listing.current_residents ?? 1,
          needed_roommates: listing.needed_roommates ?? 1,
          rooms: listing.rooms ?? 2,
          description: listing.description ?? "",
        });
        setFetching(false);
      });
  }, [user, loading, listingId]);

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!user || files.length === 0) return;
    const available = 3 - form.photos.length - uploadingCount;
    const newFiles = files.slice(0, Math.max(0, available));
    if (newFiles.length === 0) return;
    setPhotoError(null);
    setUploadingCount((c) => c + newFiles.length);
    for (const file of newFiles) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('userId', user.id);
      const res = await fetch('/api/upload-photo', { method: 'POST', body: fd });
      setUploadingCount((c) => c - 1);
      if (!res.ok) {
        setPhotoError(t.errorPhoto);
      } else {
        const { url } = await res.json();
        setForm((f) => ({ ...f, photos: [...f.photos, url] }));
      }
    }
  };

  const removePhoto = (idx: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.photos || form.photos.length === 0) {
      setSaveError(t.errorNoPhoto);
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const { error } = await supabase
      .from("listings")
      .update({
        photos: form.photos,
        city: form.city || null,
        district: form.district || null,
        rent: parseFloat(form.rent) || null,
        currency: form.currency,
        house_type: form.house_type || null,
        floor: form.floor,
        elevator: form.elevator,
        parking: form.parking,
        furnished: form.furnished,
        smoking: form.smoking,
        current_residents: form.current_residents,
        needed_roommates: form.needed_roommates,
        rooms: form.rooms,
        description: form.description || null,
      })
      .eq("id", listingId);

    setSaving(false);
    if (error) {
      setSaveError(t.errorSave);
    } else {
      setSaved(true);
      setTimeout(() => router.push("/my-listings"), 1500);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <p className="text-stone-600 text-center font-medium">{t.notOwner}</p>
        <Link href="/" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95">
          Ana Sayfa
        </Link>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <p className="text-stone-600 text-center font-medium">{t.notFound}</p>
        <Link href="/my-listings" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95">
          {t.goBack}
        </Link>
      </div>
    );
  }

  // ── Not owner ─────────────────────────────────────────────────────────────
  if (notOwner) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-8 h-8 text-rose-500">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-stone-600 text-center font-medium">{t.notOwner}</p>
        <Link href="/" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95">
          Ana Sayfa
        </Link>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50" dir={dir}>
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
          <Link href="/my-listings" className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1">
            ← {t.goBack}
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-56 md:pb-32 px-5 max-w-2xl mx-auto">
        {/* Back button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mb-5">
          <Link
            href="/my-listings"
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-5 py-2.5 rounded-2xl transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.goBack}
          </Link>
        </motion.div>

        <h1 className="text-2xl font-black text-stone-900 mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5 text-white">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          {t.title}
        </h1>

        <div className="flex flex-col gap-5">

          {/* ── Photos ─────────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-4">{t.section_photos}</h2>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-stone-700">{t.photos}</label>
              <span className="text-xs text-stone-400">{form.photos.length + uploadingCount}/3</span>
            </div>

            {(form.photos.length > 0 || uploadingCount > 0) && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      title={t.removePhoto}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {Array.from({ length: uploadingCount }).map((_, i) => (
                  <div key={`uploading-${i}`} className="aspect-square rounded-xl bg-stone-100 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                  </div>
                ))}
              </div>
            )}

            {form.photos.length + uploadingCount < 3 && (
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-orange-300 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer bg-orange-50 hover:bg-orange-100 active:bg-orange-100 transition-colors"
              >
                <span className="text-3xl">📷</span>
                <p className="text-sm font-medium text-orange-700">{t.addPhoto}</p>
              </div>
            )}

            <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
            {photoError && <p className="mt-3 text-xs text-rose-500">{photoError}</p>}
          </section>

          {/* ── Location ───────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-4">{t.section_location}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t.city}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder={t.cityPlaceholder}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t.district}</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setField("district", e.target.value)}
                  placeholder={t.districtPlaceholder}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />
              </div>
            </div>
          </section>

          {/* ── Price ──────────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-4">{t.section_price}</h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t.rent}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.rent}
                  onChange={(e) => setField("rent", e.target.value)}
                  placeholder={t.rentPlaceholder}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />
              </div>
              <div className="w-36">
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t.currency}</label>
                <select
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-3 text-stone-900 bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Property Details ───────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
            <div className="p-5">
              <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider">{t.section_property}</h2>
            </div>

            {/* House type */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.houseType}</label>
              <div className="flex flex-wrap gap-2">
                {HOUSE_TYPE_OPTIONS.map((ht) => {
                  const labelKey = `houseType${ht.charAt(0).toUpperCase()}${ht.slice(1)}` as keyof typeof translations.en;
                  return (
                    <button
                      key={ht}
                      type="button"
                      onClick={() => setField("house_type", ht)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        form.house_type === ht
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {t[labelKey] as string}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floor */}
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.floor}</label>
              <NumberStepper value={form.floor} onChange={(v) => setField("floor", v)} min={0} max={50} />
            </div>

            {/* Elevator */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.elevator}</label>
              <Toggle value={form.elevator} labelOn={t.yes} labelOff={t.no} onChange={(v) => setField("elevator", v)} />
            </div>

            {/* Parking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.parking}</label>
              <Toggle value={form.parking} labelOn={t.yes} labelOff={t.no} onChange={(v) => setField("parking", v)} />
            </div>

            {/* Furnished */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.furnished}</label>
              <Toggle value={form.furnished} labelOn={t.yes} labelOff={t.no} onChange={(v) => setField("furnished", v)} />
            </div>

            {/* Smoking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.smoking}</label>
              <Toggle value={form.smoking} labelOn={t.yes} labelOff={t.no} onChange={(v) => setField("smoking", v)} />
            </div>
          </section>

          {/* ── Occupancy ──────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
            <div className="p-5">
              <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider">{t.section_occupancy}</h2>
            </div>
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.currentResidents}</label>
              <NumberStepper value={form.current_residents} onChange={(v) => setField("current_residents", v)} min={1} max={20} />
            </div>
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.neededRoommates}</label>
              <NumberStepper value={form.needed_roommates} onChange={(v) => setField("needed_roommates", v)} min={1} max={10} />
            </div>
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.rooms}</label>
              <NumberStepper value={form.rooms} onChange={(v) => setField("rooms", v)} min={1} max={20} />
            </div>
          </section>

          {/* ── Description ────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="text-sm font-black text-stone-700 uppercase tracking-wider mb-4">{t.section_description}</h2>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm resize-none"
            />
          </section>

          {/* ── Feedback messages ──────────────────────────────────────────── */}
          {saveError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <p className="text-sm text-rose-600">{saveError}</p>
            </div>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5 text-emerald-500 flex-shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm font-semibold text-emerald-700">{t.saved}</p>
            </motion.div>
          )}

        </div>
      </div>

      {/* Sticky save button — sits above the mobile bottom nav bar (h-16 + safe area) */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-xl border-t border-stone-200">
        <div className="max-w-2xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || uploadingCount > 0}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/30 hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {t.save}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
