"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CITIES = [
  {
    key: "istanbul",
    name: "Istanbul",
    nameTr: "İstanbul",
    nameFa: "استانبول",
    nameAr: "إسطنبول",
    country: "Turkey",
    countryTr: "Türkiye",
    countryFa: "ترکیه",
    countryAr: "تركيا",
    countryRu: "Турция",
    listings: "2,847",
    image: "/images/istnbul.jpg",
    accent: "from-orange-600 to-red-600",
  },
  {
    key: "washington-dc",
    name: "Washington DC",
    nameTr: "Washington DC",
    nameFa: "واشنگتن",
    nameAr: "واشنطن",
    country: "USA",
    countryTr: "ABD",
    countryFa: "آمریکا",
    countryAr: "الولايات المتحدة",
    countryRu: "США",
    listings: "1,456",
    image: "https://images.unsplash.com/photo-1501466044931-62695aada8e9?auto=format&fit=crop&w=800&q=80",
    accent: "from-blue-500 to-amber-600",
  },
  {
    key: "new-york",
    name: "New York",
    nameTr: "New York",
    nameFa: "نیویورک",
    nameAr: "نيويورك",
    country: "USA",
    countryTr: "ABD",
    countryFa: "آمریکا",
    countryAr: "الولايات المتحدة",
    countryRu: "США",
    listings: "3,241",
    image: "/images/newyourk.jpg",
    accent: "from-violet-500 to-indigo-600",
  },
  {
    key: "paris",
    name: "Paris",
    nameTr: "Paris",
    nameFa: "پاریس",
    nameAr: "باريس",
    country: "France",
    countryTr: "Fransa",
    countryFa: "فرانسه",
    countryAr: "فرنسا",
    countryRu: "Франция",
    listings: "2,103",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    accent: "from-rose-500 to-pink-600",
  },
  {
    key: "barcelona",
    name: "Barcelona",
    nameTr: "Barselona",
    nameFa: "بارسلون",
    nameAr: "برشلونة",
    country: "Spain",
    countryTr: "İspanya",
    countryFa: "اسپانیا",
    countryAr: "إسبانيا",
    countryRu: "Испания",
    listings: "1,541",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
    accent: "from-yellow-500 to-orange-700",
  },
  {
    key: "berlin",
    name: "Berlin",
    nameTr: "Berlin",
    nameFa: "برلین",
    nameAr: "برلين",
    country: "Germany",
    countryTr: "Almanya",
    countryFa: "آلمان",
    countryAr: "ألمانيا",
    countryRu: "Германия",
    listings: "2,190",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80",
    accent: "from-slate-500 to-zinc-600",
  },
  {
    key: "dubai",
    name: "Dubai",
    nameTr: "Dubai",
    nameFa: "دبی",
    nameAr: "دبي",
    country: "UAE",
    countryTr: "BAE",
    countryFa: "امارات",
    countryAr: "الإمارات",
    countryRu: "ОАЭ",
    listings: "3,012",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    accent: "from-amber-500 to-yellow-600",
  },
  {
    key: "moscow",
    name: "Moscow",
    nameTr: "Moskova",
    nameFa: "مسکو",
    nameAr: "موسكو",
    country: "Russia",
    countryTr: "Rusya",
    countryFa: "روسیه",
    countryAr: "روسيا",
    countryRu: "Россия",
    listings: "1,823",
    image: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&q=80",
    accent: "from-red-600 to-rose-700",
  },
  {
    key: "tehran",
    name: "Tehran",
    nameTr: "Tahran",
    nameFa: "تهران",
    nameAr: "طهران",
    country: "Iran",
    countryTr: "İran",
    countryFa: "ایران",
    countryAr: "إيران",
    countryRu: "Иран",
    listings: "987",
    image: "/images/tehran.jpg",
    accent: "from-orange-600 to-orange-700",
  },
  {
    key: "manchester",
    name: "Manchester",
    nameTr: "Manchester",
    nameFa: "منچستر",
    nameAr: "مانشستر",
    country: "UK",
    countryTr: "İngiltere",
    countryFa: "بریتانیا",
    countryAr: "المملكة المتحدة",
    countryRu: "Великобритания",
    listings: "1,234",
    image: "https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=400&q=80",
    accent: "from-sky-500 to-blue-600",
  },
  {
    key: "london",
    name: "London",
    nameTr: "Londra",
    nameFa: "لندن",
    nameAr: "لندن",
    country: "UK",
    countryTr: "İngiltere",
    countryFa: "بریتانیا",
    countryAr: "المملكة المتحدة",
    countryRu: "Великобритания",
    listings: "3,456",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80",
    accent: "from-indigo-500 to-blue-600",
  },
  {
    key: "frankfurt",
    name: "Frankfurt",
    nameTr: "Frankfurt",
    nameFa: "فرانکفورت",
    nameAr: "فرانكفورت",
    country: "Germany",
    countryTr: "Almanya",
    countryFa: "آلمان",
    countryAr: "ألمانيا",
    countryRu: "Германия",
    listings: "1,678",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
    accent: "from-zinc-500 to-gray-600",
  },
];

const copy = {
  tr: {
    badge: "Öne Çıkan Şehirler",
    h2: "Popüler Şehirler",
    sub: "Yerli ve yabancı ev arkadaşlarının en çok tercih ettiği şehirler",
    listings: "ilan",
    explore: "Keşfet →",
  },
  en: {
    badge: "Featured Destinations",
    h2: "Popular Cities",
    sub: "The most sought-after cities for locals and expats finding their perfect home",
    listings: "listings",
    explore: "Explore →",
  },
  fa: {
    badge: "مقاصد برتر",
    h2: "شهرهای محبوب",
    sub: "محبوب‌ترین شهرها برای ساکنان و مهاجران در جستجوی خانه ایده‌آل",
    listings: "آگهی",
    explore: "کشف کن ←",
  },
  de: {
    badge: "Beliebte Reiseziele",
    h2: "Beliebte Städte",
    sub: "Die begehrtesten Städte für Einheimische und Expats auf der Suche nach ihrem perfekten Zuhause",
    listings: "Inserate",
    explore: "Entdecken →",
  },
  // Always add "ar" key when adding new translations
  ar: {
    badge: "الوجهات المميزة",
    h2: "المدن الشهيرة",
    sub: "أكثر المدن طلباً لدى السكان والمغتربين الباحثين عن منزلهم المثالي",
    listings: "إعلان",
    explore: "استكشف ←",
  },
  ru: {
    badge: "Популярные направления",
    h2: "Популярные города",
    sub: "Самые востребованные города среди местных жителей и экспатов",
    listings: "объявлений",
    explore: "Смотреть →",
  },
};

interface CityCardProps {
  city: (typeof CITIES)[number];
  lang: "tr" | "en" | "fa" | "ar" | "de" | "ru";
  inView: boolean;
  delay: number;
  className?: string;
  imgSizes: string;
  t: { listings: string; explore: string };
  featured?: boolean;
  onCityClick?: (cityName: string) => void;
}

function CityCard({ city, lang, inView, delay, className = "", imgSizes, t, featured, onCityClick }: CityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onCityClick?.(city.name)}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-stone-900/25 transition-shadow duration-500 ${className}`}
    >
      {/* Image — zoom on hover */}
      <motion.div
        className="absolute inset-0"
        whileHover={{ scale: 1.07 }}
        transition={{ type: "spring", stiffness: 160, damping: 26 }}
      >
        <Image
          src={city.image}
          alt={`${city.name} cityscape`}
          fill
          sizes={imgSizes}
          className="object-cover"
          quality={85}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/88 via-stone-950/20 to-transparent" />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${city.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
      />

      {/* Country chip — top start */}
      <div className="absolute top-4 start-4">
        <span className="text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-full px-2 py-0.5">
          {lang === "tr" ? city.countryTr : lang === "fa" ? city.countryFa : lang === "ar" ? city.countryAr : lang === "ru" ? city.countryRu : city.country}
        </span>
      </div>

      {/* Explore pill — top end, reveals on hover */}
      <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.div
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-stone-900"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-base font-bold text-white tracking-tight drop-shadow-lg mb-0.5">
          {lang === "tr" ? city.nameTr : lang === "fa" ? city.nameFa : lang === "ar" ? city.nameAr : city.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-white drop-shadow">{city.listings}</span>
            <span className="text-xs text-white/60 font-medium">{t.listings}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.07, x: 2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="text-xs font-bold bg-white/90 backdrop-blur-sm text-stone-900 px-3.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg whitespace-nowrap"
          >
            {t.explore}
          </motion.button>
        </div>

        {/* Progress shimmer bar */}
        <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${city.accent} opacity-80 rounded-full`}
            initial={{ width: 0 }}
            animate={inView ? { width: "70%" } : { width: 0 }}
            transition={{ delay: delay + 0.35, duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface PopularCitiesProps {
  lang: "tr" | "en" | "fa" | "ar" | "de" | "ru";
  onCityClick?: (cityName: string) => void;
}

export default function PopularCities({ lang, onCityClick }: PopularCitiesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const t = copy[lang];

  const [istanbul, washingtonDc, newYork, paris, barcelona, berlin, dubai, moscow, tehran, manchester, london, frankfurt] = CITIES;

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-5 pt-10 pb-20">

      {/* Section header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-700 bg-orange-600/10 border border-orange-400/30 rounded-full px-4 py-2 mb-6 shadow-lg shadow-orange-600/10"
        >
          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse flex-shrink-0" />
          {t.badge}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight"
        >
          {t.h2}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-stone-500 max-w-xl mx-auto"
        >
          {t.sub}
        </motion.p>
      </div>

      {/* ── Bento grid ──────────────────────────────────────────────────────
          Mobile  : 1 column, all stacked
          SM      : 2-column 3-row grid
          LG      : Istanbul (tall left) | top 2 (Izmir, Ankara) | bottom 3 (Barcelona, Berlin, Dubai)
      ──────────────────────────────────────────────────────────────────── */}

      {/* Mobile / SM layout */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        <CityCard city={istanbul}     lang={lang} inView={inView} delay={0.06} className="h-40" imgSizes="50vw" t={t} featured onCityClick={onCityClick} />
        <CityCard city={washingtonDc} lang={lang} inView={inView} delay={0.12} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={newYork}      lang={lang} inView={inView} delay={0.18} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={paris}        lang={lang} inView={inView} delay={0.24} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={barcelona}    lang={lang} inView={inView} delay={0.30} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={berlin}       lang={lang} inView={inView} delay={0.36} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={dubai}        lang={lang} inView={inView} delay={0.42} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={moscow}       lang={lang} inView={inView} delay={0.48} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={tehran}       lang={lang} inView={inView} delay={0.54} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={manchester}   lang={lang} inView={inView} delay={0.60} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={london}       lang={lang} inView={inView} delay={0.66} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
        <CityCard city={frankfurt}    lang={lang} inView={inView} delay={0.72} className="h-40" imgSizes="50vw" t={t} onCityClick={onCityClick} />
      </div>

      {/* LG+ bento layout */}
      <div className="hidden lg:flex gap-4 h-[580px]">
        {/* Istanbul — featured tall left */}
        <div className="flex-[2] min-w-0">
          <CityCard city={istanbul} lang={lang} inView={inView} delay={0.06} className="h-full" imgSizes="38vw" t={t} featured onCityClick={onCityClick} />
        </div>

        {/* Right column — top 3 + bottom 3 */}
        <div className="flex-[3] min-w-0 flex flex-col gap-4">
          {/* Top row: Washington DC + New York + Paris */}
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <CityCard city={washingtonDc} lang={lang} inView={inView} delay={0.14} className="h-full" imgSizes="14vw" t={t} onCityClick={onCityClick} />
            </div>
            <div className="flex-1">
              <CityCard city={newYork}      lang={lang} inView={inView} delay={0.20} className="h-full" imgSizes="14vw" t={t} onCityClick={onCityClick} />
            </div>
            <div className="flex-1">
              <CityCard city={paris}        lang={lang} inView={inView} delay={0.26} className="h-full" imgSizes="14vw" t={t} onCityClick={onCityClick} />
            </div>
          </div>
          {/* Bottom row: Barcelona + Berlin + Dubai */}
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <CityCard city={barcelona} lang={lang} inView={inView} delay={0.32} className="h-full" imgSizes="14vw" t={t} onCityClick={onCityClick} />
            </div>
            <div className="flex-1">
              <CityCard city={berlin}    lang={lang} inView={inView} delay={0.38} className="h-full" imgSizes="14vw" t={t} onCityClick={onCityClick} />
            </div>
            <div className="flex-1">
              <CityCard city={dubai}     lang={lang} inView={inView} delay={0.44} className="h-full" imgSizes="14vw" t={t} onCityClick={onCityClick} />
            </div>
          </div>
        </div>
      </div>

      {/* LG+ additional row for new cities */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 mt-4 h-44">
        <CityCard city={moscow}     lang={lang} inView={inView} delay={0.50} className="h-full" imgSizes="18vw" t={t} onCityClick={onCityClick} />
        <CityCard city={tehran}     lang={lang} inView={inView} delay={0.56} className="h-full" imgSizes="18vw" t={t} onCityClick={onCityClick} />
        <CityCard city={manchester} lang={lang} inView={inView} delay={0.62} className="h-full" imgSizes="18vw" t={t} onCityClick={onCityClick} />
        <CityCard city={london}     lang={lang} inView={inView} delay={0.68} className="h-full" imgSizes="18vw" t={t} onCityClick={onCityClick} />
        <CityCard city={frankfurt}  lang={lang} inView={inView} delay={0.74} className="h-full" imgSizes="18vw" t={t} onCityClick={onCityClick} />
      </div>
    </section>
  );
}
