'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { useLang } from '@/app/lib/LangContext'

const texts = {
  tr: {
    titlePart1: 'Tekrar',
    titlePart2: 'Hoş Geldin!',
    subtitleLine1: 'Seni tekrar aramızda görmek çok güzel.',
    subtitleLine2: 'Hayalindeki ev arkadaşı seni bekliyor.',
    close: 'Kapat',
  },
  en: {
    titlePart1: 'Welcome',
    titlePart2: 'Back!',
    subtitleLine1: "It's great to have you here again.",
    subtitleLine2: 'Your perfect roommate is waiting.',
    close: 'Close',
  },
  fa: {
    titlePart1: 'بازگشت',
    titlePart2: 'شما!',
    subtitleLine1: 'خیلی خوشحالیم که دوباره اینجایی.',
    subtitleLine2: 'هم‌خونه ایده‌آلت منتظرته.',
    close: 'بستن',
  },
  ar: {
    titlePart1: 'مرحباً',
    titlePart2: 'بعودتك!',
    subtitleLine1: 'يسعدنا أن نراك معنا مجدداً.',
    subtitleLine2: 'شريك سكنك المثالي بانتظارك.',
    close: 'إغلاق',
  },
  de: {
    titlePart1: 'Willkommen',
    titlePart2: 'zurück!',
    subtitleLine1: 'Schön, dich wieder hier zu haben.',
    subtitleLine2: 'Dein perfekter Mitbewohner wartet auf dich.',
    close: 'Schließen',
  },
  ru: {
    titlePart1: 'С возвращением,',
    titlePart2: 'друг!',
    subtitleLine1: 'Мы рады снова видеть тебя здесь.',
    subtitleLine2: 'Идеальный сосед уже ждёт тебя.',
    close: 'Закрыть',
  },
} as const

export default function WelcomePopup({ lang: langProp = 'tr' }: { lang?: string }) {
  const [show, setShow] = useState(false)
  const { lang: contextLang } = useLang()

  const currentLang = (contextLang || langProp) as keyof typeof texts
  const t = texts[currentLang] || texts.tr

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('sefira_just_logged_in')
    if (justLoggedIn) sessionStorage.removeItem('sefira_just_logged_in')

    if (sessionStorage.getItem('welcome_popup_shown')) return

    const reveal = () => {
      setShow(true)
      sessionStorage.setItem('welcome_popup_shown', 'true')
    }

    let timer: ReturnType<typeof setTimeout> | undefined

    if (justLoggedIn) {
      timer = setTimeout(reveal, 1500)
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) timer = setTimeout(reveal, 5000)
      })
    }

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handler = () => setShow(false)
    window.addEventListener('langSelectorOpened', handler)
    return () => window.removeEventListener('langSelectorOpened', handler)
  }, [])

  const handleClose = () => setShow(false)

  const isRTL = currentLang === 'fa' || currentLang === 'ar'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          onClick={handleClose}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="relative w-full max-w-md aspect-[1346/1168] rounded-3xl overflow-hidden shadow-2xl border border-white/60"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Image
              src="/welcome-popup-bg.webp"
              alt=""
              fill
              priority
              className="object-cover"
            />

            <button
              onClick={handleClose}
              aria-label={t.close}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md active:scale-95 transition"
            >
              <X className="h-4 w-4 text-slate-700" />
            </button>

            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white via-white/85 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 px-6 pb-6 text-center">
              <h2 className="text-3xl font-extrabold leading-tight">
                <span style={{ color: '#1e293b' }}>{t.titlePart1}</span>{' '}
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {t.titlePart2}
                </span>
              </h2>

              <div className="flex items-center justify-center gap-2 my-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-orange-400" />
                <span className="text-pink-500 text-sm">♥</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-purple-500" />
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                {t.subtitleLine1}
                <br />
                {t.subtitleLine2}
              </p>

              <button
                onClick={handleClose}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-8 py-3 font-bold text-white shadow-lg shadow-orange-500/30 active:scale-95 transition"
              >
                {isRTL ? (
                  <>
                    <span>{t.close}</span>
                    <X className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span>{t.close}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}