// Shared commercial space-type + amenity labels. Slugs/labels are copied verbatim from
// app/commercial-type-select's `commercialTypeOptionsByLang` (the values `commercial_type`
// is actually written as by /create-commercial-listing) so every consumer stays in sync.

export type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

export interface CommercialType {
  slug: string;
  emoji: string;
  label: Record<Lang, string>;
}

export const COMMERCIAL_TYPES: CommercialType[] = [
  { slug: "ofis", emoji: "🏢", label: { tr: "Ofis", en: "Office", fa: "آفیس", ar: "مكتب", de: "Büro", ru: "Офис" } },
  { slug: "dukkan", emoji: "🏪", label: { tr: "Dükkan", en: "Shop", fa: "دکان", ar: "محل تجاري", de: "Laden", ru: "Магазин" } },
  { slug: "berber-koltugu", emoji: "💈", label: { tr: "Berber Koltuğu", en: "Barber Chair", fa: "صندلی آرایشگاه", ar: "كرسي حلاقة", de: "Friseurstuhl", ru: "Кресло парикмахера" } },
  { slug: "atolye", emoji: "🔧", label: { tr: "Atölye", en: "Workshop", fa: "کارگاه", ar: "ورشة", de: "Werkstatt", ru: "Мастерская" } },
  { slug: "depo", emoji: "📦", label: { tr: "Depo", en: "Warehouse", fa: "انبار", ar: "مستودع", de: "Lager", ru: "Склад" } },
  { slug: "mutfak", emoji: "🍳", label: { tr: "Mutfak", en: "Kitchen", fa: "آشپزخانه", ar: "مطبخ", de: "Küche", ru: "Кухня" } },
  { slug: "icerik-studyosu", emoji: "🎬", label: { tr: "İçerik Stüdyosu", en: "Content Studio", fa: "استودیو تولید محتوا", ar: "استوديو المحتوى", de: "Content-Studio", ru: "Студия контента" } },
  { slug: "egitim-sinifi", emoji: "📚", label: { tr: "Eğitim Sınıfı", en: "Training Room", fa: "کلاس آموزشی", ar: "قاعة تدريب", de: "Schulungsraum", ru: "Учебный класс" } },
  { slug: "otopark", emoji: "🚗", label: { tr: "Otopark", en: "Parking", fa: "پارکینگ", ar: "موقف سيارات", de: "Parkplatz", ru: "Парковка" } },
  { slug: "ticari-adres", emoji: "📮", label: { tr: "Ticari Adres", en: "Business Address", fa: "آدرس تجاری", ar: "عنوان تجاري", de: "Geschäftsadresse", ru: "Бизнес-адрес" } },
  { slug: "kuafor-guzellik-salonu", emoji: "💇", label: { tr: "Kuaför / Güzellik Salonu", en: "Hair / Beauty Salon", fa: "آرایشگاه / سالن زیبایی", ar: "صالون تجميل", de: "Friseursalon", ru: "Салон красоты" } },
  { slug: "muayenehane-klinik", emoji: "🏥", label: { tr: "Muayenehane / Klinik", en: "Clinic / Doctor's Office", fa: "مطب / کلینیک", ar: "عيادة / كلينيك", de: "Praxis / Klinik", ru: "Клиника / Кабинет врача" } },
  { slug: "spor-alani", emoji: "🏋️", label: { tr: "Spor Alanı", en: "Sports Facility", fa: "فضای ورزشی", ar: "مرفق رياضي", de: "Sportstätte", ru: "Спортивный объект" } },
  { slug: "etkinlik-salonu", emoji: "🎪", label: { tr: "Etkinlik Salonu", en: "Event Hall", fa: "سالن مراسمات", ar: "قاعة الفعاليات", de: "Veranstaltungssaal", ru: "Зал мероприятий" } },
];

export const COMMERCIAL_TYPE_BY_SLUG: Record<string, CommercialType> =
  Object.fromEntries(COMMERCIAL_TYPES.map((c) => [c.slug, c]));

// Amenity checkbox keys stored in listings.amenities (string[]) for commercial listings —
// labels copied verbatim from create-commercial-listing's `t.amenities`.
export const COMMERCIAL_AMENITY_LABELS: Record<string, Record<Lang, string>> = {
  wifi: { tr: "İnternet/WiFi", en: "Internet/WiFi", fa: "اینترنت/وای‌فای", ar: "إنترنت/واي فاي", de: "Internet/WLAN", ru: "Интернет/Wi-Fi" },
  ac: { tr: "Klima", en: "Air Conditioning", fa: "تهویه مطبوع", ar: "تكييف", de: "Klimaanlage", ru: "Кондиционер" },
  heating: { tr: "Isıtma", en: "Heating", fa: "سیستم گرمایشی", ar: "تدفئة", de: "Heizung", ru: "Отопление" },
  parking: { tr: "Otopark", en: "Parking", fa: "پارکینگ", ar: "موقف سيارات", de: "Parkplatz", ru: "Парковка" },
  security: { tr: "Güvenlik/Kamera", en: "Security/CCTV", fa: "امنیت/دوربین مداربسته", ar: "أمن/كاميرات مراقبة", de: "Sicherheit/Kamera", ru: "Охрана/Видеонаблюдение" },
  elevator: { tr: "Asansör", en: "Elevator", fa: "آسانسور", ar: "مصعد", de: "Aufzug", ru: "Лифт" },
  accessibility: { tr: "Engelli Erişimi", en: "Wheelchair Access", fa: "دسترسی معلولین", ar: "إمكانية الوصول لذوي الإعاقة", de: "Barrierefreier Zugang", ru: "Доступ для инвалидов" },
  wc: { tr: "WC/Tuvalet", en: "WC/Restroom", fa: "سرویس بهداشتی", ar: "دورة مياه", de: "WC/Toilette", ru: "Туалет" },
  kitchen: { tr: "Mutfak/Çay Ocağı", en: "Kitchen/Pantry", fa: "آشپزخانه/آبدارخانه", ar: "مطبخ/غرفة شاي", de: "Küche/Teeküche", ru: "Кухня/Чайная комната" },
  access247: { tr: "7/24 Erişim", en: "24/7 Access", fa: "دسترسی ۲۴/۷", ar: "وصول على مدار الساعة", de: "24/7 Zugang", ru: "Доступ 24/7" },
  printer: { tr: "Yazıcı/Fotokopi", en: "Printer/Copier", fa: "پرینتر/فتوکپی", ar: "طابعة/ناسخة", de: "Drucker/Kopierer", ru: "Принтер/Копир" },
  storage: { tr: "Depolama Alanı", en: "Storage Space", fa: "فضای انبار", ar: "مساحة تخزين", de: "Lagerfläche", ru: "Складское помещение" },
};

export const COMMERCIAL_AMENITY_ICONS: Record<string, string> = {
  wifi: "📶", ac: "❄️", heating: "🔥", parking: "🚗", security: "🎥", elevator: "🛗",
  accessibility: "♿", wc: "🚻", kitchen: "🍳", access247: "🕐", printer: "🖨️", storage: "📦",
};