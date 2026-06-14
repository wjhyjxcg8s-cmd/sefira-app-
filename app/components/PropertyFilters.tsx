"use client";

import { useState } from "react";
import { type Currency, CURRENCY_SYMBOLS } from "@/app/lib/currency";

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

interface FilterState {
  priceMin: string;
  priceMax: string;
  depositMax: string;
  billsIncluded: null | boolean;
  sizeMin: string;
  sizeMax: string;
  rooms: null | number;
  housemates: null | number;
  bathrooms: null | number;
  floorMin: string;
  floorMax: string;
  elevator: null | boolean;
  balcony: null | boolean;
  furnished: "any" | "furnished" | "unfurnished";
  internet: null | boolean;
  parking: null | boolean;
  pets: null | boolean;
  smoking: null | boolean;
  student: null | boolean;
  remote: null | boolean;
}

const INITIAL: FilterState = {
  priceMin: "", priceMax: "", depositMax: "", billsIncluded: null,
  sizeMin: "", sizeMax: "", rooms: null, housemates: null, bathrooms: null,
  floorMin: "", floorMax: "",
  elevator: null, balcony: null, furnished: "any", internet: null, parking: null,
  pets: null, smoking: null, student: null, remote: null,
};

const LABELS = {
  tr: {
    btn: "Filtreler", clear: "Temizle", apply: "Filtrele", title: "Gelişmiş Filtreler",
    sec1: "Finansal", sec2: "Alan & Düzen", sec3: "Olanaklar", sec4: "Ev Kuralları",
    price: "Kira (€/$)", deposit: "Maks. Depozito", bills: "Faturalar Dahil?",
    size: "Metrekare (m²)", rooms: "Oda Sayısı", housemates: "Ev Arkadaşı",
    bathrooms: "Banyo Sayısı", floor: "Kat Aralığı",
    elevator: "Asansör", balcony: "Balkon", furnished: "Eşyalı",
    unfurnished: "Eşyasız", internet: "Wi-Fi", parking: "Otopark",
    pets: "Evcil Hayvan", smoking: "Sigara İzni", student: "Öğrenci Dostu",
    remote: "Uzaktan Çalışma",
    any: "Farketmez", yes: "Evet", no: "Hayır", min: "Min", max: "Maks",
    activeFilters: (n: number) => `${n} filtre`,
  },
  en: {
    btn: "Filters", clear: "Clear all", apply: "Apply", title: "Advanced Filters",
    sec1: "Financials", sec2: "Space & Layout", sec3: "Amenities", sec4: "House Rules",
    price: "Price (€/$)", deposit: "Max Deposit", bills: "Bills Included?",
    size: "Size (m²)", rooms: "Rooms", housemates: "Housemates",
    bathrooms: "Bathrooms", floor: "Floor Range",
    elevator: "Elevator", balcony: "Balcony", furnished: "Furnished",
    unfurnished: "Unfurnished", internet: "Wi-Fi", parking: "Parking",
    pets: "Pets Allowed", smoking: "Smoking OK", student: "Student Friendly",
    remote: "Remote Friendly",
    any: "Any", yes: "Yes", no: "No", min: "Min", max: "Max",
    activeFilters: (n: number) => `${n} active`,
  },
  fa: {
    btn: "فیلترها", clear: "پاک کردن", apply: "اعمال", title: "فیلترهای پیشرفته",
    sec1: "مالی", sec2: "فضا و چیدمان", sec3: "امکانات", sec4: "قوانین خانه",
    price: "قیمت (€/$)", deposit: "حداکثر ودیعه", bills: "قبوض شامل؟",
    size: "متراژ (m²)", rooms: "تعداد اتاق", housemates: "هم‌خانه",
    bathrooms: "تعداد حمام", floor: "بازه طبقه",
    elevator: "آسانسور", balcony: "بالکن", furnished: "مبله",
    unfurnished: "بدون مبل", internet: "Wi-Fi", parking: "پارکینگ",
    pets: "حیوانات خانگی مجاز", smoking: "سیگار مجاز", student: "مناسب دانشجو",
    remote: "مناسب دورکاری",
    any: "فرقی نمی‌کند", yes: "بله", no: "خیر", min: "حداقل", max: "حداکثر",
    activeFilters: (n: number) => `${n} فیلتر`,
  },
  de: {
    btn: "Filter", clear: "Alle löschen", apply: "Anwenden", title: "Erweiterte Filter",
    sec1: "Finanzen", sec2: "Fläche & Aufteilung", sec3: "Ausstattung", sec4: "Hausregeln",
    price: "Preis (€/$)", deposit: "Max. Kaution", bills: "Nebenkosten inklusive?",
    size: "Größe (m²)", rooms: "Zimmeranzahl", housemates: "Mitbewohner",
    bathrooms: "Badezimmer", floor: "Etagenbereich",
    elevator: "Aufzug", balcony: "Balkon", furnished: "Möbliert",
    unfurnished: "Unmöbliert", internet: "Wi-Fi", parking: "Parkplatz",
    pets: "Haustiere erlaubt", smoking: "Rauchen erlaubt", student: "Studentenfreundlich",
    remote: "Remote-freundlich",
    any: "Egal", yes: "Ja", no: "Nein", min: "Min", max: "Max",
    activeFilters: (n: number) => `${n} aktiv`,
  },
  // Always add "ar" key when adding new translations
  ar: {
    btn: "الفلاتر", clear: "مسح الكل", apply: "تطبيق", title: "فلاتر متقدمة",
    sec1: "المالية", sec2: "المساحة والتخطيط", sec3: "المرافق", sec4: "قواعد المنزل",
    price: "السعر (€/$)", deposit: "أقصى وديعة", bills: "الفواتير مشمولة؟",
    size: "المساحة (m²)", rooms: "عدد الغرف", housemates: "شركاء السكن",
    bathrooms: "عدد الحمامات", floor: "نطاق الطابق",
    elevator: "مصعد", balcony: "شرفة", furnished: "مفروش",
    unfurnished: "غير مفروش", internet: "Wi-Fi", parking: "موقف سيارات",
    pets: "الحيوانات الأليفة مسموحة", smoking: "التدخين مسموح", student: "مناسب للطلاب",
    remote: "مناسب للعمل عن بُعد",
    any: "أي خيار", yes: "نعم", no: "لا", min: "الحد الأدنى", max: "الحد الأقصى",
    activeFilters: (n: number) => `${n} فلتر`,
  },
  ru: {
    btn: "Фильтры", clear: "Сбросить", apply: "Применить", title: "Расширенные фильтры",
    sec1: "Финансы", sec2: "Площадь и планировка", sec3: "Удобства", sec4: "Правила дома",
    price: "Цена (€/$)", deposit: "Макс. залог", bills: "Счета включены?",
    size: "Площадь (м²)", rooms: "Комнаты", housemates: "Соседи",
    bathrooms: "Ванные комнаты", floor: "Диапазон этажей",
    elevator: "Лифт", balcony: "Балкон", furnished: "С мебелью",
    unfurnished: "Без мебели", internet: "Wi-Fi", parking: "Парковка",
    pets: "Животные разрешены", smoking: "Курение разрешено", student: "Для студентов",
    remote: "Для удалённой работы",
    any: "Не важно", yes: "Да", no: "Нет", min: "Мин", max: "Макс",
    activeFilters: (n: number) => `${n} фильтр`,
  },
} as const;

/* ── Reusable micro-components ─────────────────────────────────────────────── */

function SectionHeader({ gradient, emoji, title }: { gradient: string; emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-xs shadow-md flex-shrink-0`}>
        {emoji}
      </div>
      <h3 className="text-xs font-black text-stone-600 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-stone-500 font-medium mb-1.5 block">{children}</label>;
}

function RangeInput({
  label, minVal, maxVal, onMin, onMax, prefix,
}: {
  label: string; minVal: string; maxVal: string;
  onMin: (v: string) => void; onMax: (v: string) => void;
  prefix?: string;
}) {
  const inputCls = `w-full border border-stone-200 rounded-xl py-2 text-xs text-stone-800 bg-stone-50 outline-none focus:border-orange-400 focus:bg-white transition-all duration-200 placeholder:text-stone-300 ${prefix ? "pl-5 pr-2" : "px-3"}`;
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-1.5 items-center">
        <div className="relative flex-1">
          {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none">{prefix}</span>}
          <input type="number" min={0} placeholder="Min" value={minVal} onChange={(e) => onMin(e.target.value)} className={inputCls} />
        </div>
        <span className="text-stone-300 text-xs font-bold flex-shrink-0">—</span>
        <div className="relative flex-1">
          {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none">{prefix}</span>}
          <input type="number" min={0} placeholder="Max" value={maxVal} onChange={(e) => onMax(e.target.value)} className={inputCls} />
        </div>
      </div>
    </div>
  );
}

function SingleMaxInput({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none">{prefix}</span>}
        <input
          type="number" min={0} placeholder="Max" value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-stone-200 rounded-xl py-2 text-xs text-stone-800 bg-stone-50 outline-none focus:border-orange-400 focus:bg-white transition-all duration-200 placeholder:text-stone-300 ${prefix ? "pl-6 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function TriToggle({ label, value, t, onChange }: {
  label: string; value: null | boolean;
  t: { any: string; yes: string; no: string };
  onChange: (v: null | boolean) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex bg-stone-100 rounded-xl p-0.5 gap-0.5">
        {([null, true, false] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              value === v
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {v === null ? t.any : v ? t.yes : t.no}
          </button>
        ))}
      </div>
    </div>
  );
}

function CountPicker({ label, value, onChange, max = 5 }: {
  label: string; value: null | number;
  onChange: (v: null | number) => void; max?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => onChange(null)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
            value === null
              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
              : "bg-stone-50 text-stone-500 border-stone-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
          }`}
        >
          —
        </button>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`min-w-[2rem] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${
              value === n
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                : "bg-stone-50 text-stone-500 border-stone-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
            }`}
          >
            {n === max ? `${n}+` : n}
          </button>
        ))}
      </div>
    </div>
  );
}

function AmenityBadge({ icon, label, active, onToggle }: {
  icon: string; label: string; active: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 select-none ${
        active
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/25"
          : "bg-stone-50 text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
      }`}
    >
      <span className="text-sm leading-none">{icon}</span>
      {label}
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function PropertyFilters({
  lang,
  currency = "USD",
  currencySymbol,
}: {
  lang: Lang;
  currency?: Currency;
  currencySymbol?: string;
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<FilterState>(INITIAL);
  const t = LABELS[lang];
  const priceSym = currencySymbol ?? CURRENCY_SYMBOLS[currency];

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  const activeCount = [
    f.priceMin || f.priceMax,
    f.depositMax,
    f.billsIncluded !== null,
    f.sizeMin || f.sizeMax,
    f.rooms !== null,
    f.housemates !== null,
    f.bathrooms !== null,
    f.floorMin || f.floorMax,
    f.elevator !== null,
    f.balcony !== null,
    f.furnished !== "any",
    f.internet !== null,
    f.parking !== null,
    f.pets !== null,
    f.smoking !== null,
    f.student !== null,
    f.remote !== null,
  ].filter(Boolean).length;

  const clearAll = () => setF(INITIAL);

  return (
    <div className="w-full">

      {/* ── Trigger row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 ${
            open
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/30"
              : activeCount > 0
              ? "bg-orange-50 text-orange-700 border-orange-300 shadow-orange-500/10"
              : "bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
          }`}
        >
          {/* Filter funnel icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {t.btn}
          {activeCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-black leading-none flex-shrink-0 ${
              open ? "bg-white/25 text-white" : "bg-orange-500 text-white shadow-sm"
            }`}>
              {activeCount}
            </span>
          )}
          {/* Chevron */}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`flex-shrink-0 transition-transform duration-300 ease-out ${open ? "rotate-180" : "rotate-0"}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Active filter chips summary + clear */}
        {activeCount > 0 && !open && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-stone-400 truncate hidden sm:block">
              {t.activeFilters(activeCount)}
            </span>
            <button
              onClick={clearAll}
              className="flex-shrink-0 text-xs text-stone-400 hover:text-rose-500 transition-colors duration-200 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 active:scale-95"
            >
              {t.clear} ×
            </button>
          </div>
        )}
      </div>

      {/* ── Expandable panel ────────────────────────────────────────────────── */}
      {/* Outer wrapper drives the open/close animation */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-[2400px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {/* Inner: allows vertical scroll on very small screens */}
        <div className="max-h-[78vh] overflow-y-auto sm:max-h-none sm:overflow-visible overscroll-contain rounded-2xl"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="bg-white/98 backdrop-blur-2xl border border-stone-200 rounded-2xl shadow-2xl shadow-stone-900/8 overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-orange-50/80 to-amber-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-sm font-black text-stone-800 tracking-tight">{t.title}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all duration-200 active:scale-90"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6">

              {/* ── Row 1: Financials + Space & Layout ───────────────────── */}
              <div className="grid sm:grid-cols-2 gap-6">

                {/* Financials */}
                <div className="space-y-4">
                  <SectionHeader gradient="from-orange-500 to-orange-600" emoji="💰" title={t.sec1} />
                  <RangeInput
                    label={t.price}
                    minVal={f.priceMin} maxVal={f.priceMax}
                    onMin={(v) => set("priceMin", v)} onMax={(v) => set("priceMax", v)}
                    prefix={priceSym}
                  />
                  <SingleMaxInput label={t.deposit} value={f.depositMax} onChange={(v) => set("depositMax", v)} prefix={priceSym} />
                  <TriToggle label={t.bills} value={f.billsIncluded} t={t} onChange={(v) => set("billsIncluded", v)} />
                </div>

                {/* Space & Layout */}
                <div className="space-y-4">
                  <SectionHeader gradient="from-blue-500 to-indigo-600" emoji="📐" title={t.sec2} />
                  <RangeInput
                    label={t.size}
                    minVal={f.sizeMin} maxVal={f.sizeMax}
                    onMin={(v) => set("sizeMin", v)} onMax={(v) => set("sizeMax", v)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CountPicker label={t.rooms}      value={f.rooms}      onChange={(v) => set("rooms", v)}      max={5} />
                    <CountPicker label={t.housemates} value={f.housemates} onChange={(v) => set("housemates", v)} max={5} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CountPicker label={t.bathrooms}  value={f.bathrooms}  onChange={(v) => set("bathrooms", v)}  max={3} />
                    <RangeInput
                      label={t.floor}
                      minVal={f.floorMin} maxVal={f.floorMax}
                      onMin={(v) => set("floorMin", v)} onMax={(v) => set("floorMax", v)}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-stone-200/80 to-transparent" />

              {/* ── Amenities ────────────────────────────────────────────── */}
              <div>
                <SectionHeader gradient="from-violet-500 to-purple-600" emoji="✨" title={t.sec3} />
                <div className="flex flex-wrap gap-2">
                  <AmenityBadge icon="🛗" label={t.elevator}
                    active={f.elevator === true}
                    onToggle={() => set("elevator", f.elevator === true ? null : true)} />
                  <AmenityBadge icon="🌿" label={t.balcony}
                    active={f.balcony === true}
                    onToggle={() => set("balcony", f.balcony === true ? null : true)} />
                  <AmenityBadge icon="🛋️" label={t.furnished}
                    active={f.furnished === "furnished"}
                    onToggle={() => set("furnished", f.furnished === "furnished" ? "any" : "furnished")} />
                  <AmenityBadge icon="🪑" label={t.unfurnished}
                    active={f.furnished === "unfurnished"}
                    onToggle={() => set("furnished", f.furnished === "unfurnished" ? "any" : "unfurnished")} />
                  <AmenityBadge icon="📶" label={t.internet}
                    active={f.internet === true}
                    onToggle={() => set("internet", f.internet === true ? null : true)} />
                  <AmenityBadge icon="🚗" label={t.parking}
                    active={f.parking === true}
                    onToggle={() => set("parking", f.parking === true ? null : true)} />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-stone-200/80 to-transparent" />

              {/* ── House Rules ───────────────────────────────────────────── */}
              <div>
                <SectionHeader gradient="from-rose-500 to-pink-600" emoji="📋" title={t.sec4} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <TriToggle label={`🐾 ${t.pets}`}    value={f.pets}    t={t} onChange={(v) => set("pets",    v)} />
                  <TriToggle label={`🚬 ${t.smoking}`} value={f.smoking} t={t} onChange={(v) => set("smoking", v)} />
                  <TriToggle label={`🎓 ${t.student}`} value={f.student} t={t} onChange={(v) => set("student", v)} />
                  <TriToggle label={`💻 ${t.remote}`}  value={f.remote}  t={t} onChange={(v) => set("remote",  v)} />
                </div>
              </div>

            </div>

            {/* Panel footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-100 bg-stone-50/80">
              <button
                onClick={clearAll}
                className="text-sm text-stone-400 hover:text-rose-500 transition-colors duration-200 font-medium hover:underline underline-offset-2"
              >
                {t.clear}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-95 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-xl active:scale-95"
              >
                {t.apply}
                {activeCount > 0 && (
                  <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-xs font-black leading-none">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
