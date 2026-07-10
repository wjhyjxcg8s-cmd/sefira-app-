'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { useLang } from '@/app/lib/LangContext'

const texts = {
  tr: {
    titleDark: 'Hoş',
    titleGradient: 'Geldiniz!',
    subtitleLine1: 'Burada olmana çok sevindik.',
    subtitleLine2: 'Yeni paylaşımlı alanın seni bekliyor ✨',
    close: 'Kapat',
    thanks: 'Teşekkürler!',
  },
  en: {
    titleDark: '',
    titleGradient: 'Welcome!',
    subtitleLine1: "So glad you're here.",
    subtitleLine2: 'Your next shared space is waiting for you ✨',
    close: 'Close',
    thanks: 'Thanks!',
  },
  fa: {
    titleDark: '',
    titleGradient: 'خوش آمدید!',
    subtitleLine1: 'خیلی خوشحالیم که اینجایی.',
    subtitleLine2: 'فضای اشتراکی بعدی‌ات منتظرته ✨',
    close: 'بستن',
    thanks: 'ممنون!',
  },
  ar: {
    titleDark: '',
    titleGradient: 'مرحباً!',
    subtitleLine1: 'يسعدنا حقاً وجودك معنا.',
    subtitleLine2: 'مساحتك المشتركة القادمة بانتظارك ✨',
    close: 'إغلاق',
    thanks: 'شكراً!',
  },
  de: {
    titleDark: '',
    titleGradient: 'Willkommen!',
    subtitleLine1: 'Schön, dass du hier bist.',
    subtitleLine2: 'Dein nächster gemeinsamer Raum wartet auf dich ✨',
    close: 'Schließen',
    thanks: 'Danke!',
  },
  ru: {
    titleDark: 'Добро',
    titleGradient: 'пожаловать!',
    subtitleLine1: 'Как здорово, что ты здесь.',
    subtitleLine2: 'Твоё новое общее пространство уже ждёт ✨',
    close: 'Закрыть',
    thanks: 'Спасибо!',
  },
} as const

export default function WelcomePopup({ lang: langProp = 'tr' }: { lang?: string }) {
  const [show, setShow] = useState(false)
  const [heartPulse, setHeartPulse] = useState(false)
  const { lang: contextLang } = useLang()

  const currentLang = (contextLang || langProp) as keyof typeof texts
  const t = texts[currentLang] || texts.tr

  useEffect(() => {
    // TODO: restore before public launch — full trigger logic (just-logged-in flag + once-per-session guard)
    // const justLoggedIn = sessionStorage.getItem('sefira_just_logged_in')
    // if (justLoggedIn) sessionStorage.removeItem('sefira_just_logged_in')
    // if (sessionStorage.getItem('welcome_popup_shown')) return
    // const reveal = () => {
    //   setShow(true)
    //   sessionStorage.setItem('welcome_popup_shown', 'true')
    // }
    // if (justLoggedIn) {
    //   timer = setTimeout(reveal, 1500)
    // } else {
    //   supabase.auth.getSession().then(({ data: { session } }) => {
    //     if (session) timer = setTimeout(reveal, 5000)
    //   })
    // }

    // Temporary test mode: show on every homepage load/refresh for any logged-in user, ~1.5s after mount
    let timer: ReturnType<typeof setTimeout> | undefined

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      timer = setTimeout(() => setShow(true), 1500)
    })

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handler = () => setShow(false)
    window.addEventListener('langSelectorOpened', handler)
    return () => window.removeEventListener('langSelectorOpened', handler)
  }, [])

  const handleClose = () => setShow(false)

  const handleConfirm = () => {
    setHeartPulse(true)
    setTimeout(() => setShow(false), 350)
  }

  const isRTL = currentLang === 'fa' || currentLang === 'ar'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="relative w-[92vw] max-w-md max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative w-full h-[38vh] max-h-64 min-h-[170px]">
              <Image
                src="/welcome-popup-bg.webp"
                alt=""
                fill
                priority
                className="object-cover object-[70%_35%]"
              />

              <button
                onClick={handleClose}
                aria-label={t.close}
                className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md active:scale-95 transition"
              >
                <X className="h-4 w-4 text-slate-700" />
              </button>

              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>

            <div className="relative bg-white px-6 pb-7 pt-2 text-center">
              <h2 className="text-4xl font-extrabold leading-tight">
                {t.titleDark && (
                  <>
                    <span className="text-slate-800">{t.titleDark}</span>{' '}
                  </>
                )}
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {t.titleGradient}
                </span>
              </h2>

              <div className="flex items-center justify-center gap-2 my-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-orange-400" />
                <span className="text-pink-500 text-base">♥</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-purple-500" />
              </div>

              <p className="text-[15px] leading-relaxed text-slate-500">
                {t.subtitleLine1}
                <br />
                {t.subtitleLine2}
              </p>

              <button
                onClick={handleConfirm}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-pink-500/40 active:scale-95 transition"
              >
                {isRTL ? (
                  <>
                    <span>{t.thanks}</span>
                    <motion.span
                      animate={heartPulse ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="flex"
                    >
                      <Heart className="h-5 w-5 fill-white text-white" />
                    </motion.span>
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={heartPulse ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="flex"
                    >
                      <Heart className="h-5 w-5 fill-white text-white" />
                    </motion.span>
                    <span>{t.thanks}</span>
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