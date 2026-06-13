"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/sefira.app";

const copy = {
  tr: {
    badge: "Instagram Topluluğu",
    heading: "Sefira Topluluğuna Katıl",
    subtext:
      "Özel ev arkadaşı ipuçları, gerçek eşleşme hikayeleri ve 52 şehirden yaşam rehberleri için bizi takip edin.",
    cta: "Takip Et",
    ctaDone: "Takip Edildi ✓",
    followerCount: "12.4K",
    followerLabel: "takipçi",
    handle: "@sefira.app",
  },
  en: {
    badge: "Instagram Community",
    heading: "Join the Sefira Community",
    subtext:
      "Follow us for exclusive roommate tips, real match stories, and city guides from 52 cities worldwide.",
    cta: "Follow Us",
    ctaDone: "Following ✓",
    followerCount: "12.4K",
    followerLabel: "followers",
    handle: "@sefira.app",
  },
  fa: {
    badge: "جامعه اینستاگرام",
    heading: "به جامعه سفیرا بپیوندید",
    subtext:
      "ما را دنبال کنید برای نکات اختصاصی هم‌خانه‌یابی، داستان‌های واقعی تطابق و راهنمای شهری از ۵۲ شهر جهان.",
    cta: "دنبال کنید",
    ctaDone: "دنبال می‌کنید ✓",
    followerCount: "12.4K",
    followerLabel: "دنبال‌کننده",
    handle: "@sefira.app",
  },
  de: {
    badge: "Instagram-Community",
    heading: "Werde Teil der Sefira-Community",
    subtext:
      "Folge uns für exklusive Mitbewohner-Tipps, echte Match-Geschichten und Stadtführer aus 52 Städten weltweit.",
    cta: "Folgen",
    ctaDone: "Gefolgt ✓",
    followerCount: "12.4K",
    followerLabel: "Follower",
    handle: "@sefira.app",
  },
  // Always add "ar" key when adding new translations
  ar: {
    badge: "مجتمع إنستغرام",
    heading: "انضم إلى مجتمع سفيرا",
    subtext:
      "تابعنا للحصول على نصائح حصرية حول إيجاد شريك السكن، وقصص مطابقة حقيقية، وأدلة المدن من ٥٢ مدينة حول العالم.",
    cta: "تابعنا",
    ctaDone: "تمت المتابعة ✓",
    followerCount: "12.4K",
    followerLabel: "متابع",
    handle: "@sefira.app",
  },
  ru: {
    badge: "Instagram-сообщество",
    heading: "Присоединяйтесь к сообществу Sefira",
    subtext:
      "Подписывайтесь на нас для получения советов по поиску соседей, реальных историй совпадений и гидов по городам.",
    cta: "Подписаться",
    ctaDone: "Подписаны ✓",
    followerCount: "12.4K",
    followerLabel: "подписчиков",
    handle: "@sefira.app",
  },
};

const postGradients = [
  "from-violet-600 via-purple-700 to-indigo-800",
  "from-rose-500 via-pink-600 to-fuchsia-700",
  "from-amber-500 via-teal-700 to-rose-700",
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function InstagramCTA({ lang }: { lang: "tr" | "en" | "fa" | "ar" | "de" | "ru" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [followed, setFollowed] = useState(false);
  const t = copy[lang];

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #db2777 45%, #0F766E 100%)",
          padding: "1px",
        }}
      >
        {/* Inner card */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(76,29,149,0.97) 0%, rgba(131,24,67,0.94) 50%, rgba(124,45,18,0.92) 100%)",
          }}
        >
          {/* Ambient blobs */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-teal-600/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-10">

            {/* ── Left: Text content ─────────────────────────────────── */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 300, damping: 22 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-white/90 mb-5 backdrop-blur-sm"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                {t.badge}
              </motion.div>

              {/* Heading */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight leading-tight"
              >
                {t.heading}
              </motion.h3>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm sm:text-base text-white/65 max-w-md mb-7 leading-relaxed"
              >
                {t.subtext}
              </motion.p>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center lg:items-center gap-4"
              >
                <motion.a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setFollowed(true)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`inline-flex items-center gap-2.5 font-bold px-7 py-3 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-black/20 ${
                    followed
                      ? "bg-white/15 text-white border border-white/25 backdrop-blur-sm"
                      : "bg-white text-pink-700 hover:shadow-2xl hover:shadow-white/10"
                  }`}
                >
                  <InstagramIcon className="w-4 h-4" />
                  {followed ? t.ctaDone : t.cta}
                </motion.a>

                <div className="flex items-center gap-2 text-white/55 text-sm">
                  <span className="font-bold text-white text-base">{t.followerCount}</span>
                  <span>{t.followerLabel}</span>
                  <span className="text-white/25 mx-0.5">·</span>
                  <span className="font-medium text-white/70">{t.handle}</span>
                </div>
              </motion.div>
            </div>

            {/* ── Right: Mini post thumbnails ────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3 flex-shrink-0"
            >
              {postGradients.map((gradient, i) => (
                <motion.a
                  key={i}
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.45 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.06, rotate: i === 1 ? 0 : i === 0 ? -2 : 2, y: -4, transition: { type: "spring", stiffness: 350, damping: 22 } }}
                  whileTap={{ scale: 0.96, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                  className={`relative w-20 h-24 sm:w-24 sm:h-[116px] rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden cursor-pointer shadow-xl shadow-black/30 flex flex-col justify-end p-2.5`}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/15" />

                  {/* Fake content lines */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-white/80 flex-shrink-0" />
                      <div className="h-1.5 w-8 bg-white/55 rounded-full" />
                    </div>
                    <div className="h-1.5 w-11 bg-white/35 rounded-full" />
                  </div>

                  {/* Heart */}
                  <div className="absolute top-2.5 right-2.5">
                    <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5 opacity-75">
                      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
                    </svg>
                  </div>

                  {/* Instagram logo watermark */}
                  <div className="absolute top-2.5 left-2.5">
                    <InstagramIcon className="w-3 h-3 text-white/60" />
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
