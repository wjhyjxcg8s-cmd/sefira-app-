"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CITIES = [
  {
    key: "istanbul",
    name: "Istanbul",
    nameTr: "İstanbul",
    country: "Turkey",
    countryTr: "Türkiye",
    listings: "2,847",
    // Unsplash: Istanbul skyline with Bosphorus
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
    accent: "from-orange-500 to-red-600",
  },
  {
    key: "izmir",
    name: "Izmir",
    nameTr: "İzmir",
    country: "Turkey",
    countryTr: "Türkiye",
    listings: "1,123",
    // Unsplash: Izmir bay promenade
    image:
      "https://images.unsplash.com/photo-1604928141012-56f00b78dc5b?auto=format&fit=crop&w=700&q=80",
    accent: "from-blue-500 to-cyan-600",
  },
  {
    key: "ankara",
    name: "Ankara",
    nameTr: "Ankara",
    country: "Turkey",
    countryTr: "Türkiye",
    listings: "976",
    // Unsplash: Turkish city architecture
    image:
      "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=700&q=80",
    accent: "from-violet-500 to-indigo-600",
  },
  {
    key: "antalya",
    name: "Antalya",
    nameTr: "Antalya",
    country: "Turkey",
    countryTr: "Türkiye",
    listings: "654",
    // Unsplash: Antalya old harbour / Mediterranean
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80",
    accent: "from-emerald-500 to-teal-600",
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
};

interface CityCardProps {
  city: (typeof CITIES)[number];
  lang: "tr" | "en";
  inView: boolean;
  delay: number;
  className?: string;
  imgSizes: string;
  t: { listings: string; explore: string };
  featured?: boolean;
}

function CityCard({ city, lang, inView, delay, className = "", imgSizes, t, featured }: CityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-3xl cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-stone-900/25 transition-shadow duration-500 ${className}`}
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
        <span className="text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-full px-3 py-1.5">
          {lang === "tr" ? city.countryTr : city.country}
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
        <h3
          className={`font-black text-white tracking-tight drop-shadow-lg mb-0.5 ${
            featured ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {lang === "tr" ? city.nameTr : city.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white drop-shadow">{city.listings}</span>
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

export default function PopularCities({ lang }: { lang: "tr" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const t = copy[lang];

  const [istanbul, izmir, ankara, antalya] = CITIES;

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-5 py-20">

      {/* Section header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-500/10 border border-orange-400/30 rounded-full px-4 py-2 mb-6 shadow-lg shadow-orange-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
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
          SM      : 2-column 2-row square grid
          LG      : Istanbul (tall, 2/5 width) | 3 right cards (3/5)
      ──────────────────────────────────────────────────────────────────── */}

      {/* Mobile / SM layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        <CityCard city={istanbul} lang={lang} inView={inView} delay={0.08} className="h-72 sm:h-80" imgSizes="(max-width: 640px) 100vw, 50vw" t={t} featured />
        <CityCard city={izmir}    lang={lang} inView={inView} delay={0.16} className="h-64 sm:h-80" imgSizes="(max-width: 640px) 100vw, 50vw" t={t} />
        <CityCard city={ankara}   lang={lang} inView={inView} delay={0.24} className="h-64 sm:h-72" imgSizes="(max-width: 640px) 100vw, 50vw" t={t} />
        <CityCard city={antalya}  lang={lang} inView={inView} delay={0.32} className="h-64 sm:h-72" imgSizes="(max-width: 640px) 100vw, 50vw" t={t} />
      </div>

      {/* LG+ bento layout */}
      <div className="hidden lg:flex gap-4 h-[560px]">
        {/* Istanbul — featured left column */}
        <div className="flex-[2] min-w-0">
          <CityCard
            city={istanbul}
            lang={lang}
            inView={inView}
            delay={0.08}
            className="h-full"
            imgSizes="40vw"
            t={t}
            featured
          />
        </div>

        {/* Right column — 3 stacked cards */}
        <div className="flex-[3] min-w-0 flex flex-col gap-4">
          {/* Top: Izmir + Ankara side by side */}
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <CityCard
                city={izmir}
                lang={lang}
                inView={inView}
                delay={0.16}
                className="h-full"
                imgSizes="30vw"
                t={t}
              />
            </div>
            <div className="flex-1">
              <CityCard
                city={ankara}
                lang={lang}
                inView={inView}
                delay={0.24}
                className="h-full"
                imgSizes="30vw"
                t={t}
              />
            </div>
          </div>

          {/* Bottom: Antalya full width */}
          <div className="flex-1">
            <CityCard
              city={antalya}
              lang={lang}
              inView={inView}
              delay={0.32}
              className="h-full"
              imgSizes="60vw"
              t={t}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
