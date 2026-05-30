'use client'
import { useEffect, useState } from 'react'
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
    if (sessionStorage.getItem('welcome_popup_shown')) return

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) return

      const timer = setTimeout(() => {
        setShow(true)
        sessionStorage.setItem('welcome_popup_shown', 'true')
      }, 5000)

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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Popup */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 40px',
        zIndex: 9999,
        maxWidth: '480px',
        margin: '0 auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
      }}>

        {/* Language selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 16px 0',
          flexWrap: 'wrap',
        }}>
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '50px',
                border: currentLang === l.code ? '2px solid #f97316' : '2px solid #eee',
                background: currentLang === l.code ? '#fff7ed' : 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: currentLang === l.code ? '700' : '500',
                color: currentLang === l.code ? '#f97316' : '#666',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        {/* Handle bar */}
        <div style={{
          width: '40px', height: '4px',
          background: '#e0e0e0', borderRadius: '2px',
          margin: '20px auto 20px',
        }} />

        {/* Hero decoration */}
        <div style={{
          fontSize: '48px',
          lineHeight: 1,
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          🏠✨
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '14px',
        }}>
          {t.badge}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px', fontWeight: '900',
          color: '#1a1a1a', margin: '0 0 10px',
          lineHeight: 1.25,
        }}>
          {t.title}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '15px', color: '#666',
          margin: '0 0 18px', lineHeight: 1.6,
        }}>
          {t.subtitle}
        </p>

        {/* Benefits */}
        <div style={{ marginBottom: '22px' }}>
          {t.benefits.map((b, i) => (
            <div key={i} style={{
              fontSize: '14px', color: '#333',
              padding: '5px 0', fontWeight: '500',
            }}>
              {b}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleRegister}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '800',
            cursor: 'pointer',
            marginBottom: '12px',
            animation: 'ctaPulse 2s infinite',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {t.cta}
        </button>

        {/* Login link */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            background: 'transparent',
            border: '2px solid #f97316',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#f97316',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          {t.login}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#999',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          {t.close}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(249,115,22,0.4); }
          50%       { box-shadow: 0 4px 35px rgba(249,115,22,0.7); }
        }
      `}</style>
    </>
  )
}
