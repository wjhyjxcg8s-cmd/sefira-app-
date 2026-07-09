'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { supabase } from '@/app/lib/supabase'

const languages = [
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fa', flag: '🇮🇷', label: 'FA' },
  { code: 'ar', flag: '🇸🇦', label: 'AR' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
]

export default function WelcomePopup({ lang = 'tr' }: { lang?: string }) {
  const [show, setShow] = useState(false)
  const [currentLang, setCurrentLang] = useState(lang)

  const texts = {
    tr: {
      badge: '🎉 Hoş Geldiniz!',
      title: 'Hayalindeki ev arkadaşını bul',
      subtitle: 'Türkiye\'nin en hızlı büyüyen ev arkadaşı platformuna katıl!',
      benefits: [
        '🏠 Binlerce doğrulanmış ilan',
        '⚡ Saniyeler içinde eşleş',
        '🔒 %100 güvenli platform',
        '💰 Tamamen ücretsiz kullan',
      ],
      cta: 'Ücretsiz Kayıt Ol 🚀',
      login: 'Zaten hesabım var',
      close: 'Şimdi değil',
    },
    en: {
      badge: '🎉 Welcome!',
      title: 'Find your perfect roommate',
      subtitle: 'Join the fastest growing roommate platform!',
      benefits: [
        '🏠 Thousands of verified listings',
        '⚡ Match in seconds',
        '🔒 100% safe platform',
        '💰 Completely free to use',
      ],
      cta: 'Sign Up Free 🚀',
      login: 'I already have an account',
      close: 'Not now',
    },
    fa: {
      badge: '🎉 خوش آمدید!',
      title: 'هم‌خونه ایده‌آلت رو پیدا کن',
      subtitle: 'به سریع‌ترین پلتفرم هم‌خونه‌یابی بپیوند!',
      benefits: [
        '🏠 هزاران آگهی تأیید شده',
        '⚡ در چند ثانیه هم‌خونه پیدا کن',
        '🔒 پلتفرم ۱۰۰٪ امن',
        '💰 کاملاً رایگان',
      ],
      cta: 'ثبت‌نام رایگان 🚀',
      login: 'حساب دارم',
      close: 'بعداً',
    },
    ar: {
      badge: '🎉 مرحباً!',
      title: 'ابحث عن شريك السكن المثالي',
      subtitle: 'انضم إلى أسرع منصة لإيجاد شريك السكن!',
      benefits: [
        '🏠 آلاف الإعلانات الموثقة',
        '⚡ اعثر على شريك سكن في ثوانٍ',
        '🔒 منصة آمنة 100٪',
        '💰 مجاني تماماً',
      ],
      cta: 'سجّل مجاناً 🚀',
      login: 'لدي حساب بالفعل',
      close: 'ليس الآن',
    },
    de: {
      badge: '🎉 Willkommen!',
      title: 'Finde deinen perfekten Mitbewohner',
      subtitle: 'Tritt der am schnellsten wachsenden Mitbewohner-Plattform bei!',
      benefits: [
        '🏠 Tausende verifizierter Anzeigen',
        '⚡ In Sekunden einen Match finden',
        '🔒 100% sichere Plattform',
        '💰 Völlig kostenlos',
      ],
      cta: 'Kostenlos registrieren 🚀',
      login: 'Ich habe bereits ein Konto',
      close: 'Nicht jetzt',
    },
    ru: {
      badge: '🎉 Добро пожаловать!',
      title: 'Найди идеального соседа',
      subtitle: 'Присоединяйся к самой быстрорастущей платформе для поиска соседей!',
      benefits: [
        '🏠 Тысячи проверенных объявлений',
        '⚡ Найди соседа за секунды',
        '🔒 Платформа безопасна на 100٪',
        '💰 Полностью бесплатно',
      ],
      cta: 'Зарегистрироваться бесплатно 🚀',
      login: 'У меня уже есть аккаунт',
      close: 'Не сейчас',
    },
  }

  const handleLangChange = (code: string) => {
    setCurrentLang(code)
    localStorage.setItem('sefira-lang', code)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: code }))
  }

  const t = texts[currentLang as keyof typeof texts] || texts.tr

  useEffect(() => {
    // TEMP: disabled for design testing — RESTORE BEFORE LAUNCH
    // if (sessionStorage.getItem('welcome_popup_shown')) return

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      // TEMP: disabled for design testing — RESTORE BEFORE LAUNCH
      // if (session) return

      const timer = setTimeout(() => {
        setShow(true)
        // TEMP: disabled for design testing — RESTORE BEFORE LAUNCH
        // sessionStorage.setItem('welcome_popup_shown', 'true')
      }, 1000)

      return () => clearTimeout(timer)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const handler = () => setShow(false)
    window.addEventListener('langSelectorOpened', handler)
    return () => window.removeEventListener('langSelectorOpened', handler)
  }, [])

  const handleClose = () => setShow(false)

  const handleRegister = () => {
    setShow(false)
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { tab: 'register' } }))
  }

  const handleLogin = () => {
    setShow(false)
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { tab: 'login' } }))
  }

  if (!show) return null

  const isRTL = currentLang === 'fa' || currentLang === 'ar'

  const [firstWord, ...restWords] = t.title.split(' ')
  const restOfTitle = restWords.join(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl bg-white"
      >
        {/* Background image */}
        <div className="relative w-full h-52">
          <Image
            src="/welcome-popup-bg.webp"
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label={t.close}
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-stone-600 hover:bg-white transition-colors`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Text content */}
        <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col items-center text-center px-6 pt-4 pb-7">
          <h2 className="text-3xl font-extrabold leading-tight">
            <span className="text-stone-900">{firstWord}</span>
            {restOfTitle ? (
              <>
                {' '}
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {restOfTitle}
                </span>
              </>
            ) : null}
          </h2>

          <div className="flex items-center gap-2 my-3">
            <span className="w-8 h-px bg-stone-200" />
            <span className="text-xs">❤️</span>
            <span className="w-8 h-px bg-stone-200" />
          </div>

          <p className="text-sm text-stone-500 leading-relaxed max-w-[260px]">
            {t.subtitle}
          </p>

          <button
            onClick={handleRegister}
            className="mt-5 rounded-full px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {t.cta}
          </button>

          <button
            onClick={handleLogin}
            className="mt-3 text-sm font-semibold text-stone-500 hover:text-orange-600 transition-colors"
          >
            {t.login}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
