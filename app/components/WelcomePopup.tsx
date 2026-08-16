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
    const WELCOME_COOLDOWN_MS = 60 * 60 * 1000

    let timer: ReturnType<typeof setTimeout> | undefined

    let justLoggedIn = false
    try {
      justLoggedIn = sessionStorage.getItem('sefira_just_logged_in') === '1'
      if (justLoggedIn) sessionStorage.removeItem('sefira_just_logged_in')
    } catch {
      // Safari private mode / storage unavailable — fall through as not-just-logged-in
    }

    const reveal = () => {
      setShow(true)
      try {
        localStorage.setItem('sefira_welcome_last_shown', String(Date.now()))
      } catch {
        // Safari private mode / storage unavailable
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return

      if (justLoggedIn) {
        timer = setTimeout(reveal, 1500)
        return
      }

      let eligible = true
      try {
        const lastShownRaw = localStorage.getItem('sefira_welcome_last_shown')
        if (lastShownRaw !== null) {
          const lastShown = Number(lastShownRaw)
          eligible = Number.isNaN(lastShown) || Date.now() - lastShown >= WELCOME_COOLDOWN_MS
        }
      } catch {
        eligible = true
      }

      if (eligible) timer = setTimeout(reveal, 1500)
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
          // z-10000, one above the page navbars' z-9999. At 9998 the fixed header
          // painted *over* this dialog: on a short desktop viewport (~600px of
          // content, i.e. a 1280×720 or 1366×768 laptop) the centred card's top
          // lands above 65px, so the artwork and the close button disappeared
          // behind the header — and elementFromPoint hit the header, so the close
          // button was not even clickable. Overlays that must sit above the
          // chrome live at 10000+ here (SearchSheet 10001, ProfileDrawer 99999).
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            dir={isRTL ? 'rtl' : 'ltr'}
            // flex column + a scrollable body: when the card would outgrow 85vh the
            // text scrolls instead of the card being clipped, so the artwork block
            // holding the close button is never the part that gets cut.
            className="relative flex w-[92vw] max-w-[440px] max-h-[85vh] flex-col rounded-3xl overflow-hidden bg-white ring-1 ring-stone-200 shadow-2xl shadow-stone-900/10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Artwork band. The old art was a violet illustration that shared no
                palette with the product; this is the same house style as the
                homepage's "en son ilanlar" band, and scripts/crop-welcome-art.mjs
                already multiplied its background onto orange-50 (corners measured
                254,247,238 vs #fff7ed) — so on this orange-50 band it has no
                picture box at all and the space either side of it is invisible.
                The band caps the art's HEIGHT rather than letting it span the card:
                the greeting is the subject, the picture supports it. `object-contain`
                keeps the clipping fix — nothing can crop at any band height. */}
            <div className="relative flex h-[168px] w-full shrink-0 items-center justify-center bg-orange-50 px-6 py-4 sm:h-[184px]">
              {/* `unoptimized`, for the same reason the "en son ilanlar" band art
                  carries it: this illustration is mostly ONE flat field, and Next's
                  q=75 pass (it was serving a 380px re-encode here) smears that field
                  just enough to outline the picture box against the pristine CSS
                  orange-50 behind it. Served as authored, the art's background is
                  (254,247,238) against the band's (255,247,237) — a 1/255 delta on
                  one channel, i.e. no edge at all. The file is 820px for a ~290px
                  draw, so there is nothing to gain from the optimizer anyway. */}
              <Image
                src="/welcome-popup-art-v3.webp"
                alt=""
                width={820}
                height={469}
                priority
                unoptimized
                className="h-full w-auto object-contain"
              />

              {/* `end-3`, not `right-3`: mirrors to the left edge in FA/AR. */}
              <button
                onClick={handleClose}
                aria-label={t.close}
                className="absolute top-3 end-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-stone-600 ring-1 ring-stone-200 backdrop-blur transition hover:text-stone-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* pt-4: with the band's own pb-4 that puts 32px between the artwork and
                the headline — the section break, one step up from the 16px inside the
                copy block and the 24px before the button. At pt-6 the gap was 40px,
                the only measurement in the card that was off the 4/8 scale. */}
            <div className="relative min-h-0 flex-1 overflow-y-auto bg-white px-6 pb-7 pt-4 text-center">
              {/* Two tones, not three: stone-900 with the accent word in the brand
                  orange — the same split the homepage hero uses. The old headline
                  ran a orange→pink→purple gradient through clipped text, which is
                  two colours the product does not own. */}
              <h2 className="text-[28px] font-black leading-tight tracking-tight text-stone-900 sm:text-3xl">
                {t.titleDark && <>{t.titleDark} </>}
                <span className="text-orange-500">{t.titleGradient}</span>
              </h2>

              {/* A hairline, not the pink heart rule — decorative dividers aren't
                  part of the design language. */}
              <span className="mx-auto mt-4 block h-px w-12 bg-stone-200" />

              <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
                {t.subtitleLine1}
                <br />
                {t.subtitleLine2}
              </p>

              {/* Flat #f97316 + rounded-full: the same primary CTA as Başla / İlan Ver. */}
              <button
                onClick={handleConfirm}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
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