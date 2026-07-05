"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/lib/AuthContext";
import { useLang } from "@/app/lib/LangContext";
import { supabase } from "@/app/lib/supabase";
import ReactCrop, { centerCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// ── Countries (same list as create-listing) ──────────────────────────────────
const TOP_COUNTRY_CODES = ["TR", "IR", "DE", "AE", "GB", "RU", "US", "FR", "ES"];
const OTHER_COUNTRY_CODES = [
  "AF","AL","DZ","AD","AO","AR","AM","AU","AT","AZ","BH","BD",
  "BY","BE","BO","BA","BR","BG","KH","CA","CL","CN","CO","HR",
  "CU","CY","CZ","DK","EG","EE","ET","FI","GE","GH","GR","HU",
  "IN","ID","IQ","IE","IL","IT","JP","JO","KZ","KE","KW","KG",
  "LV","LB","LY","LT","LU","MY","MX","MD","MN","MA","NL","NZ",
  "NG","MK","NO","OM","PK","PS","PE","PH","PL","PT","QA","RO",
  "SA","RS","SG","SK","SI","ZA","KR","SE","CH","SY","TJ","TH",
  "TN","TM","UA","UZ","VE","VN","YE",
];

const LANG_MAP: Record<string, string> = {
  tr: "tr", en: "en", fa: "fa", ar: "ar", de: "de", ru: "ru",
};

const getCountryName = (countryCode: string, lang: string): string => {
  try {
    const displayNames = new Intl.DisplayNames([LANG_MAP[lang] || "en"], { type: "region" });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const ARAB_COUNTRIES = new Set(['SA','AE','EG','IQ','SY','JO','LB','KW','QA','BH','OM','YE','LY','TN','DZ','MA','SD','MR','SO','DJ','KM','PS']);

const countryCityExamples: Record<string, string> = {
  'TR': 'İstanbul, Ankara, İzmir...',
  'IR': 'Tehran, Mashhad, Shiraz...',
  'US': 'New York, Los Angeles, Chicago...',
  'DE': 'Berlin, Munich, Hamburg...',
  'GB': 'London, Manchester, Birmingham...',
  'FR': 'Paris, Lyon, Marseille...',
  'AE': 'Dubai, Abu Dhabi, Sharjah...',
  'SA': 'Riyadh, Jeddah, Mecca...',
  'RU': 'Moscow, Saint Petersburg, Kazan...',
  'CN': 'Beijing, Shanghai, Guangzhou...',
  'IN': 'Mumbai, Delhi, Bangalore...',
  'PK': 'Karachi, Lahore, Islamabad...',
  'AF': 'Kabul, Herat, Mazar-i-Sharif...',
  'IQ': 'Baghdad, Basra, Erbil...',
  'SY': 'Damascus, Aleppo, Homs...',
  'EG': 'Cairo, Alexandria, Giza...',
  'MA': 'Casablanca, Rabat, Marrakech...',
  'TN': 'Tunis, Sfax, Sousse...',
  'NL': 'Amsterdam, Rotterdam, The Hague...',
  'IT': 'Rome, Milan, Naples...',
  'ES': 'Madrid, Barcelona, Valencia...',
  'CA': 'Toronto, Vancouver, Montreal...',
  'AU': 'Sydney, Melbourne, Brisbane...',
  'JP': 'Tokyo, Osaka, Kyoto...',
  'KR': 'Seoul, Busan, Incheon...',
  'BR': 'São Paulo, Rio de Janeiro, Brasília...',
  'MX': 'Mexico City, Guadalajara, Monterrey...',
  'AZ': 'Baku, Ganja, Sumqayit...',
  'UZ': 'Tashkent, Samarkand, Bukhara...',
};

type Currency = "USD" | "EUR" | "TRY" | "AED" | "IRR" | "RUB";

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "TRY", label: "₺ TRY" },
  { value: "AED", label: "د.إ AED" },
  { value: "IRR", label: "﷼ IRR" },
  { value: "RUB", label: "₽ RUB" },
];

// ── Normalize helper (same as create-listing) ────────────────────────────────
const normalize = (str: string): string =>
  str
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o')
    .replace(/ş/g, 's').replace(/ü/g, 'u');

// ── Commercial space types (matches the 10 options on the homepage picker) ──
const SPACE_TYPES: Record<string, { emoji: string; label: string }> = {
  "ofis": { emoji: "🏢", label: "Ofis" },
  "dukkan": { emoji: "🏪", label: "Dükkan" },
  "berber-koltugu": { emoji: "💈", label: "Berber Koltuğu" },
  "atolye": { emoji: "🔧", label: "Atölye" },
  "depo": { emoji: "📦", label: "Depo" },
  "mutfak": { emoji: "🍳", label: "Mutfak" },
  "icerik-studyosu": { emoji: "🎬", label: "İçerik Stüdyosu" },
  "egitim-sinifi": { emoji: "📚", label: "Eğitim Sınıfı" },
  "otopark": { emoji: "🚗", label: "Otopark" },
  "ticari-adres": { emoji: "📮", label: "Ticari Adres" },
};

const AMENITIES: { key: string; emoji: string; label: string }[] = [
  { key: "wifi", emoji: "🌐", label: "İnternet/WiFi" },
  { key: "ac", emoji: "❄️", label: "Klima" },
  { key: "heating", emoji: "🔥", label: "Isıtma" },
  { key: "parking", emoji: "🚗", label: "Otopark" },
  { key: "security", emoji: "🔒", label: "Güvenlik/Kamera" },
  { key: "elevator", emoji: "🛗", label: "Asansör" },
  { key: "accessibility", emoji: "♿", label: "Engelli Erişimi" },
  { key: "wc", emoji: "🚽", label: "WC/Tuvalet" },
  { key: "kitchen", emoji: "🍳", label: "Mutfak/Çay Ocağı" },
  { key: "access247", emoji: "💡", label: "7/24 Erişim" },
  { key: "printer", emoji: "🖨️", label: "Yazıcı/Fotokopi" },
  { key: "storage", emoji: "📦", label: "Depolama Alanı" },
];

interface CommercialForm {
  countryCode: string;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  price: string;
  currency: Currency;
  sqm: string;
  amenities: string[];
}

const initialForm: CommercialForm = {
  countryCode: "",
  country: "",
  city: "",
  district: "",
  neighborhood: "",
  price: "",
  currency: "USD",
  sqm: "",
  amenities: [],
};

// ── Country selector (same behavior as create-listing) ───────────────────────
function CountrySelect({
  countryCode,
  lang,
  onSelect,
  label,
  placeholder,
  hasError,
  required,
}: {
  countryCode: string;
  lang: string;
  onSelect: (code: string, name: string) => void;
  label: string;
  placeholder: string;
  hasError?: boolean;
  required?: boolean;
}) {
  const [inputVal, setInputVal] = useState(() => countryCode ? getCountryName(countryCode, lang) : "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(countryCode ? getCountryName(countryCode, lang) : "");
  }, [countryCode, lang]);

  const sortedOthers = useMemo(() =>
    [...OTHER_COUNTRY_CODES].sort((a, b) =>
      getCountryName(a, lang).localeCompare(getCountryName(b, lang))
    ),
    [lang]
  );

  const allCodes = useMemo(() => [...TOP_COUNTRY_CODES, ...sortedOthers], [sortedOthers]);

  const filtered = useMemo(() => {
    if (!inputVal.trim()) return allCodes;
    const q = inputVal.toLowerCase();
    return allCodes.filter((code) => getCountryName(code, lang).toLowerCase().includes(q));
  }, [inputVal, allCodes, lang]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputVal(countryCode ? getCountryName(countryCode, lang) : "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [countryCode, lang]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-stone-700 mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => { setInputVal(e.target.value); setIsOpen(true); }}
        className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${hasError ? "border-red-400 border-2" : "border-gray-200"}`}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((code) => {
            const name = getCountryName(code, lang);
            return (
              <button
                key={code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(code, name); setInputVal(name); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${
                  countryCode === code ? "text-orange-500 font-semibold" : "text-stone-700"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function CreateCommercialListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "";
  const modeParam = (searchParams.get("mode") as "owner" | "seeker" | null) ?? null;
  const spaceType = SPACE_TYPES[typeParam] ?? null;

  const dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";

  const [step, setStep] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  const [form, setForm] = useState<CommercialForm>(initialForm);
  const set = <K extends keyof CommercialForm>(key: K, val: CommercialForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  // ── Description & photos (Step 2) ─────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // uploaded photo URLs (post NSFW check + compression)
  const [errors, setErrors] = useState<{ description?: string; photos?: string }>({});
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state — identical approach to create-listing
  const [showPhotoCropModal, setShowPhotoCropModal] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState("");
  const [photoCrop, setPhotoCrop] = useState<Crop>();
  const [photoCompletedCrop, setPhotoCompletedCrop] = useState<PixelCrop>();
  const [cropSaving, setCropSaving] = useState(false);
  const [cropRotation, setCropRotation] = useState(0);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const pendingCropFilesRef = useRef<File[]>([]);
  const photosUploadedDuringCropRef = useRef(0);

  useEffect(() => {
    if (!photoError) return;
    const timer = setTimeout(() => setPhotoError(null), 4000);
    return () => clearTimeout(timer);
  }, [photoError]);

  const loadImageCorrected = async (file: File): Promise<string> => {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      return canvas.toDataURL("image/jpeg", 0.95);
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const rotateImage = (srcDataUrl: string, degrees: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const swap = degrees % 180 !== 0;
        canvas.width = swap ? img.height : img.width;
        canvas.height = swap ? img.width : img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = srcDataUrl;
    });
  };

  const handleCropRotate = async (delta: number) => {
    setCropRotation((r) => r + delta);
    const rotated = await rotateImage(cropImgSrc, delta);
    setCropImgSrc(rotated);
    setPhotoCrop(undefined);
    setPhotoCompletedCrop(undefined);
  };

  const openCropForFile = (file: File) => {
    loadImageCorrected(file).then((dataUrl) => {
      setCropImgSrc(dataUrl);
      setCropRotation(0);
      setPhotoCrop(undefined);
      setPhotoCompletedCrop(undefined);
      setShowPhotoCropModal(true);
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!user || files.length === 0) return;
    const available = 3 - photos.length - uploadingCount;
    const newFiles = files.slice(0, Math.max(0, available));
    if (newFiles.length === 0) return;
    setPhotoError(null);
    if (errors.photos) setErrors(prev => ({ ...prev, photos: undefined }));
    pendingCropFilesRef.current = newFiles;
    photosUploadedDuringCropRef.current = photos.length;
    openCropForFile(newFiles[0]);
  };

  const onPhotoCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      { unit: "%", x: 5, y: 5, width: 90, height: 90 },
      width,
      height
    );
    setPhotoCrop(crop);
    setPhotoCompletedCrop({
      unit: "px",
      x: (crop.x / 100) * width,
      y: (crop.y / 100) * height,
      width: (crop.width / 100) * width,
      height: (crop.height / 100) * height,
    });
  };

  const handlePhotoCropSave = () => {
    if (!photoCompletedCrop || !cropImgRef.current || !user) return;
    const image = cropImgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.round(photoCompletedCrop.width * scaleX);
    canvas.height = Math.round(photoCompletedCrop.height * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      photoCompletedCrop.x * scaleX,
      photoCompletedCrop.y * scaleY,
      photoCompletedCrop.width * scaleX,
      photoCompletedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    setCropSaving(true);
    canvas.toBlob(async (blob) => {
      if (!blob) { setCropSaving(false); return; }
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("userId", user.id);
      setUploadingCount((c) => c + 1);
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      setUploadingCount((c) => c - 1);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setPhotoError(body.error === 'inappropriate_content' ? "Bu fotoğraf uygunsuz içerik nedeniyle yüklenemedi." : "Fotoğraf yüklenirken hata oluştu.");
      } else {
        const { url } = await res.json();
        setPhotos((p) => [...p, url]);
        photosUploadedDuringCropRef.current += 1;
      }
      const remaining = pendingCropFilesRef.current.slice(1);
      pendingCropFilesRef.current = remaining;
      if (remaining.length > 0 && photosUploadedDuringCropRef.current < 3) {
        openCropForFile(remaining[0]);
      } else {
        setShowPhotoCropModal(false);
        setCropImgSrc("");
      }
      setCropSaving(false);
    }, "image/jpeg", 0.92);
  };

  const handlePhotoCropCancel = () => {
    setShowPhotoCropModal(false);
    setCropImgSrc("");
    pendingCropFilesRef.current = [];
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Location cascading state (identical approach to create-listing) ───────
  const [countryIso, setCountryIso] = useState("TR");
  const [turkiyeData, setTurkiyeData] = useState<Record<string, Record<string, string[]>>>({});
  const [selectedIl, setSelectedIl] = useState("");
  const [selectedIlce, setSelectedIlce] = useState("");

  const [sehirQ, setSehirQ] = useState("");
  const [sehirSug, setSehirSug] = useState<string[]>([]);
  const [sehirOpen, setSehirOpen] = useState(false);

  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [citiesOfState, setCitiesOfState] = useState<string[]>([]);
  useEffect(() => {
    if (!countryIso || !selectedStateIso) { setCitiesOfState([]); return; }
    fetch(`/api/cities-of-state?country=${encodeURIComponent(countryIso)}&state=${encodeURIComponent(selectedStateIso)}`)
      .then(r => r.json())
      .then((data: string[]) => setCitiesOfState(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [countryIso, selectedStateIso]);

  const [ilceQ, setIlceQ] = useState("");
  const [ilceSug, setIlceSug] = useState<string[]>([]);
  const [ilceOpen, setIlceOpen] = useState(false);

  const [mahalleQ, setMahalleQ] = useState("");
  const [mahalleSug, setMahalleSug] = useState<string[]>([]);
  const [mahalleOpen, setMahalleOpen] = useState(false);

  const [iranCities, setIranCities] = useState<string[]>([]);
  const [russiaCitiesRU, setRussiaCitiesRU] = useState<string[]>([]);

  const [statesOfCountry, setStatesOfCountry] = useState<{ name: string; isoCode: string }[]>([]);
  useEffect(() => {
    if (!countryIso || countryIso === "TR" || countryIso === "IR" || countryIso === "RU") {
      setStatesOfCountry([]);
      return;
    }
    fetch(`/api/states?country=${encodeURIComponent(countryIso)}`)
      .then(r => r.json())
      .then(data => setStatesOfCountry(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [countryIso]);

  const [worldCitiesForCountry, setWorldCitiesForCountry] = useState<string[]>([]);
  useEffect(() => {
    if (!countryIso) { setWorldCitiesForCountry([]); return; }
    const countryName = getCountryName(countryIso, "en");
    if (!countryName) return;
    fetch(`/api/cities?country=${encodeURIComponent(countryName)}`)
      .then(r => r.json())
      .then((data: string[]) => setWorldCitiesForCountry(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [countryIso]);

  const handleCountryChange = (code: string, name: string) => {
    set("countryCode", code);
    setCountryIso(code);
    setSehirQ(""); setIlceQ(""); setMahalleQ("");
    setSelectedStateIso(""); setSelectedIl(""); setSelectedIlce("");
    setForm(f => ({ ...f, country: name, city: "", district: "", neighborhood: "" }));
    if (code === "TR" && Object.keys(turkiyeData).length === 0) {
      fetch("/turkiye-data.json").then(r => r.json()).then(setTurkiyeData).catch(() => {});
    }
    if (code === "IR" && iranCities.length === 0) {
      fetch("/iran-cities.json")
        .then(r => r.json())
        .then((data: { name: string }[]) => setIranCities(data.map(c => c.name).sort()))
        .catch(() => {});
    }
    if (code === "RU" && russiaCitiesRU.length === 0) {
      fetch("/russia-cities.json")
        .then(r => r.json())
        .then((data: { name: string }[]) => setRussiaCitiesRU(data.map(c => c.name).sort()))
        .catch(() => {});
    }
  };

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastError, setToastError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const goNext = () => {
    setStepErrors([]);
    setInvalidFields([]);
    const errors: string[] = [];
    const invalid: string[] = [];
    if (!form.countryCode) { errors.push("Ülke seçiniz"); invalid.push("country"); }
    if (!form.city) { errors.push("Şehir seçiniz"); invalid.push("city"); }
    if (countryIso === "TR" && !form.district) { errors.push("İlçe seçiniz"); invalid.push("district"); }
    if (!form.price || parseFloat(form.price) <= 0) { errors.push("Aylık bedel giriniz"); invalid.push("price"); }
    if (errors.length > 0) {
      setStepErrors(errors);
      setInvalidFields(invalid);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.back();
    }
  };

  const toggleAmenity = (key: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter(a => a !== key)
        : [...f.amenities, key],
    }));
  };

  const handleSubmit = async () => {
    const newErrors: { description?: string; photos?: string } = {};
    if (!description.trim() || description.trim().length < 20) {
      newErrors.description = "Açıklama en az 20 karakter olmalıdır.";
    }
    if (photos.length < 1) {
      newErrors.photos = "En az 1 fotoğraf yüklemelisiniz.";
    }
    if (newErrors.description || newErrors.photos) {
      setErrors(newErrors);
      if (newErrors.description) {
        descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        photosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // 1. Current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      }

      // 2. Photos were already uploaded (NSFW-checked + compressed) during crop-save
      const photoUrls = photos;

      // 3. Insert listing row
      const payload: Record<string, unknown> = {
        user_id: session.user.id,
        listing_category: "commercial",
        commercial_type: typeParam || null,
        country: form.country || null,
        city: form.city || null,
        district: form.district || null,
        neighborhood: form.neighborhood || null,
        price: parseFloat(form.price) || null,
        currency: form.currency,
        square_meters: form.sqm ? parseFloat(form.sqm) : null,
        amenities: form.amenities,
        description: description || null,
        photos: photoUrls,
        has_place: modeParam === "owner",
        needs_place: modeParam === "seeker",
      };

      const { error: dbErr } = await supabase.from("listings").insert(payload);
      if (dbErr) throw new Error(dbErr.message);

      setToastError(false);
      setToastMsg("İlanınız başarıyla yayınlandı! ✅");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/");
      }, 1500);
    } catch (err) {
      setToastError(true);
      setToastMsg(err instanceof Error ? err.message : "İlan yayınlanırken bir hata oluştu.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <p className="text-stone-600 text-center font-medium">İlan verebilmek için giriş yapınız.</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-stone-50">
      {/* ── Header: back arrow + step indicator ──────────────────────────── */}
      <nav
        dir="ltr"
        style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform" }}
        className="fixed top-0 left-0 right-0 w-full z-[9999] bg-white border-b border-stone-200 shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors flex-shrink-0"
            aria-label="Geri"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="font-black text-stone-900 flex-1 text-center pr-9">
            Ticari İlan Ver — Adım {step} / 2
          </span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
        {/* ── Progress bar ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-stone-500">Adım {step} / 2</p>
            <p className="text-xs font-bold text-orange-500">{Math.round((step / 2) * 100)}%</p>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {stepErrors.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
            <p className="text-red-600 font-bold text-sm mb-2">⚠️ Lütfen tüm zorunlu alanları doldurun:</p>
            <ul className="text-red-500 text-sm list-disc list-inside">
              {stepErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <h1 className="text-2xl font-black text-stone-900 mb-1">Konum &amp; Bütçe</h1>
              <p className="text-stone-500 mb-6 text-sm">Ticari alanınızın konumunu ve aylık bedelini belirtin</p>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
                {/* Location */}
                <div className="p-5 flex flex-col gap-4">
                  <CountrySelect
                    countryCode={form.countryCode}
                    lang={lang}
                    onSelect={handleCountryChange}
                    label="Ülke"
                    placeholder="Ülke ara..."
                    hasError={invalidFields.includes("country") && !form.countryCode}
                    required
                  />

                  {/* Şehir / İl */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {countryIso === "TR" ? "İl" : "Şehir"}<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sehirQ}
                        onChange={e => {
                          const v = e.target.value;
                          setSehirQ(v);
                          setForm(f => ({ ...f, city: v }));
                          const q = normalize(v);
                          if (countryIso === "TR") {
                            const all = Object.keys(turkiyeData);
                            if (v.length === 0) {
                              setSehirSug(all.slice(0, 6));
                              setSehirOpen(true);
                            } else {
                              const starts = all.filter(name => normalize(name).startsWith(q));
                              const includes = all.filter(name => !normalize(name).startsWith(q) && normalize(name).includes(q));
                              setSehirSug([...starts, ...includes].slice(0, 6));
                              setSehirOpen(starts.length + includes.length > 0);
                            }
                          } else if (!(lang === "ar" && ARAB_COUNTRIES.has(countryIso))) {
                            const cityList = countryIso === "IR" && lang === "fa"
                              ? iranCities
                              : countryIso === "RU" && lang === "ru"
                              ? russiaCitiesRU
                              : (worldCitiesForCountry.length ? worldCitiesForCountry : statesOfCountry.map(s => s.name));
                            if (v.length === 0) {
                              setSehirSug(cityList.slice(0, 8));
                              setSehirOpen(true);
                            } else {
                              const starts = cityList.filter(name => normalize(name).startsWith(q));
                              const includes = cityList.filter(name => !normalize(name).startsWith(q) && normalize(name).includes(q));
                              setSehirSug([...starts, ...includes].slice(0, 8));
                              setSehirOpen(starts.length + includes.length > 0);
                            }
                          }
                        }}
                        onFocus={() => {
                          if (countryIso === "TR") {
                            const all = Object.keys(turkiyeData);
                            setSehirSug(all.slice(0, 6));
                            setSehirOpen(all.length > 0);
                          } else if (!(lang === "ar" && ARAB_COUNTRIES.has(countryIso))) {
                            const cityList = countryIso === "IR" && lang === "fa"
                              ? iranCities
                              : countryIso === "RU" && lang === "ru"
                              ? russiaCitiesRU
                              : (worldCitiesForCountry.length ? worldCitiesForCountry : statesOfCountry.map(s => s.name));
                            setSehirSug(cityList.slice(0, 8));
                            setSehirOpen(cityList.length > 0);
                          }
                        }}
                        onBlur={() => setTimeout(() => setSehirOpen(false), 150)}
                        placeholder={lang === "ar" && ARAB_COUNTRIES.has(countryIso) ? "اكتب اسم مدينتك..." : (countryCityExamples[countryIso] || "City...")}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors ${invalidFields.includes("city") && !form.city ? "border-red-400" : "border-gray-200"}`}
                      />
                      {sehirOpen && sehirSug.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                          {sehirSug.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => {
                                setSehirQ(s);
                                setSelectedIl(s);
                                setForm(f => ({ ...f, city: s }));
                                setSehirOpen(false);
                                setIlceQ(""); setSelectedIlce(""); setMahalleQ("");
                                setForm(f => ({ ...f, district: "", neighborhood: "" }));
                                if (countryIso !== "TR") {
                                  const stateObj = statesOfCountry.find(st => st.name === s);
                                  if (stateObj) setSelectedStateIso(stateObj.isoCode);
                                }
                              }}
                              className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* İlçe — Turkey only */}
                  {countryIso === "TR" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        İlçe<span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={ilceQ}
                          disabled={!sehirQ}
                          onChange={e => {
                            const v = e.target.value;
                            setIlceQ(v);
                            setForm(f => ({ ...f, district: v }));
                            const q = normalize(v);
                            const ilceler = Object.keys(turkiyeData[selectedIl] || {});
                            if (v.length === 0) {
                              setIlceSug(ilceler.slice(0, 6));
                              setIlceOpen(true);
                            } else {
                              const starts = ilceler.filter(name => normalize(name).startsWith(q));
                              const includes = ilceler.filter(name => !normalize(name).startsWith(q) && normalize(name).includes(q));
                              setIlceSug([...starts, ...includes].slice(0, 6));
                              setIlceOpen(starts.length + includes.length > 0);
                            }
                          }}
                          onFocus={() => {
                            const ilceler = Object.keys(turkiyeData[selectedIl] || {});
                            setIlceSug(ilceler.slice(0, 6));
                            setIlceOpen(ilceler.length > 0);
                          }}
                          onBlur={() => setTimeout(() => setIlceOpen(false), 150)}
                          placeholder="Esenyurt, Kadıköy, Beşiktaş..."
                          className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${invalidFields.includes("district") && !form.district ? "border-red-400" : "border-gray-200"}`}
                        />
                        {ilceOpen && ilceSug.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                            {ilceSug.map((c, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                  setIlceQ(c);
                                  setSelectedIlce(c);
                                  setForm(f => ({ ...f, district: c }));
                                  setIlceOpen(false);
                                  setMahalleQ("");
                                  setForm(f => ({ ...f, neighborhood: "" }));
                                }}
                                className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mahalle (optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mahalle / Semt</label>
                    {countryIso === "TR" && selectedIl && selectedIlce ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={mahalleQ}
                          onChange={e => {
                            const v = e.target.value;
                            setMahalleQ(v);
                            setForm(f => ({ ...f, neighborhood: v }));
                            const mahalleler = turkiyeData[selectedIl]?.[selectedIlce] || [];
                            const q = normalize(v);
                            if (v.length === 0) {
                              setMahalleSug(mahalleler.slice(0, 6));
                              setMahalleOpen(true);
                            } else {
                              const starts = mahalleler.filter(m => normalize(m).startsWith(q));
                              const includes = mahalleler.filter(m => !normalize(m).startsWith(q) && normalize(m).includes(q));
                              setMahalleSug([...starts, ...includes].slice(0, 6));
                              setMahalleOpen(starts.length + includes.length > 0);
                            }
                          }}
                          onFocus={() => {
                            const mahalleler = turkiyeData[selectedIl]?.[selectedIlce] || [];
                            setMahalleSug(mahalleler.slice(0, 6));
                            setMahalleOpen(mahalleler.length > 0);
                          }}
                          onBlur={() => setTimeout(() => setMahalleOpen(false), 150)}
                          placeholder="Zafer Mh., Cumhuriyet Mh..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 bg-white text-sm"
                        />
                        {mahalleOpen && mahalleSug.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                            {mahalleSug.map((m, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                  setMahalleQ(m);
                                  setForm(f => ({ ...f, neighborhood: m }));
                                  setMahalleOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={form.neighborhood}
                        onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                        placeholder={countryIso === "TR" ? "Zafer Mh., Cumhuriyet Mh..." : ""}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Monthly price + currency */}
                <div className="p-5">
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Aylık Bedel<span className="text-red-500 ml-1">*</span></label>
                  <p className="text-xs text-stone-400 mb-3">Ticari alanınız için aylık beklenen bedel</p>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Para Birimi<span className="text-red-500 ml-1">*</span></label>
                  <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                    {CURRENCY_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set("currency", c.value)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                          form.currency === c.value
                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                            : "bg-gray-100 text-stone-600 hover:bg-gray-200"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0"
                    className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${invalidFields.includes("price") && (!form.price || parseFloat(form.price) <= 0) ? "border-red-400 border-2" : "border-gray-200"}`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={goBack}
                  className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
                >
                  Geri
                </button>
                <button
                  onClick={goNext}
                  className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
                >
                  İleri
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <h1 className="text-2xl font-black text-stone-900 mb-1">Ticari Detaylar</h1>
              <p className="text-stone-500 mb-6 text-sm">Alanınızın özelliklerini belirtin</p>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
                {/* Space type badge (read-only, from URL param) */}
                {spaceType && (
                  <div className="p-5">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Mekan Türü</label>
                    <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 font-bold text-sm px-4 py-2 rounded-full">
                      <span className="text-lg">{spaceType.emoji}</span>
                      {spaceType.label}
                    </span>
                  </div>
                )}

                {/* Square meters */}
                <div className="p-5">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Metrekare (m²)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sqm}
                    onChange={(e) => set("sqm", e.target.value)}
                    placeholder="0"
                    className="w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                  />
                </div>

                {/* Amenities */}
                <div className="p-5">
                  <label className="block text-sm font-semibold text-stone-700 mb-3">Olanaklar</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {AMENITIES.map((a) => {
                      const active = form.amenities.includes(a.key);
                      return (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() => toggleAmenity(a.key)}
                          className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-200 ${
                            active
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                          }`}
                        >
                          <span className="text-lg shrink-0">{a.emoji}</span>
                          <span className="leading-tight">{a.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="p-5">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Açıklama *</label>
                  <textarea
                    ref={descriptionRef}
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                    }}
                    placeholder="Alanınız hakkında detaylı bilgi verin..."
                    className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm resize-none ${errors.description ? "border-red-400 border-2" : "border-gray-200"}`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.description}</p>
                  )}
                </div>

                {/* Photos */}
                <div ref={photosRef} className={`p-5 ${errors.photos && photos.length === 0 ? "border-2 border-red-400 rounded-2xl" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold text-stone-700">Fotoğraflar *</label>
                    <span className="text-xs text-stone-400">{photos.length + uploadingCount}/3</span>
                  </div>
                  <p className="text-xs text-stone-400 mb-3">En az 1, en fazla 3 fotoğraf</p>

                  {/* Preview grid */}
                  {(photos.length > 0 || uploadingCount > 0) && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {photos.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            aria-label="Kaldır"
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

                  {/* Upload area — hidden when 3 slots filled */}
                  {photos.length + uploadingCount < 3 && (
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer active:bg-orange-100 transition-colors ${errors.photos && photos.length === 0 ? "border-red-400 bg-red-50" : "border-orange-300 bg-orange-50"}`}
                    >
                      <span className="text-3xl">📷</span>
                      <p className="text-sm font-medium text-orange-700">Fotoğraf Yükle</p>
                      <p className="text-xs text-gray-400">PNG, JPG • Maks. 3 fotoğraf</p>
                    </div>
                  )}

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {errors.photos && (
                    <p className="mt-3 text-xs text-rose-500">{errors.photos}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={goBack}
                  className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {submitting ? "Yayınlanıyor..." : "Yayınla"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo crop modal — identical to create-listing */}
      {showPhotoCropModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-100">
              <p className="text-stone-800 font-bold text-sm text-center">Fotoğraflar</p>
            </div>
            <div className="p-4 flex items-center justify-center bg-stone-50 overflow-auto max-h-[65vh]">
              {cropImgSrc && (
                <ReactCrop
                  crop={photoCrop}
                  onChange={(_, pct) => setPhotoCrop(pct)}
                  onComplete={(c) => setPhotoCompletedCrop(c)}
                  minWidth={30}
                  minHeight={30}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={cropImgRef}
                    src={cropImgSrc}
                    alt="Crop"
                    onLoad={onPhotoCropImageLoad}
                    style={{ maxHeight: "60vh", maxWidth: "100%", display: "block" }}
                  />
                </ReactCrop>
              )}
            </div>
            <div className="py-3 flex items-center justify-center gap-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleCropRotate(-90)}
                disabled={cropSaving}
                className="w-10 h-10 rounded-full bg-white border-2 border-orange-400 text-orange-500 text-lg flex items-center justify-center hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-60"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={() => handleCropRotate(90)}
                disabled={cropSaving}
                className="w-10 h-10 rounded-full bg-white border-2 border-orange-400 text-orange-500 text-lg flex items-center justify-center hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-60"
              >
                ↻
              </button>
            </div>
            <div className="p-4 flex gap-3">
              <button
                type="button"
                onClick={handlePhotoCropCancel}
                disabled={cropSaving}
                className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-60"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handlePhotoCropSave}
                disabled={cropSaving || !photoCompletedCrop}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
              >
                {cropSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  </span>
                ) : "Kırp ve Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NSFW / upload error toast — bottom, white card, red left border, warning icon */}
      <AnimatePresence>
        {photoError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-white border-l-4 border-red-500 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm"
          >
            <span className="text-xl shrink-0">⚠️</span>
            <p className="text-sm text-stone-700 font-medium">{photoError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success / error toast ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap ${toastError ? "bg-red-600" : "bg-stone-900"}`}
          >
            {toastError ? "⚠️" : "✅"} {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateCommercialListingPageRoot() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <CreateCommercialListingPage />
    </Suspense>
  );
}