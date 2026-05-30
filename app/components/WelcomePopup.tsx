'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function WelcomePopup({ lang = 'tr' }: { lang?: string }) {
  const [show, setShow] = useState(false)

  const texts = {
    tr: {
      badge: '🎉 Hoş Geldiniz!',
      title: 'Hayalindeki ev arkadaşını bul',
      subtitle: 'Binlerce kişi Sefira sayesinde mükemmel ev arkadaşını buldu. Sen de aramıza katıl!',
      benefits: [
        '✅ Ücretsiz profil oluştur',
        '✅ Binlerce ilanı görüntüle',
        '✅ Güvenli mesajlaşma',
        '✅ Doğrulanmış kullanıcılar',
      ],
      cta: 'Ücretsiz Kayıt Ol 🚀',
      login: 'Zaten hesabım var',
      close: 'Şimdi değil',
    },
    en: {
      badge: '🎉 Welcome!',
      title: 'Find your perfect roommate',
      subtitle: 'Thousands of people found their perfect roommate through Sefira. Join us today!',
      benefits: [
        '✅ Create free profile',
        '✅ Browse thousands of listings',
        '✅ Safe messaging',
        '✅ Verified users',
      ],
      cta: 'Sign Up Free 🚀',
      login: 'I already have an account',
      close: 'Not now',
    },
    fa: {
      badge: '🎉 خوش آمدید!',
      title: 'هم‌خونه ایده‌آلت رو پیدا کن',
      subtitle: 'هزاران نفر از طریق سفیرا هم‌خونه پیدا کردن. تو هم بپیوند!',
      benefits: [
        '✅ پروفایل رایگان بساز',
        '✅ هزاران آگهی ببین',
        '✅ پیام‌رسانی امن',
        '✅ کاربران تأیید شده',
      ],
      cta: 'ثبت‌نام رایگان 🚀',
      login: 'حساب دارم',
      close: 'بعداً',
    },
    ar: {
      badge: '🎉 مرحباً!',
      title: 'ابحث عن شريك السكن المثالي',
      subtitle: 'آلاف الأشخاص وجدوا شريك السكن المثالي عبر Sefira. انضم إلينا!',
      benefits: [
        '✅ أنشئ ملفاً مجانياً',
        '✅ تصفح آلاف الإعلانات',
        '✅ مراسلة آمنة',
        '✅ مستخدمون موثقون',
      ],
      cta: 'سجّل مجاناً 🚀',
      login: 'لدي حساب بالفعل',
      close: 'ليس الآن',
    },
    de: {
      badge: '🎉 Willkommen!',
      title: 'Finde deinen perfekten Mitbewohner',
      subtitle: 'Tausende haben über Sefira ihren perfekten Mitbewohner gefunden. Mach mit!',
      benefits: [
        '✅ Kostenloses Profil erstellen',
        '✅ Tausende Anzeigen durchsuchen',
        '✅ Sicheres Messaging',
        '✅ Verifizierte Nutzer',
      ],
      cta: 'Kostenlos registrieren 🚀',
      login: 'Ich habe bereits ein Konto',
      close: 'Nicht jetzt',
    },
    ru: {
      badge: '🎉 Добро пожаловать!',
      title: 'Найди идеального соседа',
      subtitle: 'Тысячи людей нашли идеального соседа через Sefira. Присоединяйся!',
      benefits: [
        '✅ Создай бесплатный профиль',
        '✅ Просматривай тысячи объявлений',
        '✅ Безопасные сообщения',
        '✅ Проверенные пользователи',
      ],
      cta: 'Зарегистрироваться бесплатно 🚀',
      login: 'У меня уже есть аккаунт',
      close: 'Не сейчас',
    },
  }

  const t = texts[lang as keyof typeof texts] || texts.tr

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

  const isRTL = lang === 'fa' || lang === 'ar'

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
          animation: 'fadeIn 0.3s ease'
        }}
      />

      {/* Popup */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'white',
        borderRadius: '24px 24px 0 0',
        padding: '32px 24px 40px',
        zIndex: 9999,
        maxWidth: '480px',
        margin: '0 auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
      }}>

        {/* Handle bar */}
        <div style={{
          width: '40px', height: '4px',
          background: '#e0e0e0', borderRadius: '2px',
          margin: '0 auto 24px',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '16px',
        }}>
          {t.badge}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '24px', fontWeight: '800',
          color: '#1a1a1a', margin: '0 0 12px',
          lineHeight: 1.3,
        }}>
          {t.title}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '15px', color: '#666',
          margin: '0 0 20px', lineHeight: 1.6,
        }}>
          {t.subtitle}
        </p>

        {/* Benefits */}
        <div style={{ marginBottom: '24px' }}>
          {t.benefits.map((b, i) => (
            <div key={i} style={{
              fontSize: '14px', color: '#333',
              padding: '6px 0', fontWeight: '500',
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
            boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
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
      `}</style>
    </>
  )
}
