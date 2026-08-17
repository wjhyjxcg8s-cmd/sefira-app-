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
          // CARRIED FORWARD (bug fix, not design): z-10000, one above the page
          // navbars' z-9999. At the original z-9998 the fixed header painted OVER
          // this dialog — on a short desktop viewport (~600px of content, i.e. a
          // 1280x720 or 1366x768 laptop) the centred card's top lands above 65px, so
          // the artwork and the close button disappeared behind the header and
          // elementFromPoint hit the header, leaving the close button unclickable.
          // Overlays that must sit above the chrome live at 10000+ here
          // (SearchSheet 10001, ProfileDrawer 99999).
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            dir={isRTL ? 'rtl' : 'ltr'}
            // CARRIED FORWARD (bug fix): flex column + a scrollable text zone, so
            // when the card would outgrow 85vh the copy scrolls instead of the card
            // being clipped — the image zone holding the close button is never the
            // part that gets cut.
            // `dvh`, not `vh`: on iOS `vh` resolves against the LARGE viewport, so with
            // Safari's toolbars up the cap allowed a card taller than the visible area —
            // the text zone then scrolled and the headline slid up under the band. `dvh`
            // tracks the viewport that is actually on screen.
            // 92 rather than 85 because the cap is a backstop, not a design measure, and
            // at 85 it was the thing that clipped: 360x640 in Russian (the longest copy —
            // a 300px text zone) needs 544px and 85dvh gives exactly 544, so the body
            // scrolled by a hair. 92dvh = 589 there, and the backdrop's own p-4 still
            // keeps the card off the viewport edges. The scrollable body remains the
            // last-resort backstop; with the band capped below, it should never engage.
            className="relative flex w-[92vw] max-w-md max-h-[92dvh] flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Image zone — the owner's original split-zone proportions kept exactly
                (h-[38vh] / max-h-64 / min-h-[170px]), with the placement discipline
                carried forward. The asset is the owner's violet source (see the
                crop named below) — crop only, no retint, no colour change — and
                drawn with object-contain, which cannot clip at any band height.
                The original object-cover with object-[70%_35%] on the untrimmed
                source is what cut the blue building pin off the top and put the
                empty dot-grid corner on screen on a phone. Padding gives the pins
                their air rather than baked-in whitespace. */}
            {/* Below lg the band takes the ARTWORK'S ratio and carries no padding, so the
                drawing spans the card edge to edge — no white flanks, and therefore no
                straight edge for the art's lavender/peach wash to meet. That part of the
                previous fix stays.
                The asset is the BALANCED landscape crop (955x818 = 1.167:1,
                scripts/crop-welcome-violet-balanced.mjs), replacing v6's 1104x818. Same top
                edge, same height — not one pixel of the scene differs — with 149px of empty
                wash taken off the left, which moves the scene from 63.5% to 57.8% of the
                frame. It cannot reach 50%: the shop's platform is clipped by the source's
                own right edge, so there is no right-hand background to extend into, and
                object-position cannot help because the band takes the art's ratio (cover
                degenerates to contain — nothing to pan). The crop script carries the
                measurements.
                The ratio is what the no-scroll invariant costs: full bleed at the ink box's
                own 0.926 made the card 636px at 390 wide, and even 1.167 makes Russian —
                the longest copy — scroll on a 360x640 phone. That config was dropped
                deliberately in exchange for the balance; 390x700 Russian, a real iPhone
                with Safari's toolbars up, is now the tightest config held and clears by
                10px. Going further (1.131, scene at 56.4%) leaves it clearing by 0.1px,
                which is the boundary rather than a margin — hence 1.167.
                object-cover was ruled out by arithmetic, not taste: at these band ratios it
                has to drop 23-33% of the artwork's height, which loses either the top pin
                (tip at y=0) or the house.
                From lg the capped band returns — a full-bleed band there would be far too
                tall and would push the card past the cap on a 1280x600 window. There the
                art is height-fitted, so this crop renders the scene at exactly the size v6
                did, just inside a narrower frame.
                object-contain throughout, so nothing can clip at any size. */}
            <div className="relative flex aspect-[955/818] w-full shrink-0 items-center justify-center overflow-hidden bg-white lg:aspect-auto lg:h-[38vh] lg:max-h-64 lg:min-h-[170px] lg:px-6 lg:pt-5 lg:pb-2">
              <Image
                src="/welcome-popup-art-v7.webp"
                alt=""
                width={955}
                height={818}
                priority
                unoptimized
                className="h-full w-auto object-contain"
              />

              {/* CARRIED FORWARD (bug fix): end-3, not right-3 — mirrors to the left
                  edge in FA/AR instead of overlapping the artwork's near corner. */}
              <button
                onClick={handleClose}
                aria-label={t.close}
                className="absolute top-3 end-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md active:scale-95 transition"
              >
                <X className="h-4 w-4 text-slate-700" />
              </button>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* pt-4 is the headline's fixed clearance from the band. The white fade lives
                inside the band (its bottom 80px), so it cannot reach across this padding —
                the earlier overlap was the text zone SCROLLING, not the fade, and the
                capped band above is what removes the need to scroll at all. */}
            <div className="relative min-h-0 flex-1 overflow-y-auto bg-white px-6 pb-7 pt-4 text-center">
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
