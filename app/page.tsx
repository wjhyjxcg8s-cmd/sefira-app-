"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import WelcomePopup from "@/app/components/WelcomePopup";
import PopularCities from "@/app/components/PopularCities";
import PropertyFilters from "@/app/components/PropertyFilters";
import AuthModal from "@/app/components/AuthModal";
import OnboardingFlow from "@/app/components/OnboardingFlow";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";
import {
  type Currency,
  CURRENCY_SYMBOLS,
  convertBudgetRange,
  displayPrice,
  fetchLiveRates,
} from "@/app/lib/currency";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  tr: {
    navLinks: [
      { label: "Oda Bul", href: "#" },
      { label: "Ev Arkadaşı Bul", href: "#" },
      { label: "İlan Ver", href: "/create-listing" },
      { label: "Topluluk", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "Doğrulanmış Kullanıcı" },
      { value: "52",    label: "Dünya Genelinde Şehir" },
      { value: "98%",   label: "Eşleşme Memnuniyeti" },
      { value: "4.9★",  label: "Uygulama Puanı" },
    ],
    signIn: "Giriş Yap",
    signOut: "Çıkış Yap",
    getStarted: "Başla",
    heroBadge: "52 şehirde 127.000'den fazla doğrulanmış kullanıcı tarafından güvenilir",
    heroLine1: "İdeal Evinizi",
    heroLine2: "ve Ev Arkadaşınızı",
    heroLine3: "Bulun.",
    heroP: "Yapay zeka destekli ev arkadaşı eşleştirme ve premium paylaşım ilanı keşfi. Yurt dışında yaşayanlar, öğrenciler ve modern profesyoneller için tasarlandı.",
    // ── Wizard ──
    wizardTitle: "Ne arıyorsunuz?",
    optionSeekingTitle: "Evim var, iyi bir ev arkadaşı arıyorum",
    optionSeekingSubtitle: "Evim var, iyi bir ev arkadaşı arıyorum",
    optionOfferingTitle: "Evim yok, oda veya ev arıyorum (ev arkadaşı)",
    optionOfferingSubtitle: "Evim yok, oda veya ev arıyorum (ev arkadaşı)",
    genderStep: "Tercih Edilen Cinsiyet",
    genderStepSub: "Tercih edilen cinsiyet",
    genderMale: "Erkek",
    genderFemale: "Kadın",
    genderAny: "Farketmez",
    budgetStep: "Aylık Bütçe",
    budgetStepSub: "Aylık bütçeniz",
    locationStep: "Nerede Arıyorsunuz?",
    locationStepSub: "Nerede arıyorsunuz?",
    backBtn: "Geri",
    nextBtn: "İleri",
    searchNowBtn: "Hemen Ara",
    seekingChip: "Oda arıyor",
    offeringChip: "Oda sunuyor",
    countryPlaceholder: "Ülke",
    cityPlaceholder: "Şehir",
    loadingText: "Yükleniyor…",
    priorityGroupLabel: "⭐ Popüler Ülkeler",
    allCountriesLabel: "Tüm Ülkeler",
    searchPlaceholder: "Şehir, mahalle veya anahtar kelime ara...",
    matchesThisWeek: "Bu hafta 2.847 eşleşme",
    reviewsLabel: "12.000'den fazla değerlendirmeden 4.9 yıldız",
    storiesTitle: "Topluluk Hikayeleri",
    storiesLive: "Canlı",
    addStory: "Hikaye Ekle",
    aiMatchBadge: "Yapay Zeka Destekli Eşleştirme",
    aiMatchLine1: "Mükemmel Eşiniz",
    aiMatchLine2: "Sizi Buluyor.",
    aiMatchP: "Yapay zekamız, uyku düzeninden sosyal alışkanlıklara kadar 40'tan fazla uyumluluk faktörünü analiz eder; gerçekten birlikte yaşamak isteyeceğiniz kişileri öne çıkarır.",
    compatBars: [
      { label: "Yaşam Tarzı Uyumu", value: 97,  color: "from-blue-500 to-violet-600" },
      { label: "Uyku Düzeni",       value: 94,  color: "from-emerald-500 to-teal-600" },
      { label: "Temizlik",          value: 100, color: "from-amber-500 to-orange-600" },
      { label: "Bütçe Aralığı",     value: 88,  color: "from-rose-500 to-pink-600" },
    ],
    findMatchesBtn: "Eşleşmelerimi Bul",
    matchLabel: "Eşleşme",
    verifiedLabel: "Doğrulandı",
    petsOk: "Evcil Hayvan Olabilir",
    noPets: "Evcil Hayvan Yok",
    smoker: "Sigara İçiyor",
    nonSmoker: "Sigara İçmiyor",
    skipBtn: "Geç",
    likeBtn: "Beğen",
    featuredH2: "Öne Çıkan İlanlar",
    featuredP: "Premium doğrulanmış odalar ve daireler",
    listingFilterAll: "Tümü",
    listingVerified: "Doğrulandı",
    perMonth: "/ay",
    viewAllBtn: "Tüm İlanları Gör",
    howH2: "Sefira Nasıl Çalışır?",
    howP: "Profilden mükemmel eve 48 saatin altında.",
    howItWorks: [
      { step: "01", title: "Profil Oluştur",         desc: "Yaşam tarzınızı, bütçenizi ve kişiliğinizi bize anlatın. Yapay zekamız sizi benzersiz kılan şeyleri öğrenir.",               icon: "✦", gradient: "from-blue-500 to-indigo-600" },
      { step: "02", title: "Yapay Zeka Eşleşmeleri", desc: "40'tan fazla uyumluluk faktörü anında analiz edildi. Mükemmel ev arkadaşınız düşündüğünüzden daha yakın.",                   icon: "◈", gradient: "from-violet-500 to-purple-600" },
      { step: "03", title: "Kaydır ve Bağlan",       desc: "Beğen, eşleş ve mesajlaş. Herhangi bir taahhüt vermeden önce video ile doğrula.",                                            icon: "◎", gradient: "from-pink-500 to-rose-600" },
      { step: "04", title: "Taşın",                  desc: "Dijital olarak imzala, topluluk desteği al ve mükemmel evinize yerleş.",                                                      icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
    ],
    roommatesH2: "Yakınındaki En İyi Eşleşmeler",
    roommatesP: "Şu anda Berlin'de ev arkadaşı arayan kişiler",
    viewAll: "Tümünü Gör",
    matchedBtn: "Eşleşildi!",
    connectBtn: "Bağlan",
    petsOkShort: "Evcil Hayvan Olabilir",
    noPetsShort: "Evcil Hayvan Yok",
    trendingH2: "Popüler Şehirler",
    trendingP: "Modern insanların 2025'te taşındığı yerler",
    activeListings: "aktif ilan",
    testiH2: "Binlerce Kişi Tarafından Seviliyor",
    testiReviews: "12.000'den fazla değerlendirmeden",
    appH2a: "Sefira cebinizde.",
    appH2b: "Her Yerde. Her Zaman.",
    appP: "Anında eşleşme bildirimleri, gerçek zamanlı mesajlaşma ve gidilen her yerde ilan kaydırma.",
    appStoreLabel: "İndir:",
    appStoreName: "App Store",
    googlePlayLabel: "Şuradan edin:",
    googlePlayName: "Google Play",
    newMatch: "Yeni Eşleşme!",
    likedProfile: "Emma W. profilinizi beğendi",
    compatibility: "%97 uyumluluk · 2 dakika önce",
    suggested: "Önerilen",
    footerDesc: "Ev arkadaşı ve ev bulmak için en güvenilir platform. Modern, sınırsız yaşam için tasarlandı.",
    footerLinks: [
      { title: "Ürün",   links: ["Oda Bul", "Ev Arkadaşı Bul", "İlan Ver", "Yapay Zeka Eşleştirme", "Premium"] },
      { title: "Şirket", links: ["Hakkımızda", "Blog", "Kariyer", "Basın", "İletişim"] },
      { title: "Destek", links: ["Yardım Merkezi", "Güvenlik", "Kullanım Koşulları", "Gizlilik", "Çerezler"] },
    ],
    footerCopy: "2025 Sefira Technologies, Inc. Tüm hakları saklıdır.",
    footerLegal: ["Kullanım Koşulları", "Gizlilik", "Çerezler"],
    ilanVer: "İlan Ver",
    ilanVerModal: "İlan vermek için lütfen giriş yapın veya kayıt olun.",
    girisYap: "Giriş Yap",
    kayitOl: "Kayıt Ol",
    followTitle: "Bizi Takip Edin",
    followBtn: "Takip Et →",
    joinChannelBtn: "Kanala Katıl →",
    igDesc: "Özel ev arkadaşı ipuçları ve gerçek eşleşme hikayeleri",
    tgDesc: "Anlık bildirimler ve özel teklifler için kanalımıza katılın",
  },
  en: {
    navLinks: [
      { label: "Find Rooms", href: "#" },
      { label: "Find Roommates", href: "#" },
      { label: "List Property", href: "/create-listing" },
      { label: "Community", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "Verified Users" },
      { value: "52",    label: "Cities Worldwide" },
      { value: "98%",   label: "Match Satisfaction" },
      { value: "4.9★",  label: "App Rating" },
    ],
    signIn: "Sign In",
    signOut: "Log Out",
    getStarted: "Get Started",
    heroBadge: "Trusted by 127,000+ verified users across 52 cities",
    heroLine1: "Find Your",
    heroLine2: "Perfect Home",
    heroLine3: "and Roommate.",
    heroP: "AI-powered roommate matching meets premium sharing discovery. Built for expats, students, and modern professionals.",
    // ── Wizard ──
    wizardTitle: "What are you looking for?",
    optionSeekingTitle: "I have a place and I'm looking for a good roommate",
    optionSeekingSubtitle: "I have a place and I'm looking for a good roommate",
    optionOfferingTitle: "I need a place – looking for a room or apartment",
    optionOfferingSubtitle: "I need a place – looking for a room or apartment",
    genderStep: "Preferred Housemate Gender",
    genderStepSub: "Preferred gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderAny: "Any",
    budgetStep: "Monthly Budget",
    budgetStepSub: "Your monthly budget",
    locationStep: "Where are you looking?",
    locationStepSub: "Where are you looking?",
    backBtn: "Back",
    nextBtn: "Next",
    searchNowBtn: "Search Now",
    seekingChip: "Looking for a room",
    offeringChip: "Offering a room",
    countryPlaceholder: "Country",
    cityPlaceholder: "City",
    loadingText: "Loading…",
    priorityGroupLabel: "⭐ Top Destinations",
    allCountriesLabel: "All Countries",
    searchPlaceholder: "Search city, neighborhood, or keyword...",
    matchesThisWeek: "2,847 matches this week",
    reviewsLabel: "4.9 stars from 12,000+ reviews",
    storiesTitle: "Community Stories",
    storiesLive: "Live",
    addStory: "Add Story",
    aiMatchBadge: "AI-Powered Matching",
    aiMatchLine1: "Your Perfect Match",
    aiMatchLine2: "Finds You.",
    aiMatchP: "Our AI analyzes 40+ compatibility factors from sleep schedules to social habits, surfacing people you will genuinely want to live with.",
    compatBars: [
      { label: "Lifestyle Match", value: 97,  color: "from-blue-500 to-violet-600" },
      { label: "Sleep Schedule",  value: 94,  color: "from-emerald-500 to-teal-600" },
      { label: "Cleanliness",     value: 100, color: "from-amber-500 to-orange-600" },
      { label: "Budget Range",    value: 88,  color: "from-rose-500 to-pink-600" },
    ],
    findMatchesBtn: "Find My Matches",
    matchLabel: "Match",
    verifiedLabel: "Verified",
    petsOk: "Pets OK",
    noPets: "No Pets",
    smoker: "Smoker",
    nonSmoker: "Non-smoker",
    skipBtn: "Skip",
    likeBtn: "Like",
    featuredH2: "Featured Listings",
    featuredP: "Premium verified rooms and apartments",
    listingFilterAll: "All",
    listingVerified: "Verified",
    perMonth: "/mo",
    viewAllBtn: "View All Listings",
    howH2: "How Sefira Works",
    howP: "From profile to perfect home in under 48 hours.",
    howItWorks: [
      { step: "01", title: "Build Your Profile", desc: "Tell us your lifestyle, budget, and personality. Our AI learns what makes you unique.",         icon: "✦", gradient: "from-blue-500 to-indigo-600" },
      { step: "02", title: "Get AI Matches",     desc: "40+ compatibility factors analyzed instantly. Your perfect roommate is closer than you think.", icon: "◈", gradient: "from-violet-500 to-purple-600" },
      { step: "03", title: "Swipe and Connect",  desc: "Like, match, and message. Video verify before any commitment is made.",                         icon: "◎", gradient: "from-pink-500 to-rose-600" },
      { step: "04", title: "Move In",            desc: "Sign digitally, get community support, and settle into your perfect home.",                    icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
    ],
    roommatesH2: "Top Matches Near You",
    roommatesP: "People looking for roommates in Berlin right now",
    viewAll: "View all",
    matchedBtn: "Matched!",
    connectBtn: "Connect",
    petsOkShort: "Pets OK",
    noPetsShort: "No pets",
    trendingH2: "Trending Cities",
    trendingP: "Where modern people are moving in 2025",
    activeListings: "active listings",
    testiH2: "Loved by Thousands",
    testiReviews: "from 12,000+ reviews",
    appH2a: "Sefira in your pocket.",
    appH2b: "Anywhere. Anytime.",
    appP: "Instant match notifications, real-time messaging, and swipe through listings on the go.",
    appStoreLabel: "Download on the",
    appStoreName: "App Store",
    googlePlayLabel: "Get it on",
    googlePlayName: "Google Play",
    newMatch: "New Match!",
    likedProfile: "Emma W. liked your profile",
    compatibility: "97% compatibility · 2 min ago",
    suggested: "Suggested",
    footerDesc: "The most trusted platform for finding roommates and rooms. Built for modern, borderless living.",
    footerLinks: [
      { title: "Product", links: ["Find Rooms", "Find Roommates", "List Property", "AI Matching", "Premium"] },
      { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
      { title: "Support", links: ["Help Center", "Safety", "Terms", "Privacy", "Cookies"] },
    ],
    footerCopy: "2025 Sefira Technologies, Inc. All rights reserved.",
    footerLegal: ["Terms", "Privacy", "Cookies"],
    ilanVer: "Create Listing",
    ilanVerModal: "Please sign in or register to create a listing.",
    girisYap: "Sign In",
    kayitOl: "Register",
    followTitle: "Follow Us",
    followBtn: "Follow →",
    joinChannelBtn: "Join Channel →",
    igDesc: "Exclusive roommate tips and real match stories",
    tgDesc: "Join our channel for instant notifications and special offers",
  },
  fa: {
    navLinks: [
      { label: "پیدا کردن اتاق", href: "#" },
      { label: "پیدا کردن هم‌خانه", href: "#" },
      { label: "ثبت آگهی", href: "/create-listing" },
      { label: "جامعه", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "کاربر تأیید شده" },
      { value: "52",    label: "شهر در سراسر جهان" },
      { value: "98%",   label: "رضایت از تطابق" },
      { value: "4.9★",  label: "امتیاز اپلیکیشن" },
    ],
    signIn: "ورود",
    signOut: "خروج",
    getStarted: "شروع کن",
    heroBadge: "مورد اعتماد بیش از ۱۲۷,۰۰۰ کاربر تأیید شده در ۵۲ شهر",
    heroLine1: "خانه ایده‌آل",
    heroLine2: "و هم‌خانه خود را",
    heroLine3: "پیدا کنید.",
    heroP: "اتصال هوشمند هم‌خانه و کشف آگهی‌های مشترک ممتاز. طراحی شده برای مهاجران، دانشجویان و متخصصان مدرن.",
    // ── Wizard ──
    wizardTitle: "دنبال چه می‌گردید؟",
    optionSeekingTitle: "خونه یا اتاق دارم و دنبال هم‌خونه خوب می‌گردم",
    optionSeekingSubtitle: "خونه یا اتاق دارم و دنبال هم‌خونه خوب می‌گردم",
    optionOfferingTitle: "خونه ندارم، دنبال خونه یا اتاق می‌گردم (هم‌خونه)",
    optionOfferingSubtitle: "خونه ندارم، دنبال خونه یا اتاق می‌گردم (هم‌خونه)",
    genderStep: "جنسیت مورد نظر هم‌خانه",
    genderStepSub: "جنسیت مورد نظر",
    genderMale: "مرد",
    genderFemale: "زن",
    genderAny: "فرقی نمی‌کند",
    budgetStep: "بودجه ماهانه",
    budgetStepSub: "بودجه ماهانه شما",
    locationStep: "کجا دنبال می‌گردید؟",
    locationStepSub: "کجا دنبال می‌گردید؟",
    backBtn: "بازگشت",
    nextBtn: "بعدی",
    searchNowBtn: "جستجو کن",
    seekingChip: "دنبال اتاق",
    offeringChip: "اتاق دارم",
    countryPlaceholder: "کشور",
    cityPlaceholder: "شهر",
    loadingText: "در حال بارگذاری…",
    priorityGroupLabel: "⭐ مقاصد محبوب",
    allCountriesLabel: "همه کشورها",
    searchPlaceholder: "جستجوی شهر، محله یا کلمه کلیدی...",
    matchesThisWeek: "۲,۸۴۷ تطابق این هفته",
    reviewsLabel: "۴.۹ ستاره از بیش از ۱۲,۰۰۰ نظر",
    storiesTitle: "داستان‌های جامعه",
    storiesLive: "زنده",
    addStory: "افزودن داستان",
    aiMatchBadge: "تطابق با هوش مصنوعی",
    aiMatchLine1: "همتای کامل شما",
    aiMatchLine2: "شما را پیدا می‌کند.",
    aiMatchP: "هوش مصنوعی ما بیش از ۴۰ عامل سازگاری را از برنامه خواب تا عادات اجتماعی تحلیل می‌کند و افرادی را معرفی می‌کند که واقعاً دوست دارید با آن‌ها زندگی کنید.",
    compatBars: [
      { label: "تطابق سبک زندگی", value: 97,  color: "from-blue-500 to-violet-600" },
      { label: "برنامه خواب",      value: 94,  color: "from-emerald-500 to-teal-600" },
      { label: "نظافت",            value: 100, color: "from-amber-500 to-orange-600" },
      { label: "محدوده بودجه",     value: 88,  color: "from-rose-500 to-pink-600" },
    ],
    findMatchesBtn: "پیدا کردن تطابق‌هایم",
    matchLabel: "تطابق",
    verifiedLabel: "تأیید شده",
    petsOk: "حیوانات خانگی مجاز",
    noPets: "بدون حیوانات خانگی",
    smoker: "سیگاری",
    nonSmoker: "غیرسیگاری",
    skipBtn: "رد کن",
    likeBtn: "لایک",
    featuredH2: "آگهی‌های ویژه",
    featuredP: "اتاق‌ها و آپارتمان‌های ممتاز تأیید شده",
    listingFilterAll: "همه",
    listingVerified: "تأیید شده",
    perMonth: "/ماه",
    viewAllBtn: "مشاهده همه آگهی‌ها",
    howH2: "سفیرا چگونه کار می‌کند؟",
    howP: "از پروفایل تا خانه کامل در کمتر از ۴۸ ساعت.",
    howItWorks: [
      { step: "۰۱", title: "پروفایل بسازید",          desc: "سبک زندگی، بودجه و شخصیت خود را به ما بگویید. هوش مصنوعی ما یاد می‌گیرد چه چیزی شما را منحصربه‌فرد می‌کند.",                icon: "✦", gradient: "from-blue-500 to-indigo-600" },
      { step: "۰۲", title: "تطابق هوش مصنوعی",        desc: "بیش از ۴۰ عامل سازگاری به صورت فوری تحلیل شد. هم‌خانه کامل شما نزدیک‌تر از آن چیزی است که فکر می‌کنید.",                icon: "◈", gradient: "from-violet-500 to-purple-600" },
      { step: "۰۳", title: "بکشید و ارتباط بگیرید",    desc: "لایک کنید، تطابق بگیرید و پیام بدهید. قبل از هر تعهدی تأیید ویدیویی کنید.",                                                icon: "◎", gradient: "from-pink-500 to-rose-600" },
      { step: "۰۴", title: "اسباب‌کشی کنید",           desc: "دیجیتالی امضا کنید، پشتیبانی جامعه بگیرید و در خانه کامل خود مستقر شوید.",                                               icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
    ],
    roommatesH2: "بهترین تطابق‌های نزدیک شما",
    roommatesP: "افرادی که اکنون در برلین دنبال هم‌خانه می‌گردند",
    viewAll: "مشاهده همه",
    matchedBtn: "تطابق شد!",
    connectBtn: "ارتباط",
    petsOkShort: "حیوانات خانگی مجاز",
    noPetsShort: "بدون حیوان",
    trendingH2: "شهرهای محبوب",
    trendingP: "جایی که مردم مدرن در ۲۰۲۵ نقل مکان می‌کنند",
    activeListings: "آگهی فعال",
    testiH2: "محبوب هزاران نفر",
    testiReviews: "از بیش از ۱۲,۰۰۰ نظر",
    appH2a: "سفیرا در جیب شما.",
    appH2b: "هر جا. هر زمان.",
    appP: "اعلان‌های تطابق فوری، پیام‌رسانی در لحظه، و مرور آگهی‌ها در هر کجا.",
    appStoreLabel: "دانلود از:",
    appStoreName: "App Store",
    googlePlayLabel: "دریافت از:",
    googlePlayName: "Google Play",
    newMatch: "تطابق جدید!",
    likedProfile: "Emma W. پروفایل شما را لایک کرد",
    compatibility: "۹۷٪ سازگاری · ۲ دقیقه پیش",
    suggested: "پیشنهادی",
    footerDesc: "معتمدترین پلتفرم برای پیدا کردن هم‌خانه و اتاق. طراحی شده برای زندگی مدرن و بدون مرز.",
    footerLinks: [
      { title: "محصول",    links: ["پیدا کردن اتاق", "پیدا کردن هم‌خانه", "ثبت آگهی", "تطابق هوش مصنوعی", "پریمیوم"] },
      { title: "شرکت",     links: ["درباره ما", "وبلاگ", "مشاغل", "مطبوعات", "تماس"] },
      { title: "پشتیبانی", links: ["مرکز کمک", "امنیت", "شرایط استفاده", "حریم خصوصی", "کوکی‌ها"] },
    ],
    footerCopy: "۲۰۲۵ Sefira Technologies, Inc. تمامی حقوق محفوظ است.",
    footerLegal: ["شرایط استفاده", "حریم خصوصی", "کوکی‌ها"],
    ilanVer: "ثبت آگهی",
    ilanVerModal: "برای ثبت آگهی لطفاً وارد شوید یا ثبت نام کنید.",
    girisYap: "ورود",
    kayitOl: "ثبت نام",
    followTitle: "ما را دنبال کنید",
    followBtn: "دنبال کردن →",
    joinChannelBtn: "عضویت در کانال →",
    igDesc: "نکات انحصاری هم‌خانه و داستان‌های واقعی",
    tgDesc: "برای اعلان‌های فوری و پیشنهادات ویژه به کانال ما بپیوندید",
  },
  de: {
    navLinks: [
      { label: "Zimmer finden", href: "#" },
      { label: "Mitbewohner finden", href: "#" },
      { label: "Inserat aufgeben", href: "/create-listing" },
      { label: "Community", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "Verifizierte Nutzer" },
      { value: "52",    label: "Städte weltweit" },
      { value: "98%",   label: "Matching-Zufriedenheit" },
      { value: "4.9★",  label: "App-Bewertung" },
    ],
    signIn: "Anmelden",
    signOut: "Abmelden",
    getStarted: "Loslegen",
    heroBadge: "Von über 127.000 verifizierten Nutzern in 52 Städten vertraut",
    heroLine1: "Finde dein ideales",
    heroLine2: "Zuhause und deinen",
    heroLine3: "perfekten Mitbewohner.",
    heroP: "KI-gestütztes Mitbewohner-Matching trifft auf erstklassige WG-Suche. Entwickelt für Expats, Studierende und moderne Berufstätige.",
    wizardTitle: "Was suchen Sie?",
    optionSeekingTitle: "Ich habe ein Zimmer und suche einen guten Mitbewohner",
    optionSeekingSubtitle: "Ich habe ein Zimmer und suche einen guten Mitbewohner",
    optionOfferingTitle: "Ich suche ein Zimmer oder eine Wohnung",
    optionOfferingSubtitle: "Ich suche ein Zimmer oder eine Wohnung",
    genderStep: "Bevorzugtes Geschlecht des Mitbewohners",
    genderStepSub: "Bevorzugtes Geschlecht",
    genderMale: "Männlich",
    genderFemale: "Weiblich",
    genderAny: "Egal",
    budgetStep: "Monatliches Budget",
    budgetStepSub: "Ihr monatliches Budget",
    locationStep: "Wo suchen Sie?",
    locationStepSub: "Wo suchen Sie?",
    backBtn: "Zurück",
    nextBtn: "Weiter",
    searchNowBtn: "Jetzt suchen",
    seekingChip: "Suche Zimmer",
    offeringChip: "Biete Zimmer an",
    countryPlaceholder: "Land",
    cityPlaceholder: "Stadt",
    loadingText: "Wird geladen…",
    priorityGroupLabel: "⭐ Beliebte Ziele",
    allCountriesLabel: "Alle Länder",
    searchPlaceholder: "Stadt, Stadtteil oder Stichwort suchen...",
    matchesThisWeek: "2.847 Matches diese Woche",
    reviewsLabel: "4,9 Sterne aus über 12.000 Bewertungen",
    storiesTitle: "Community-Geschichten",
    storiesLive: "Live",
    addStory: "Geschichte hinzufügen",
    aiMatchBadge: "KI-gestütztes Matching",
    aiMatchLine1: "Ihr perfekter Match",
    aiMatchLine2: "findet Sie.",
    aiMatchP: "Unsere KI analysiert über 40 Kompatibilitätsfaktoren – vom Schlafrhythmus bis hin zu sozialen Gewohnheiten – und findet Menschen, mit denen Sie wirklich zusammenleben möchten.",
    compatBars: [
      { label: "Lebensstil-Kompatibilität", value: 97,  color: "from-blue-500 to-violet-600" },
      { label: "Schlafrhythmus",             value: 94,  color: "from-emerald-500 to-teal-600" },
      { label: "Sauberkeit",                 value: 100, color: "from-amber-500 to-orange-600" },
      { label: "Budgetrahmen",               value: 88,  color: "from-rose-500 to-pink-600" },
    ],
    findMatchesBtn: "Meine Matches finden",
    matchLabel: "Match",
    verifiedLabel: "Verifiziert",
    petsOk: "Haustiere erlaubt",
    noPets: "Keine Haustiere",
    smoker: "Raucher",
    nonSmoker: "Nichtraucher",
    skipBtn: "Überspringen",
    likeBtn: "Gefällt mir",
    featuredH2: "Empfohlene Inserate",
    featuredP: "Premium-verifizierte Zimmer und Wohnungen",
    listingFilterAll: "Alle",
    listingVerified: "Verifiziert",
    perMonth: "/Mo.",
    viewAllBtn: "Alle Inserate anzeigen",
    howH2: "Wie funktioniert Sefira?",
    howP: "Vom Profil zur Traumwohnung in unter 48 Stunden.",
    howItWorks: [
      { step: "01", title: "Profil erstellen",      desc: "Erzählen Sie uns von Ihrem Lebensstil, Budget und Ihrer Persönlichkeit. Unsere KI lernt, was Sie einzigartig macht.",                       icon: "✦", gradient: "from-blue-500 to-indigo-600" },
      { step: "02", title: "KI-Matches erhalten",   desc: "Über 40 Kompatibilitätsfaktoren sofort analysiert. Ihr perfekter Mitbewohner ist näher als Sie denken.",                                  icon: "◈", gradient: "from-violet-500 to-purple-600" },
      { step: "03", title: "Wischen und verbinden", desc: "Gefällt mir, matchen und schreiben. Per Video verifizieren, bevor Sie sich festlegen.",                                                     icon: "◎", gradient: "from-pink-500 to-rose-600" },
      { step: "04", title: "Einziehen",             desc: "Digital unterzeichnen, Community-Support erhalten und in Ihr Traumzuhause einziehen.",                                                     icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
    ],
    roommatesH2: "Top-Matches in Ihrer Nähe",
    roommatesP: "Menschen, die jetzt in Berlin einen Mitbewohner suchen",
    viewAll: "Alle anzeigen",
    matchedBtn: "Gematcht!",
    connectBtn: "Verbinden",
    petsOkShort: "Haustiere erlaubt",
    noPetsShort: "Keine Haustiere",
    trendingH2: "Angesagte Städte",
    trendingP: "Wohin moderne Menschen 2025 ziehen",
    activeListings: "aktive Inserate",
    testiH2: "Von Tausenden geliebt",
    testiReviews: "aus über 12.000 Bewertungen",
    appH2a: "Sefira in Ihrer Tasche.",
    appH2b: "Überall. Jederzeit.",
    appP: "Sofortige Match-Benachrichtigungen, Echtzeit-Messaging und Inserate durchscrollen – immer und überall.",
    appStoreLabel: "Herunterladen im",
    appStoreName: "App Store",
    googlePlayLabel: "Jetzt bei",
    googlePlayName: "Google Play",
    newMatch: "Neuer Match!",
    likedProfile: "Emma W. hat Ihr Profil geliked",
    compatibility: "97 % Kompatibilität · vor 2 Minuten",
    suggested: "Vorgeschlagen",
    footerDesc: "Die vertrauenswürdigste Plattform für die Suche nach Mitbewohnern und Zimmern. Für modernes, grenzenloses Wohnen entwickelt.",
    footerLinks: [
      { title: "Produkt",    links: ["Zimmer finden", "Mitbewohner finden", "Inserat aufgeben", "KI-Matching", "Premium"] },
      { title: "Unternehmen", links: ["Über uns", "Blog", "Karriere", "Presse", "Kontakt"] },
      { title: "Support",    links: ["Hilfe-Center", "Sicherheit", "Nutzungsbedingungen", "Datenschutz", "Cookies"] },
    ],
    footerCopy: "2025 Sefira Technologies, Inc. Alle Rechte vorbehalten.",
    footerLegal: ["Nutzungsbedingungen", "Datenschutz", "Cookies"],
    ilanVer: "Inserat aufgeben",
    ilanVerModal: "Bitte melden Sie sich an oder registrieren Sie sich, um ein Inserat aufzugeben.",
    girisYap: "Anmelden",
    kayitOl: "Registrieren",
    followTitle: "Folge uns",
    followBtn: "Folgen →",
    joinChannelBtn: "Kanal beitreten →",
    igDesc: "Exklusive Mitbewohner-Tipps und echte Match-Geschichten",
    tgDesc: "Tritt unserem Kanal bei für Benachrichtigungen und Sonderangebote",
  },
  // Always add "ar" key when adding new translations
  ar: {
    navLinks: [
      { label: "البحث عن غرفة", href: "#" },
      { label: "البحث عن شريك سكن", href: "#" },
      { label: "نشر إعلان", href: "/create-listing" },
      { label: "المجتمع", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "مستخدم موثَّق" },
      { value: "52",    label: "مدينة حول العالم" },
      { value: "98%",   label: "رضا عن المطابقة" },
      { value: "4.9★",  label: "تقييم التطبيق" },
    ],
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    getStarted: "ابدأ الآن",
    heroBadge: "موثوق به من قِبَل أكثر من ١٢٧,٠٠٠ مستخدم موثَّق في ٥٢ مدينة",
    heroLine1: "اعثر على",
    heroLine2: "شريك السكن",
    heroLine3: "المثالي.",
    heroP: "مطابقة ذكية لشركاء السكن واكتشاف إعلانات المشاركة المميزة. مصمَّم للمغتربين والطلاب والمحترفين العصريين.",
    // ── Wizard ──
    wizardTitle: "ماذا تبحث عن؟",
    optionSeekingTitle: "لدي غرفة وأبحث عن شريك سكن جيد",
    optionSeekingSubtitle: "لدي غرفة وأبحث عن شريك سكن جيد",
    optionOfferingTitle: "لا أملك غرفة، أبحث عن منزل أو غرفة",
    optionOfferingSubtitle: "لا أملك غرفة، أبحث عن منزل أو غرفة",
    genderStep: "الجنس المفضَّل لشريك السكن",
    genderStepSub: "الجنس المفضَّل",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    genderAny: "لا يهمني",
    budgetStep: "الميزانية الشهرية",
    budgetStepSub: "ميزانيتك الشهرية",
    locationStep: "أين تبحث؟",
    locationStepSub: "أين تبحث؟",
    backBtn: "رجوع",
    nextBtn: "التالي",
    searchNowBtn: "ابحث الآن",
    seekingChip: "يبحث عن غرفة",
    offeringChip: "يعرض غرفة",
    countryPlaceholder: "البلد",
    cityPlaceholder: "المدينة",
    loadingText: "جارٍ التحميل…",
    priorityGroupLabel: "⭐ الوجهات المميزة",
    allCountriesLabel: "جميع الدول",
    searchPlaceholder: "ابحث عن مدينة أو حي أو كلمة مفتاحية...",
    matchesThisWeek: "٢,٨٤٧ مطابقة هذا الأسبوع",
    reviewsLabel: "٤.٩ نجوم من أكثر من ١٢,٠٠٠ تقييم",
    storiesTitle: "قصص المجتمع",
    storiesLive: "مباشر",
    addStory: "إضافة قصة",
    aiMatchBadge: "مطابقة بالذكاء الاصطناعي",
    aiMatchLine1: "توأمك المثالي",
    aiMatchLine2: "يجدك.",
    aiMatchP: "يحلّل ذكاؤنا الاصطناعي أكثر من ٤٠ عاملاً للتوافق، من جداول النوم إلى العادات الاجتماعية، ليُبرز الأشخاص الذين ستودّ حقاً العيش معهم.",
    compatBars: [
      { label: "توافق أسلوب الحياة", value: 97,  color: "from-blue-500 to-violet-600" },
      { label: "جدول النوم",          value: 94,  color: "from-emerald-500 to-teal-600" },
      { label: "النظافة",             value: 100, color: "from-amber-500 to-orange-600" },
      { label: "نطاق الميزانية",      value: 88,  color: "from-rose-500 to-pink-600" },
    ],
    findMatchesBtn: "ابحث عن مطابقاتي",
    matchLabel: "توافق",
    verifiedLabel: "موثَّق",
    petsOk: "الحيوانات الأليفة مسموح بها",
    noPets: "لا حيوانات أليفة",
    smoker: "مدخِّن",
    nonSmoker: "غير مدخِّن",
    skipBtn: "تخطَّ",
    likeBtn: "إعجاب",
    featuredH2: "الإعلانات المميزة",
    featuredP: "غرف وشقق مميزة موثَّقة",
    listingFilterAll: "الكل",
    listingVerified: "موثَّق",
    perMonth: "/شهر",
    viewAllBtn: "عرض جميع الإعلانات",
    howH2: "كيف تعمل سفيرا؟",
    howP: "من الملف الشخصي إلى المنزل المثالي في أقل من ٤٨ ساعة.",
    howItWorks: [
      { step: "٠١", title: "أنشئ ملفك الشخصي",      desc: "أخبرنا عن أسلوب حياتك وميزانيتك وشخصيتك. يتعلّم ذكاؤنا الاصطناعي ما يجعلك فريداً.",                                    icon: "✦", gradient: "from-blue-500 to-indigo-600" },
      { step: "٠٢", title: "مطابقات بالذكاء الاصطناعي", desc: "تحليل فوري لأكثر من ٤٠ عامل توافق. شريك السكن المثالي أقرب مما تتصوّر.",                                           icon: "◈", gradient: "from-violet-500 to-purple-600" },
      { step: "٠٣", title: "تصفَّح وتواصَل",           desc: "أعجب وطابق وراسِل. تحقَّق بالفيديو قبل أي التزام.",                                                                    icon: "◎", gradient: "from-pink-500 to-rose-600" },
      { step: "٠٤", title: "انتقل للسكن",              desc: "وقِّع رقمياً، واحصل على دعم المجتمع، واستقرّ في منزلك المثالي.",                                                       icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
    ],
    roommatesH2: "أفضل المطابقات بالقرب منك",
    roommatesP: "أشخاص يبحثون عن شريك سكن في برلين الآن",
    viewAll: "عرض الكل",
    matchedBtn: "تمّت المطابقة!",
    connectBtn: "تواصَل",
    petsOkShort: "الحيوانات الأليفة مسموح بها",
    noPetsShort: "لا حيوانات",
    trendingH2: "المدن الرائجة",
    trendingP: "أين ينتقل الناس المعاصرون في ٢٠٢٥",
    activeListings: "إعلان نشط",
    testiH2: "يحبّه الآلاف",
    testiReviews: "من أكثر من ١٢,٠٠٠ تقييم",
    appH2a: "سفيرا في جيبك.",
    appH2b: "في أي مكان. في أي وقت.",
    appP: "إشعارات فورية للمطابقات، ومراسلة في الوقت الحقيقي، وتصفُّح الإعلانات أينما كنت.",
    appStoreLabel: "حمِّل من:",
    appStoreName: "App Store",
    googlePlayLabel: "احصل عليه من:",
    googlePlayName: "Google Play",
    newMatch: "مطابقة جديدة!",
    likedProfile: "أعجبت Emma W. بملفك الشخصي",
    compatibility: "توافق ٩٧٪ · منذ دقيقتين",
    suggested: "مقترَح",
    footerDesc: "المنصة الأكثر ثقةً للعثور على شركاء السكن والغرف. مصمَّمة للمعيشة العصرية عبر الحدود.",
    footerLinks: [
      { title: "المنتج",  links: ["البحث عن غرفة", "البحث عن شريك سكن", "نشر إعلان", "المطابقة بالذكاء الاصطناعي", "بريميوم"] },
      { title: "الشركة",  links: ["من نحن", "المدوّنة", "الوظائف", "الصحافة", "اتصل بنا"] },
      { title: "الدعم",   links: ["مركز المساعدة", "الأمان", "شروط الاستخدام", "الخصوصية", "ملفات تعريف الارتباط"] },
    ],
    footerCopy: "٢٠٢٥ Sefira Technologies, Inc. جميع الحقوق محفوظة.",
    footerLegal: ["شروط الاستخدام", "الخصوصية", "ملفات تعريف الارتباط"],
    ilanVer: "نشر إعلان",
    ilanVerModal: "يرجى تسجيل الدخول أو التسجيل لنشر إعلان.",
    girisYap: "تسجيل الدخول",
    kayitOl: "إنشاء حساب",
    followTitle: "تابعنا",
    followBtn: "تابع →",
    joinChannelBtn: "انضم إلى القناة →",
    igDesc: "نصائح حصرية لشركاء السكن وقصص تطابق حقيقية",
    tgDesc: "انضم إلى قناتنا للإشعارات الفورية والعروض الخاصة",
  },
  ru: {
    navLinks: [
      { label: "Главная", href: "#" },
      { label: "Объявления", href: "#" },
      { label: "Как это работает", href: "#" },
      { label: "Отзывы", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "Активных пользователей" },
      { value: "52",    label: "Успешных совпадений" },
      { value: "98%",   label: "Городов" },
      { value: "4.9★",  label: "Отзывов" },
    ],
    signIn: "Войти",
    signOut: "Выйти",
    getStarted: "Начать",
    heroBadge: "Поиск соседей по комнате",
    heroLine1: "Найди своего",
    heroLine2: "идеального",
    heroLine3: "соседа",
    heroP: "Найди надёжного соседа по комнате или идеальное жильё. Безопасно, быстро и удобно.",
    wizardTitle: "Что вы ищете?",
    optionSeekingTitle: "У меня есть комната, ищу хорошего соседа",
    optionSeekingSubtitle: "У меня есть комната, ищу хорошего соседа",
    optionOfferingTitle: "Ищу комнату или квартиру",
    optionOfferingSubtitle: "Ищу комнату или квартиру",
    genderStep: "Предпочтение по полу",
    genderStepSub: "Какой пол соседа вы предпочитаете?",
    genderMale: "Мужской",
    genderFemale: "Женский",
    genderAny: "Не важно",
    budgetStep: "Ваш бюджет",
    budgetStepSub: "Какой у вас ежемесячный бюджет?",
    locationStep: "Местоположение",
    locationStepSub: "Где вы ищете жильё?",
    backBtn: "Назад",
    nextBtn: "Далее",
    searchNowBtn: "Найти сейчас",
    seekingChip: "Ищу жильё",
    offeringChip: "Сдаю жильё",
    countryPlaceholder: "Выберите страну",
    cityPlaceholder: "Введите город",
    loadingText: "Загрузка...",
    priorityGroupLabel: "Популярные страны",
    allCountriesLabel: "Все страны",
    searchPlaceholder: "Поиск...",
    matchesThisWeek: "совпадений на этой неделе",
    reviewsLabel: "отзывов",
    storiesTitle: "Истории",
    storiesLive: "Прямой эфир",
    addStory: "Добавить историю",
    aiMatchBadge: "ИИ подбор",
    aiMatchLine1: "Умный",
    aiMatchLine2: "подбор соседей",
    aiMatchP: "Наш ИИ анализирует ваши предпочтения и находит идеальных соседей.",
    compatBars: [
      { label: "Образ жизни", value: 97,  color: "from-blue-500 to-violet-600" },
      { label: "Расписание",  value: 94,  color: "from-emerald-500 to-teal-600" },
      { label: "Чистота",     value: 100, color: "from-amber-500 to-orange-600" },
      { label: "Бюджет",      value: 88,  color: "from-rose-500 to-pink-600" },
    ],
    findMatchesBtn: "Найти совпадения",
    matchLabel: "Совпадение",
    verifiedLabel: "Проверено",
    petsOk: "Животные разрешены",
    noPets: "Без животных",
    smoker: "Курящий",
    nonSmoker: "Некурящий",
    skipBtn: "Пропустить",
    likeBtn: "Нравится",
    featuredH2: "Рекомендуемые объявления",
    featuredP: "Проверенные и популярные объявления",
    listingFilterAll: "Все",
    listingVerified: "Проверено",
    perMonth: "/месяц",
    viewAllBtn: "Смотреть все",
    howH2: "Как это работает",
    howP: "Найти соседа по комнате легко за 3 шага",
    howItWorks: [
      { step: "01", title: "Создайте профиль",    desc: "Расскажите о себе и своих предпочтениях",         icon: "✦", gradient: "from-blue-500 to-indigo-600" },
      { step: "02", title: "Найдите совпадения",  desc: "Наш ИИ подберёт подходящих соседей",              icon: "◈", gradient: "from-violet-500 to-purple-600" },
      { step: "03", title: "Свяжитесь",           desc: "Общайтесь и договаривайтесь о встрече",           icon: "◎", gradient: "from-pink-500 to-rose-600" },
      { step: "04", title: "Въезжайте",           desc: "Подпишите договор и обустраивайтесь в новом доме", icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
    ],
    roommatesH2: "Активные пользователи",
    roommatesP: "Люди, которые ищут соседей прямо сейчас",
    viewAll: "Смотреть всех",
    matchedBtn: "Совпадение!",
    connectBtn: "Связаться",
    petsOkShort: "Животные ✓",
    noPetsShort: "Без животных",
    trendingH2: "Популярные объявления",
    trendingP: "Самые просматриваемые объявления этой недели",
    activeListings: "Активные объявления",
    testiH2: "Отзывы пользователей",
    testiReviews: "отзывов",
    appH2a: "Скачайте",
    appH2b: "приложение",
    appP: "Ищите соседей в любое время и в любом месте",
    appStoreLabel: "Скачать в",
    appStoreName: "App Store",
    googlePlayLabel: "Доступно в",
    googlePlayName: "Google Play",
    newMatch: "Новое совпадение",
    likedProfile: "оценил ваш профиль",
    compatibility: "Совместимость",
    suggested: "Рекомендуется",
    footerDesc: "Лучшая платформа для поиска соседей по комнате",
    footerLinks: [
      { title: "Продукт",   links: ["Найти комнату", "Найти соседа", "Разместить объявление", "ИИ подбор", "Премиум"] },
      { title: "Компания",  links: ["О нас", "Блог", "Карьера", "Пресса", "Контакты"] },
      { title: "Поддержка", links: ["Центр помощи", "Безопасность", "Условия", "Конфиденциальность", "Cookies"] },
    ],
    footerCopy: "Все права защищены",
    footerLegal: ["Политика конфиденциальности", "Условия использования", "Cookies"],
    ilanVer: "+ Разместить объявление",
    ilanVerModal: "Разместить объявление",
    girisYap: "Войти",
    kayitOl: "Регистрация",
    followTitle: "Следите за нами",
    followBtn: "Подписаться →",
    joinChannelBtn: "Вступить в канал →",
    igDesc: "Советы по поиску соседей и реальные истории",
    tgDesc: "Присоединяйтесь к каналу для уведомлений и спецпредложений",
  },
};
type Lang = keyof typeof translations;

// ─── Static structural data ───────────────────────────────────────────────────
const stories = [
  { id: 1, name: "Add Story", isAdd: true,  gradient: "from-stone-200 to-stone-300",    initials: "+",  city: "",       online: false },
  { id: 2, name: "Sarah K.", isAdd: false, gradient: "from-pink-500 to-rose-600",      initials: "SK", city: "Berlin", online: true  },
  { id: 3, name: "Ahmed M.", isAdd: false, gradient: "from-blue-500 to-indigo-600",    initials: "AM", city: "Dubai",  online: true  },
  { id: 4, name: "Yuki T.",  isAdd: false, gradient: "from-violet-500 to-purple-600",  initials: "YT", city: "Tokyo",  online: false },
  { id: 5, name: "Maria L.", isAdd: false, gradient: "from-amber-500 to-orange-600",   initials: "ML", city: "BCN",    online: true  },
  { id: 6, name: "James W.", isAdd: false, gradient: "from-emerald-500 to-teal-600",   initials: "JW", city: "London", online: false },
  { id: 7, name: "Priya S.", isAdd: false, gradient: "from-rose-500 to-pink-600",      initials: "PS", city: "Mumbai", online: true  },
  { id: 8, name: "Carlos R.",isAdd: false, gradient: "from-cyan-500 to-blue-600",      initials: "CR", city: "Madrid", online: true  },
  { id: 9, name: "Lena M.",  isAdd: false, gradient: "from-purple-500 to-violet-600",  initials: "LM", city: "Paris",  online: false },
];

const matchProfiles = [
  {
    id: 1, name: "Emma Wilson", age: 26, occupation: "UX Designer", nationality: "British",
    match: 97, city: "Berlin", gradient: "from-violet-600 via-purple-700 to-indigo-800",
    initials: "EW", lifestyle: ["Night owl", "Minimalist", "Yoga"],
    bio: "Creative designer looking for a quiet, tidy flatmate who appreciates good aesthetics.",
    bioTr: "Sessiz, düzenli ve estetiği önemseyen bir ev arkadaşı arayan yaratıcı tasarımcı.",
    bioFa: "طراح خلاق به دنبال هم‌خانه‌ای آرام و مرتب که زیبایی‌شناسی خوب را ارزشمند بداند.",
    bioAr: "مصمّمة مبدعة تبحث عن شريك سكن هادئ ومنظَّم يقدّر الذوق الجمالي الرفيع.",
    verified: true, pets: false, smoking: false, budget: "700-1000",
  },
  {
    id: 2, name: "Kai Tanaka", age: 29, occupation: "Software Engineer", nationality: "Japanese",
    match: 94, city: "Berlin", gradient: "from-cyan-600 via-blue-700 to-indigo-800",
    initials: "KT", lifestyle: ["Early bird", "Gamer", "Coffee lover"],
    bio: "Remote dev who values clean spaces and good coffee. Lets build a calm, focused home.",
    bioTr: "Temiz alanları ve güzel kahveyi önemseyen uzaktan geliştirici. Sakin, odaklı bir ev kuralım.",
    bioFa: "توسعه‌دهنده از راه دور که فضاهای تمیز و قهوه خوب را می‌پسندد. بیایید خانه‌ای آرام و متمرکز بسازیم.",
    bioAr: "مطوّر عن بُعد يقدّر المساحات النظيفة والقهوة الجيدة. لنبني معاً بيتاً هادئاً ومركَّزاً.",
    verified: true, pets: true, smoking: false, budget: "800-1100",
  },
  {
    id: 3, name: "Sofia Ramirez", age: 24, occupation: "Medical Student", nationality: "Spanish",
    match: 91, city: "Berlin", gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    initials: "SR", lifestyle: ["Student", "Active", "Social"],
    bio: "Med student, tidy and friendly. Latin music on weekends, focused on weeknights.",
    bioTr: "Tıp öğrencisi, düzenli ve arkadaş canlısı. Hafta sonları Latin müzik, hafta içi çalışma modu.",
    bioFa: "دانشجوی پزشکی، مرتب و دوستانه. آخر هفته‌ها موسیقی لاتین، شب‌های هفته مطالعه.",
    bioAr: "طالبة طب، منظَّمة وودودة. موسيقى لاتينية في عطل نهاية الأسبوع، تركيز تام في أيام الدراسة.",
    verified: false, pets: false, smoking: false, budget: "500-750",
  },
];

const HELP_CENTER_TEXTS = new Set([
  "Yardım Merkezi", "Help Center", "Hilfe-Center",
  "مرکز کمک", "مركز المساعدة", "Центр помощи",
]);

const MATCH_PHOTOS = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/90.jpg",
  "https://randomuser.me/api/portraits/men/15.jpg",
];

const listings = [
  {
    id: 1, title: "Modern Studio near Alexanderplatz", city: "Berlin", country: "Germany",
    price: 850, sym: "EUR" as const, rating: 4.9, reviews: 127, type: "Private Room",
    available: "Jun 1", gradient: "from-blue-600 via-indigo-700 to-violet-800",
    verified: true, amenities: ["WiFi", "Gym", "Balcony"], tag: "Most Popular",
    tagColor: "from-blue-500 to-indigo-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2, title: "Luxury Sea-View Apartment", city: "Dubai", country: "UAE",
    price: 1200, sym: "USD" as const, rating: 4.8, reviews: 89, type: "Entire Flat",
    available: "Now", gradient: "from-amber-500 via-orange-600 to-rose-700",
    verified: true, amenities: ["Pool", "Gym", "Concierge"], tag: "New",
    tagColor: "from-amber-500 to-orange-600", gender: "Male",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3, title: "Charming Room near Bosphorus", city: "Istanbul", country: "Turkey",
    price: 450, sym: "USD" as const, rating: 4.7, reviews: 204, type: "Private Room",
    available: "May 25", gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    verified: false, amenities: ["WiFi", "Kitchen", "Sea View"], tag: "Best Value",
    tagColor: "from-emerald-500 to-teal-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4, title: "Designer Loft in Eixample", city: "Barcelona", country: "Spain",
    price: 780, sym: "EUR" as const, rating: 5.0, reviews: 56, type: "Private Room",
    available: "Jun 15", gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    verified: true, amenities: ["WiFi", "Rooftop", "A/C"], tag: "Top Rated",
    tagColor: "from-rose-500 to-pink-600", gender: "Female",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5, title: "Cozy Flat in Shoreditch", city: "London", country: "United Kingdom",
    price: 1100, sym: "EUR" as const, rating: 4.8, reviews: 73, type: "Private Room",
    available: "Now", gradient: "from-indigo-500 via-blue-600 to-sky-700",
    verified: true, amenities: ["WiFi", "Garden", "Desk"], tag: "New",
    tagColor: "from-indigo-500 to-blue-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6, title: "Canal-Side Studio, Jordaan", city: "Amsterdam", country: "Netherlands",
    price: 920, sym: "EUR" as const, rating: 4.9, reviews: 112, type: "Studio",
    available: "Jun 5", gradient: "from-red-500 via-rose-600 to-pink-700",
    verified: true, amenities: ["WiFi", "Bike", "Terrace"], tag: "Most Popular",
    tagColor: "from-red-500 to-rose-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7, title: "Bright Room in Le Marais", city: "Paris", country: "France",
    price: 990, sym: "EUR" as const, rating: 4.7, reviews: 88, type: "Private Room",
    available: "Jun 10", gradient: "from-violet-500 via-purple-600 to-fuchsia-700",
    verified: false, amenities: ["WiFi", "A/C", "Metro"], tag: "Best Value",
    tagColor: "from-violet-500 to-purple-600", gender: "Female",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8, title: "Trastevere Apartment with Terrace", city: "Rome", country: "Italy",
    price: 720, sym: "EUR" as const, rating: 4.8, reviews: 61, type: "Entire Flat",
    available: "Now", gradient: "from-orange-500 via-amber-600 to-yellow-600",
    verified: true, amenities: ["WiFi", "Terrace", "Kitchen"], tag: "Top Rated",
    tagColor: "from-orange-500 to-amber-500", gender: "Any",
    image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 9, title: "Minimalist Room in Alfama", city: "Lisbon", country: "Portugal",
    price: 580, sym: "EUR" as const, rating: 4.6, reviews: 95, type: "Private Room",
    available: "Jun 20", gradient: "from-teal-500 via-cyan-600 to-sky-700",
    verified: true, amenities: ["WiFi", "Balcony", "Tram"], tag: "New",
    tagColor: "from-teal-500 to-cyan-600", gender: "Male",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 10, title: "Elegant Room in 1st District", city: "Vienna", country: "Austria",
    price: 860, sym: "EUR" as const, rating: 4.9, reviews: 44, type: "Private Room",
    available: "Now", gradient: "from-slate-500 via-gray-600 to-zinc-700",
    verified: true, amenities: ["WiFi", "Piano", "Library"], tag: "Most Popular",
    tagColor: "from-slate-500 to-gray-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 11, title: "Studio in Beyoğlu Art District", city: "Istanbul", country: "Turkey",
    price: 380, sym: "USD" as const, rating: 4.7, reviews: 138, type: "Studio",
    available: "Jun 8", gradient: "from-cyan-500 via-teal-600 to-emerald-700",
    verified: false, amenities: ["WiFi", "Kitchen", "Art"], tag: "Best Value",
    tagColor: "from-cyan-500 to-teal-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12, title: "Penthouse Suite, Downtown Dubai", city: "Dubai", country: "UAE",
    price: 1800, sym: "USD" as const, rating: 5.0, reviews: 29, type: "Entire Flat",
    available: "Now", gradient: "from-yellow-500 via-amber-500 to-orange-600",
    verified: true, amenities: ["Pool", "Gym", "Valet"], tag: "Top Rated",
    tagColor: "from-yellow-500 to-orange-500", gender: "Any",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
];

const trendingCities = [
  { name: "Istanbul",  country: "Turkey",      listings: "2,847", growth: "+23%", glow: "bg-orange-500/10", border: "border-orange-500/20", emoji: "🕌" },
  { name: "Berlin",    country: "Germany",     listings: "1,923", growth: "+18%", glow: "bg-blue-500/10",   border: "border-blue-500/20",   emoji: "🐻" },
  { name: "Dubai",     country: "UAE",         listings: "1,456", growth: "+31%", glow: "bg-amber-500/10",  border: "border-amber-500/20",  emoji: "🏙️" },
  { name: "Barcelona", country: "Spain",       listings: "1,234", growth: "+15%", glow: "bg-yellow-500/10", border: "border-yellow-500/20", emoji: "🏖️" },
  { name: "Amsterdam", country: "Netherlands", listings: "987",   growth: "+12%", glow: "bg-red-500/10",    border: "border-red-500/20",    emoji: "🚲" },
  { name: "London",    country: "UK",          listings: "3,201", growth: "+8%",  glow: "bg-indigo-500/10", border: "border-indigo-500/20", emoji: "🎡" },
];



const PRIORITY_COUNTRIES = [
  "Turkey", "Germany", "United States", "Spain", "Brazil",
  "Italy", "France", "United Arab Emirates", "South Korea",
];

const PRIORITY_CITIES: Record<string, string[]> = {
  "Turkey":               ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana"],
  "Germany":              ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"],
  "United States":        ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco"],
  "Spain":                ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Malaga"],
  "Brazil":               ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Curitiba"],
  "Italy":                ["Rome", "Milan", "Naples", "Turin", "Florence", "Bologna"],
  "France":               ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Bordeaux"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Al Ain"],
  "South Korea":          ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju"],
};

// ─── Russian label lookups (static demo data that bypasses the t object) ──────
const TAG_RU: Record<string, string> = {
  "Most Popular": "Самый популярный",
  "New":          "Новый",
  "Best Value":   "Лучшая цена",
  "Top Rated":    "Лучший рейтинг",
  "Featured":     "Рекомендуем",
};
const COUNTRY_RU: Record<string, string> = {
  "Germany": "Германия",
  "UAE":     "ОАЭ",
  "Turkey":  "Турция",
  "Spain":   "Испания",
  "France":  "Франция",
  "UK":      "Великобритания",
};

// ─── Wizard types ─────────────────────────────────────────────────────────────
type WizardMode = "seeking" | "offering" | null;
type GenderPref = "male" | "female" | "any";

// ─── Weekly Stories type ───────────────────────────────────────────────────────
interface WeeklyStory {
  id: string;
  image_url: string;
  caption: string | null;
  week_label: string | null;
  created_at: string;
  views: number;
}

export default function Home() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, signOut: handleSignOut } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showListingModal, setShowListingModal] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showLangTooltip, setShowLangTooltip] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Lock body scroll when profile drawer is open ──────────────────────────
  useEffect(() => {
    if (profileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [profileMenuOpen]);

  // ── Lang tooltip (one-time first-visit hint) ─────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('lang_tooltip_shown')) return;
    const timer = setTimeout(() => {
      setShowLangTooltip(true);
      localStorage.setItem('lang_tooltip_shown', 'true');
      setTimeout(() => setShowLangTooltip(false), 4000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── WelcomePopup → openAuthModal event ───────────────────────────────────
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setAuthTab(e.detail?.tab || 'register')
      setShowAuth(true)
    }
    window.addEventListener('openAuthModal', handler as EventListener)
    return () => window.removeEventListener('openAuthModal', handler as EventListener)
  }, [])

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target as Node)) {
        setCurrencyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Stay message popup (shown after user cancels account deletion) ────────
  const [showStayMessage, setShowStayMessage] = useState(false);
  const [stayMessageVisible, setStayMessageVisible] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("show_stay_message") === "true") {
      localStorage.removeItem("show_stay_message");
      setShowStayMessage(true);
      requestAnimationFrame(() => setStayMessageVisible(true));
    }
  }, []);

  // ── Onboarding flow ───────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingMissing, setOnboardingMissing] = useState({
    displayName: false, birthDate: false, gender: false, country: false, photo: false,
  });
  useEffect(() => {
    if (!user) { setShowOnboarding(false); return; }
    const timer = setTimeout(() => {
      supabase
        .from("profiles")
        .select("display_name, birth_date, gender, country, avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          const missing = {
            displayName: !data?.display_name,
            birthDate:   !data?.birth_date,
            gender:      !data?.gender,
            country:     !data?.country,
            photo:       !data?.avatar_url,
          };
          if (Object.values(missing).some(Boolean)) {
            setOnboardingMissing(missing);
            setShowOnboarding(true);
            setShowWelcomeToast(false);
          }
        });
    }, 10000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Welcome modal ─────────────────────────────────────────────────────────
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const prevUserRef = useRef<typeof user | undefined>(undefined);
  useEffect(() => {
    if (prevUserRef.current === undefined) { prevUserRef.current = user; return; }
    if (!prevUserRef.current && user) {
      const lastShown = localStorage.getItem("sefira-last-welcome");
      const now = Date.now();
      if (!lastShown || now - parseInt(lastShown) > 3_600_000) {
        setShowWelcomeToast(true);
        localStorage.setItem("sefira-last-welcome", now.toString());
      }
      prevUserRef.current = user;
      return;
    }
    prevUserRef.current = user;
  }, [user]);

  // ── Profile avatar fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setProfileAvatarUrl(null); return; }
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfileAvatarUrl(data?.avatar_url ?? null));
  }, [user]);

  // ── Existing state ────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState("all");
  const [likedListings, setLikedListings] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [lang, setLang] = useState<Lang>("tr");
  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang") as Lang | null;
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar" || saved === "de" || saved === "ru") setLang(saved);
  }, []);
  useEffect(() => { localStorage.setItem("sefira-lang", lang); }, [lang]);
  useEffect(() => {
    const handler = (e: CustomEvent) => { setLang(e.detail as Lang); };
    window.addEventListener('languageChanged', handler as EventListener);
    return () => window.removeEventListener('languageChanged', handler as EventListener);
  }, []);

  // ── Unread messages badge ─────────────────────────────────────────────────
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  useEffect(() => {
    if (!user) { setUnreadSupportCount(0); return; }
    supabase
      .from("admin_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("sender", "admin")
      .eq("is_read", false)
      .then(({ count }) => setUnreadSupportCount(count ?? 0));
  }, [user?.id, profileMenuOpen]);

  // ── Currency ──────────────────────────────────────────────────────────────
  const [currency, setCurrency] = useState<Currency>("USD");
  const sym = CURRENCY_SYMBOLS[currency];

  // ── Live exchange rates ────────────────────────────────────────────────────
  // fetchLiveRates() patches CURRENCY_RATES in-place; the state bump forces
  // a re-render so every conversion call picks up the real values.
  const [, setRatesReady] = useState(false);
  useEffect(() => {
    fetchLiveRates()
      .then(() => setRatesReady(true))
      .catch(() => {});
  }, []);

  // ── Wizard ────────────────────────────────────────────────────────────────
  const [wizardMode, setWizardMode] = useState<WizardMode>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [genderPref, setGenderPref] = useState<GenderPref>("any");
  const [budgetUSD, setBudgetUSD] = useState(800);

  // ── Weekly Stories ────────────────────────────────────────────────────────
  const [weeklyStories, setWeeklyStories] = useState<WeeklyStory[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  useEffect(() => {
    (async () => {
      const { data: stories, error: storiesError } = await supabase
        .from("weekly_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      console.log("Stories:", stories?.length, storiesError?.message);
      if (stories) setWeeklyStories(stories);
    })();
  }, []);

  // ── Story viewer navigation helpers ──────────────────────────────────────
  const trackView = async (storyId: string) => {
    if (!storyId) return;
    const viewKey = `viewed_${storyId}`;
    if (sessionStorage.getItem(viewKey)) {
      console.log("Already viewed:", storyId);
      return;
    }
    try {
      const res = await fetch("/api/stories/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      const data = await res.json();
      console.log("View tracked for", storyId, ":", data);
      sessionStorage.setItem(viewKey, "true");
    } catch (e) {
      console.error("trackView error:", e);
    }
  };

  const openStory = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
    trackView(weeklyStories[index].id);
  };

  const goToNext = () => {
    const next = viewerIndex + 1;
    if (next < weeklyStories.length) {
      setViewerIndex(next);
      trackView(weeklyStories[next].id);
    } else {
      setViewerOpen(false);
    }
  };

  const goToPrev = () => {
    const prev = viewerIndex - 1;
    if (prev >= 0) {
      setViewerIndex(prev);
      trackView(weeklyStories[prev].id);
    }
  };

  // ── Story viewer keyboard navigation ─────────────────────────────────────
  useEffect(() => {
    if (!viewerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerOpen(false);
      else if (e.key === "ArrowLeft") goToPrev();
      else if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // viewerIndex in deps so goToNext/goToPrev close over the current index
  }, [viewerOpen, viewerIndex, weeklyStories.length]);

  const t = translations[lang];

  const [savedProfiles,  setSavedProfiles]  = useState<number[]>([]);
  const [animatingIds,   setAnimatingIds]   = useState<number[]>([]);

  const toggleListing = (id: number) =>
    setLikedListings((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleSave = (id: number) => {
    setSavedProfiles((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setAnimatingIds((p) => [...p, id]);
    setTimeout(() => setAnimatingIds((p) => p.filter((x) => x !== id)), 420);
  };

  const handleCreateListing = () => {
    if (user) router.push("/create-listing");
    else setShowListingModal(true);
  };

  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries")
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) {
          setCountries(data.data.map((c: { country: string }) => c.country).sort());
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCountry) { setCities([]); setSelectedCity(""); return; }
    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: selectedCountry }),
    })
      .then((r) => r.json())
      .then((data) => { if (data?.data) setCities(data.data); })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedCountry]);

  const sliderPct = ((budgetUSD - 100) / 4900) * 100;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden" dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}>

      {/* ── NAVBAR ────────────────────────────────────────────────────────────── */}
      <nav
        dir="ltr"
        style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform" }}
        className={`fixed top-0 left-0 right-0 w-full z-[9999] transition-all duration-300 ${scrolled ? "bg-white border-b border-stone-200 shadow-md shadow-stone-900/6" : "bg-white border-b border-stone-100 shadow-none"}`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 group cursor-pointer">
            <Image
              src="/images/sefira-logo.png"
              alt="Sefira"
              width={36}
              height={36}
              className="rounded-xl object-contain"
            />
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Sefira
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-7">
            {t.navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full">
                {l.label}
              </a>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

            {/* Currency switcher */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                onClick={() => { setCurrencyMenuOpen((o) => !o); setProfileMenuOpen(false); setLangMenuOpen(false); }}
                className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] font-black transition-all duration-200 hover:bg-stone-200 whitespace-nowrap"
              >
                <span className="text-stone-700">{CURRENCY_SYMBOLS[currency]}</span>
                <span className="hidden sm:inline text-stone-700">&thinsp;{currency}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${currencyMenuOpen ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {currencyMenuOpen && (
                <div className="absolute top-full mt-1 right-0 z-[100] bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden min-w-[190px] animate-dropdown-slide">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      {lang === "tr" ? "Para Birimini Seçin" : lang === "fa" ? "انتخاب واحد پولی" : lang === "ar" ? "اختر العملة" : lang === "de" ? "Währung wählen" : lang === "ru" ? "Выбрать валюту" : "Select Currency"}
                    </p>
                  </div>
                  {(["USD", "EUR", "TRY"] as const).map((cur) => {
                    const meta = {
                      USD: { icon: "💵", name: lang === "tr" ? "ABD Doları" : lang === "fa" ? "دلار آمریکا" : lang === "ar" ? "دولار أمريكي" : lang === "de" ? "US-Dollar" : lang === "ru" ? "Доллар США" : "US Dollar" },
                      EUR: { icon: "💶", name: lang === "tr" ? "Euro" : lang === "fa" ? "یورو" : lang === "ar" ? "يورو" : lang === "de" ? "Euro" : lang === "ru" ? "Евро" : "Euro" },
                      TRY: { icon: "💴", name: lang === "tr" ? "Türk Lirası" : lang === "fa" ? "لیر ترکیه" : lang === "ar" ? "ليرة تركية" : lang === "de" ? "Türkische Lira" : lang === "ru" ? "Турецкая лира" : "Turkish Lira" },
                    }[cur];
                    return (
                      <button
                        key={cur}
                        onClick={() => { setCurrency(cur); setCurrencyMenuOpen(false); }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2.5 transition-colors ${currency === cur ? "bg-orange-50 text-orange-700 font-black" : "text-stone-700 hover:bg-stone-50 font-semibold"}`}
                      >
                        <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>
                        <span className="text-[12px]">{CURRENCY_SYMBOLS[cur]}&thinsp;{cur}</span>
                        <span className="text-[11px] text-stone-400 ml-auto">{meta.name}</span>
                        {currency === cur && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-orange-500 flex-shrink-0">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lang switcher — prominent orange pill + dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => {
                  setLangMenuOpen((o) => !o);
                  setProfileMenuOpen(false);
                  setCurrencyMenuOpen(false);
                  setShowLangTooltip(false);
                  window.dispatchEvent(new CustomEvent('langSelectorOpened'));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(249,115,22,0.4)',
                  transition: 'all 0.2s ease',
                  animation: 'langPulse 3s infinite',
                }}
              >
                <span style={{ fontSize: '22px' }}>
                  {lang === "tr" ? "🇹🇷" : lang === "en" ? "🇬🇧" : lang === "fa" ? "🇮🇷" : lang === "ar" ? "🇸🇦" : lang === "ru" ? "🇷🇺" : "🇩🇪"}
                </span>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px' }}>
                  {lang === "tr" ? "TR" : lang === "en" ? "EN" : lang === "fa" ? "FA" : lang === "ar" ? "AR" : lang === "ru" ? "RU" : "DE"}
                </span>
                <span style={{ color: 'white', fontSize: '12px' }}>▼</span>
              </button>

              {/* One-time first-visit tooltip */}
              {showLangTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#1a1a1a',
                  color: 'white',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  animation: 'fadeIn 0.3s ease',
                }}>
                  🌍 Dili değiştir / Change language
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '16px',
                    width: '12px',
                    height: '12px',
                    background: '#1a1a1a',
                    transform: 'rotate(45deg)',
                    borderRadius: '2px',
                  }} />
                </div>
              )}

              {langMenuOpen && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden min-w-[90px] animate-dropdown-slide" style={{ zIndex: 99999 }}>
                  {(["tr", "en", "fa", "ar", "de", "ru"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangMenuOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 text-[12px] font-bold transition-colors hover:bg-stone-50 ${lang === l ? "text-orange-500" : "text-stone-700"}`}
                    >
                      <span className="text-sm">{l === "tr" ? "🇹🇷" : l === "en" ? "🇬🇧" : l === "fa" ? "🇮🇷" : l === "ar" ? "🇸🇦" : l === "ru" ? "🇷🇺" : "🇩🇪"}</span>
                      {l === "tr" ? "TR" : l === "en" ? "EN" : l === "fa" ? "FA" : l === "ar" ? "AR" : l === "ru" ? "RU" : "DE"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              /* Avatar button — opens profile side panel */
              <button
                onClick={() => { setProfileMenuOpen((o) => !o); setLangMenuOpen(false); setCurrencyMenuOpen(false); }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-[10px] sm:text-xs text-white shadow-md shadow-orange-500/40 flex-shrink-0 hover:scale-105 active:scale-90 transition-all duration-200 overflow-hidden ring-2 ${profileMenuOpen ? "ring-orange-500 ring-offset-2 scale-95" : "ring-orange-300 ring-offset-1"}`}
              >
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (user.user_metadata?.full_name ?? user.email ?? "U")
                    .split(" ")
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                )}
              </button>
            ) : (
              <>
                {/* Mobile: glowing pulsing auth icon */}
                <button
                  onClick={() => setShowAuth(true)}
                  aria-label={t.signIn}
                  className="sm:hidden relative w-9 h-9 flex-shrink-0 flex items-center justify-center"
                >
                  <span className="absolute inset-0 rounded-xl bg-orange-400 animate-ping opacity-40" />
                  <span className="relative w-full h-full rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/50 active:scale-90 transition-transform duration-150">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-white">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                </button>
                {/* Desktop: text button */}
                <button
                  onClick={() => setShowAuth(true)}
                  className="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-stone-100"
                >
                  {t.signIn}
                </button>
              </>
            )}

            <a
              href="https://www.instagram.com/sefira.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Sefira on Instagram"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 text-stone-400 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 hover:scale-110 active:scale-90 flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <button className="hidden sm:block text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl hover:opacity-95 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95">
              {t.getStarted}
            </button>
          </div>
        </div>
      </nav>

      {/* PROFILE RIGHT DRAWER */}
      {user && (
        <>
          <style>{`
            .ps-item {
              display: flex; align-items: center; gap: 12px;
              padding: 14px 16px; background: white; border-radius: 16px;
              text-decoration: none; width: 100%;
              cursor: pointer; border: none; text-align: left;
              transition: background 0.15s ease, transform 0.1s ease;
              box-sizing: border-box; color: inherit;
              box-shadow: 0 1px 3px rgba(0,0,0,0.07);
              margin-bottom: 8px;
            }
            .ps-item:hover  { background: #fafafa; }
            .ps-item:active { transform: scale(0.97); }
          `}</style>

          {/* Overlay */}
          <div
            onClick={() => setProfileMenuOpen(false)}
            style={{
              position: "fixed", top: 0, left: 0,
              width: "100%", height: "100%",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              zIndex: 999,
              opacity: profileMenuOpen ? 1 : 0,
              transition: "opacity 0.3s ease-out",
              pointerEvents: profileMenuOpen ? "auto" : "none",
            }}
          />

          {/* Drawer */}
          <div
            dir="ltr"
            style={{
              position: "fixed", top: 0, right: 0,
              width: "320px", height: "100%",
              background: "#f3f4f6",
              zIndex: 1000,
              transform: profileMenuOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s ease-out",
              overflow: "hidden",
              boxShadow: "-4px 0 40px rgba(0,0,0,0.18)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Orange gradient header */}
            <div style={{
              background: "linear-gradient(135deg, #f97316 0%, #fb923c 60%, #f59e0b 100%)",
              paddingTop: "64px",
              paddingBottom: "28px",
              paddingLeft: "24px",
              paddingRight: "24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: "-30px", left: "-10px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

              {/* Avatar */}
              <button
                onClick={() => { setProfileMenuOpen(false); router.push("/profile"); }}
                style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #ea580c, #d97706)",
                  border: "4px solid white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "28px", color: "white",
                  overflow: "hidden", cursor: "pointer", flexShrink: 0,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (user.user_metadata?.full_name ?? user.email ?? "U")
                    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                )}
              </button>

              <p style={{ fontWeight: 700, fontSize: "18px", color: "white", margin: "4px 0 0", textAlign: "center" }}>
                {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.82)", margin: 0, textAlign: "center" }}>
                {user.email}
              </p>
            </div>

            {/* Menu items */}
            <div style={{ flex: 1, padding: "16px 16px 8px", display: "flex", flexDirection: "column", overflowY: "auto" }}>

              {/* Edit Profile */}
              <Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="ps-item">
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111", flex: 1 }}>
                  {lang === "tr" ? "Profilimi Düzenle" : lang === "fa" ? "ویرایش پروفایل" : lang === "ar" ? "تعدیل الملف الشخصی" : lang === "de" ? "Profil bearbeiten" : lang === "ru" ? "Редактировать профиль" : "Edit Profile"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Saved */}
              <Link href="/saved-listings" onClick={() => setProfileMenuOpen(false)} className="ps-item">
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111", flex: 1 }}>
                  {lang === "tr" ? "Kaydedilenler" : lang === "fa" ? "ذخیره‌ها" : lang === "ar" ? "المحفوظات" : lang === "de" ? "Gespeichert" : lang === "ru" ? "Сохранённые" : "Saved"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Post Listing */}
              <button onClick={() => { handleCreateListing(); setProfileMenuOpen(false); }} className="ps-item">
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" style={{ width: "20px", height: "20px" }}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111", flex: 1 }}>
                  {lang === "tr" ? "İlan Ver" : lang === "fa" ? "ثبت آگهی" : lang === "ar" ? "نشر إعلان" : lang === "de" ? "Inserat aufgeben" : lang === "ru" ? "Разместить объявление" : "Post Listing"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* My Listings */}
              <Link href="/my-listings" onClick={() => setProfileMenuOpen(false)} className="ps-item">
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111", flex: 1 }}>
                  {lang === "tr" ? "İlanlarım" : lang === "fa" ? "آگهی‌های من" : lang === "ar" ? "إعلاناتی" : lang === "de" ? "Meine Inserate" : lang === "ru" ? "Мои объявления" : "My Listings"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* My Messages */}
              <Link href="/messages" onClick={() => setProfileMenuOpen(false)} className="ps-item">
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {unreadSupportCount > 0 && (
                    <div style={{ position: "absolute", top: "0", right: "0", minWidth: "18px", height: "18px", borderRadius: "9999px", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                      <span style={{ color: "white", fontWeight: 700, fontSize: "10px", lineHeight: 1 }}>
                        {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
                      </span>
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111", flex: 1 }}>
                  {lang === "tr" ? "Mesajlarım" : lang === "fa" ? "پیام‌های من" : lang === "ar" ? "رسائلی" : lang === "de" ? "Meine Nachrichten" : lang === "ru" ? "Мои сооبщения" : "My Messages"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Reviews & Ratings */}
              <Link href="/my-reviews" onClick={() => setProfileMenuOpen(false)} className="ps-item">
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111", flex: 1 }}>
                  {lang === "tr" ? "Yorumlarım ve Puanım" : lang === "fa" ? "کامنت‌ها و امتیازهای من" : lang === "ar" ? "تعلیقاتی وتقییماتی" : lang === "de" ? "Meine Bewertungen" : lang === "ru" ? "Мои отзывы и оценки" : "Reviews & Ratings"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Sign Out */}
              <button
                onClick={() => { handleSignOut(); setProfileMenuOpen(false); }}
                className="ps-item"
              >
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="#dc2626" style={{ width: "20px", height: "20px" }}>
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#dc2626", flex: 1 }}>
                  {t.signOut}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden bg-[#0A0E27]"
        style={{background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,53,0.15), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(99,102,241,0.12), transparent), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(236,72,153,0.10), transparent), #0A0E27'}}
      >

        {/* Floating glow orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px] opacity-40 pointer-events-none" style={{background:'#FF6B35'}} />
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full blur-[120px] opacity-30 pointer-events-none" style={{background:'#6366F1'}} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-[100px] opacity-25 pointer-events-none" style={{background:'#EC4899'}} />

        {/* Subtle dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'32px 32px'}} />

        {/* CSS particle system */}
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className={`hero-particle hero-particle-${(i % 6) + 1}`}
            style={{
              left: `${((i * 37 + 5) % 89) + 3}%`,
              top: `${((i * 29 + 8) % 82) + 5}%`,
              animationDelay: `${((i * 35) % 800) / 100}s`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-[1.1fr_1fr] gap-12 xl:gap-16 items-center w-full">

          {/* ── LEFT: Typography + Wizard ───────────────────────────────────── */}
          <div className="flex flex-col items-start order-last lg:order-first lg:col-start-1">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2 mb-8 text-sm text-orange-300 hover:bg-white/10 transition-all duration-300 cursor-default shadow-2xl animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              {t.heroBadge}
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tighter mb-6 animate-fade-in-up stagger-2 hero-title-glow">
              <span className="text-white">{t.heroLine1}</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                {t.heroLine2}
              </span>
              <br />
              <span className="text-white">{t.heroLine3}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-white/75 max-w-xl mb-8 leading-relaxed animate-fade-in-up stagger-3">
              {t.heroP}
            </p>

            {/* ── SEARCH WIZARD ─────────────────────────────────────────────── */}
            <div className="w-full mb-10 animate-fade-in-up stagger-4">

              {wizardMode === null ? (
                /* ── Mode selector ── */
                <div>
                  <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3.5">
                    {t.wizardTitle}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Card 1: Has room, looking for roommate */}
                    <button
                      onClick={() => { setWizardMode("seeking"); setWizardStep(1); }}
                      className="relative text-left p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98] overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #FF6B35, #FF8E53)" }}
                    >
                      <div className={`flex ${lang === "fa" || lang === "ar" ? "flex-row-reverse" : "flex-row"} items-start gap-4`}>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                          🏠
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-white leading-snug mb-1">
                            {t.optionSeekingTitle}
                          </p>
                          <p className="text-sm text-white/80 leading-snug">
                            {t.optionSeekingSubtitle}
                          </p>
                        </div>
                      </div>
                      <div className={`flex ${lang === "fa" || lang === "ar" ? "justify-start" : "justify-end"} mt-3`}>
                        <span className="text-white/70 text-xl">→</span>
                      </div>
                    </button>

                    {/* Card 2: No room, looking for place */}
                    <button
                      onClick={() => { setWizardMode("offering"); setWizardStep(1); }}
                      className="relative text-left p-5 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98] overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #667EEA, #764BA2)" }}
                    >
                      <div className={`flex ${lang === "fa" || lang === "ar" ? "flex-row-reverse" : "flex-row"} items-start gap-4`}>
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                          🔍
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-white leading-snug mb-1">
                            {t.optionOfferingTitle}
                          </p>
                          <p className="text-sm text-white/80 leading-snug">
                            {t.optionOfferingSubtitle}
                          </p>
                        </div>
                      </div>
                      <div className={`flex ${lang === "fa" || lang === "ar" ? "justify-start" : "justify-end"} mt-3`}>
                        <span className="text-white/70 text-xl">→</span>
                      </div>
                    </button>
                  </div>
                </div>

              ) : (
                /* ── Wizard container ── */
                <div className="bg-white/97 backdrop-blur-2xl border border-stone-200/90 rounded-2xl shadow-2xl shadow-stone-900/8 overflow-hidden">

                  {/* Wizard header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-stone-100 bg-gradient-to-r from-stone-50/60 to-transparent">
                    <button
                      onClick={() => {
                        if (wizardStep === 1) { setWizardMode(null); }
                        else setWizardStep((s) => s - 1);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-all duration-200 px-2 py-1.5 rounded-lg hover:bg-stone-100 active:scale-95 -ml-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      {t.backBtn}
                    </button>

                    {/* Step pills */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`rounded-full transition-all duration-400 ${
                            wizardStep >= s
                              ? "w-6 h-2 bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm shadow-orange-500/40"
                              : "w-2 h-2 bg-stone-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Mode chip */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${
                      wizardMode === "seeking"
                        ? "bg-orange-50 text-orange-600 border border-orange-200"
                        : "bg-violet-50 text-violet-600 border border-violet-200"
                    }`}>
                      <span>{wizardMode === "seeking" ? "🔍" : "🏠"}</span>
                      <span>{wizardMode === "seeking" ? t.seekingChip : t.offeringChip}</span>
                    </div>
                  </div>

                  {/* Step body */}
                  <div className="px-5 pt-5 pb-4">

                    {/* Step 1: Gender preference */}
                    {wizardStep === 1 && (
                      <div className="animate-fade-in-up">
                        <h3 className="font-black text-stone-900 text-base mb-0.5 leading-tight">
                          {t.genderStep}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium mb-5" dir="rtl">
                          {t.genderStepSub}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {(["male", "female", "any"] as const).map((g) => (
                            <button
                              key={g}
                              onClick={() => setGenderPref(g)}
                              className={`relative flex flex-col items-center gap-2.5 py-4 px-2 rounded-xl border-2 font-bold transition-all duration-200 active:scale-95 ${
                                genderPref === g
                                  ? g === "male"
                                    ? "border-blue-400 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/15 scale-[1.02]"
                                    : g === "female"
                                    ? "border-rose-400 bg-rose-50 text-rose-700 shadow-lg shadow-rose-500/15 scale-[1.02]"
                                    : "border-orange-400 bg-orange-50 text-orange-700 shadow-lg shadow-orange-500/15 scale-[1.02]"
                                  : "border-stone-200 bg-stone-50/80 text-stone-500 hover:border-stone-300 hover:bg-white hover:text-stone-700"
                              }`}
                            >
                              <span className="text-2xl leading-none">
                                {g === "male" ? "👨" : g === "female" ? "👩" : "👥"}
                              </span>
                              <span className="text-xs font-black tracking-tight">
                                {g === "male" ? t.genderMale : g === "female" ? t.genderFemale : t.genderAny}
                              </span>
                              {genderPref === g && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[9px]">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Budget */}
                    {wizardStep === 2 && (
                      <div className="animate-fade-in-up">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-black text-stone-900 text-base leading-tight">
                            {t.budgetStep}
                          </h3>
                          {/* Inline currency switcher */}
                          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5">
                            {(["USD", "EUR", "TRY"] as const).map((cur) => (
                              <button
                                key={cur}
                                onClick={() => setCurrency(cur)}
                                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all duration-200 ${
                                  currency === cur
                                    ? "bg-white text-stone-900 shadow-sm"
                                    : "text-stone-400 hover:text-stone-700"
                                }`}
                              >
                                {CURRENCY_SYMBOLS[cur]}&thinsp;{cur}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 font-medium mb-6" dir="rtl">
                          {t.budgetStepSub}
                        </p>

                        {/* Live budget display */}
                        <div className="text-center mb-6">
                          <span className="text-5xl font-black bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent tracking-tight">
                            {displayPrice(budgetUSD, "USD", currency)}
                          </span>
                          <span className="text-stone-400 font-medium ml-2 text-sm">{t.perMonth}</span>
                        </div>

                        {/* Styled range slider */}
                        <div className="px-1 pb-1">
                          <input
                            type="range"
                            min={100}
                            max={5000}
                            step={50}
                            value={budgetUSD}
                            onChange={(e) => setBudgetUSD(Number(e.target.value))}
                            className="budget-slider w-full"
                            style={{
                              background: `linear-gradient(to right, #f97316 ${sliderPct}%, #e7e5e4 ${sliderPct}%)`,
                            }}
                          />
                          <div className="flex justify-between text-xs text-stone-400 font-medium mt-2.5">
                            <span>{displayPrice(100, "USD", currency)}</span>
                            <span>{displayPrice(5000, "USD", currency)}+</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Location */}
                    {wizardStep === 3 && (
                      <div className="animate-fade-in-up">
                        <h3 className="font-black text-stone-900 text-base mb-0.5 leading-tight">
                          {t.locationStep}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium mb-5" dir="rtl">
                          {t.locationStepSub}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                          <select
                            value={selectedCountry}
                            onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity(""); }}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-600 outline-none cursor-pointer hover:border-stone-400 focus:border-orange-400 transition-colors duration-200"
                          >
                            <option value="">{t.countryPlaceholder}</option>
                            <optgroup label={t.priorityGroupLabel}>
                              {PRIORITY_COUNTRIES.map((c) => (
                                <option key={`p-${c}`} value={c}>{c}</option>
                              ))}
                            </optgroup>
                            <optgroup label={t.allCountriesLabel}>
                              {countries
                                .filter((c) => !PRIORITY_COUNTRIES.includes(c))
                                .map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                            </optgroup>
                          </select>
                          <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedCountry || loadingCities}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-600 outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-stone-400 focus:border-orange-400 transition-colors duration-200"
                          >
                            <option value="">{loadingCities ? t.loadingText : t.cityPlaceholder}</option>
                            {cities.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none text-sm focus:border-orange-400 transition-colors duration-200 min-w-0"
                          />
                        </div>
                        {/* Quick city chips */}
                        <div className="flex flex-wrap gap-2">
                          {(selectedCountry && PRIORITY_CITIES[selectedCountry]
                            ? PRIORITY_CITIES[selectedCountry]
                            : selectedCountry && cities.length > 0
                            ? cities.slice(0, 6)
                            : ["Berlin", "Dubai", "Istanbul", "Barcelona", "Paris", "Rome"]
                          ).map((city) => (
                            <button
                              key={city}
                              onClick={() => setSelectedCity(city)}
                              className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 active:scale-95 hover:scale-105 ${
                                selectedCity === city
                                  ? "bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white border-transparent shadow-md shadow-orange-500/25"
                                  : "text-stone-600 bg-stone-100 border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:bg-stone-200"
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wizard CTA button */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => { if (wizardStep < 3) setWizardStep((s) => s + 1); }}
                      className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 text-white hover:opacity-95 transition-all duration-200 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-violet-500/30 active:scale-[0.98] flex items-center justify-center gap-2.5"
                    >
                      {wizardStep === 3 ? (
                        <>
                          {t.searchNowBtn}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </>
                      ) : (
                        <>
                          {t.nextBtn}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced property filters */}
            <div className="w-full mb-8">
              <PropertyFilters lang={lang} currency={currency} currencySymbol={sym} />
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  ["SK", "from-pink-500 to-rose-600"],
                  ["AM", "from-blue-500 to-indigo-600"],
                  ["YT", "from-violet-500 to-purple-600"],
                  ["JW", "from-emerald-500 to-teal-600"],
                  ["PS", "from-amber-500 to-orange-600"],
                ].map(([init, grad], i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} border-2 border-white/25 flex items-center justify-center text-xs font-bold shadow-lg`}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{t.matchesThisWeek}</div>
                <div className="text-xs text-white/60">{t.reviewsLabel}</div>
              </div>
            </div>

            {/* İlan Ver — desktop hero button */}
            <button
              onClick={handleCreateListing}
              className="hidden sm:flex mt-8 items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t.ilanVer}
            </button>
          </div>

          {/* ── RIGHT: Floating cat with glow & sparkles ──────────────────── */}
          <div className="flex items-center justify-center relative py-4 lg:py-12 order-first lg:order-last lg:col-start-2">
            {/* Pulsing glow orb behind cat */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="hero-orb-glow w-80 h-80 lg:w-[520px] lg:h-[520px] rounded-full bg-gradient-to-br from-orange-500/35 via-purple-600/22 to-indigo-700/28 blur-3xl" />
            </div>
            {/* Subtle ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-60 h-60 lg:w-[380px] lg:h-[380px] rounded-full border border-orange-400/20 bg-gradient-to-br from-orange-500/8 via-purple-600/6 to-indigo-700/8" />
            </div>
            {/* Cat wrapper */}
            <div className="relative animate-cat-float z-10 w-[85vw] max-w-[360px] sm:max-w-[420px] lg:w-full lg:max-w-none">
              {/* Ground shadow glow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-r from-orange-500/50 via-purple-600/40 to-indigo-700/40 blur-2xl rounded-full pointer-events-none" />
              {/* Sparkles */}
              <span className="hero-sparkle text-xl"  style={{ top: '6%',  right: '10%', animationDelay: '0s'    }}>✦</span>
              <span className="hero-sparkle text-base" style={{ top: '22%', left:  '4%',  animationDelay: '0.65s' }}>✦</span>
              <span className="hero-sparkle text-sm"  style={{ top: '52%', right: '4%',  animationDelay: '1.4s'  }}>✦</span>
              <span className="hero-sparkle text-xs"  style={{ top: '72%', left:  '8%',  animationDelay: '2.1s'  }}>✦</span>
              <span className="hero-sparkle text-lg"  style={{ top: '38%', right: '1%',  animationDelay: '0.35s' }}>✦</span>
              <span className="hero-sparkle"           style={{ top: '14%', left:  '16%', animationDelay: '1.75s', fontSize: '10px' }}>✦</span>
              <span className="hero-sparkle text-sm"  style={{ top: '62%', right: '14%', animationDelay: '1.05s' }}>✦</span>
              <span className="hero-sparkle text-xs"  style={{ top: '44%', left:  '1%',  animationDelay: '2.45s' }}>✦</span>
              {/* Cat image */}
              <Image
                src="/images/hero-cat.png"
                alt="Sefira mascot"
                width={560}
                height={620}
                className="w-full h-auto object-contain"
                style={{ filter: 'drop-shadow(0 0 55px rgba(255,140,66,0.5)) drop-shadow(0 24px 64px rgba(80,60,180,0.35))' }}
                priority
              />
              {/* Floating badges */}
              <div className="absolute -top-5 -left-5 sm:-left-10 bg-white/95 border border-stone-100 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xl shadow-stone-900/10 backdrop-blur-md animate-fade-in-up stagger-2 z-20">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/30">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-black text-stone-900 leading-none mb-0.5">127K+</div>
                    <div className="text-xs text-stone-400">Verified Users</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 sm:-right-10 bg-white/95 border border-stone-100 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xl shadow-stone-900/10 backdrop-blur-md animate-fade-in-up stagger-4 z-20">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/30">
                    ★
                  </div>
                  <div>
                    <div className="text-xs font-black text-stone-900 leading-none mb-0.5">4.9 Stars</div>
                    <div className="text-xs text-stone-400">12K+ Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex flex-col items-center gap-2 pb-10 select-none">
          <span className="text-5xl leading-none animate-robot-bounce" aria-hidden="true">🤖</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 text-white/40 animate-bounce" style={{ animationDelay: "0.3s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <div className="border-y border-orange-100 bg-orange-50/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.stats.map((s) => (
            <div key={s.label} className="text-center group cursor-default hover:scale-105 transition-transform duration-200">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1 group-hover:from-orange-400 group-hover:to-amber-400 transition-all duration-300">
                {s.value}
              </div>
              <div className="text-sm text-stone-500 group-hover:text-stone-600 transition-colors duration-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WEEKLY STORIES ────────────────────────────────────────────────────── */}
      {weeklyStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pt-6 sm:pt-8 pb-4">
          <p className="text-sm font-bold text-stone-800 mb-3 sm:mb-4">
            {weeklyStories[0]?.week_label ?? "Bu Hafta"}
          </p>
          <div
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {weeklyStories.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => openStory(idx)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none"
                style={{ minHeight: 44 }}
              >
                {/* Gradient ring: 70px total on mobile, 90px on desktop */}
                <div
                  className="p-[3px] rounded-full"
                  style={{ background: "linear-gradient(135deg, #f97316, #f59e0b, #ec4899)" }}
                >
                  <div className="w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden bg-stone-100 border-2 border-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.image_url}
                      alt={story.caption ?? "Hikaye"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Caption: max 10 chars, truncated */}
                <span className="text-xs text-stone-600 font-medium w-[70px] sm:w-[90px] text-center truncate leading-tight">
                  {(story.caption ?? "Hikaye").substring(0, 10)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── STORY VIEWER ──────────────────────────────────────────────────────── */}
      {viewerOpen && weeklyStories.length > 0 && (
        <>
          {/* Backdrop (desktop only — mobile has full black bg) */}
          <div
            className="fixed inset-0 z-[99998] hidden md:block bg-black/70"
            onClick={() => setViewerOpen(false)}
          />

          {/* Modal: 100vw×100vh mobile, 600px×90vh centered on desktop */}
          <div className="fixed z-[99999] bg-black flex flex-col inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:h-[90vh] md:rounded-2xl md:overflow-hidden">

            {/* Close button */}
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-black/50 flex items-center justify-center text-white text-lg hover:bg-black/70 transition-colors"
              aria-label="Kapat"
            >
              ✕
            </button>

            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-16 z-10 flex gap-1">
              {weeklyStories.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 rounded-full flex-1 transition-all duration-200"
                  style={{ backgroundColor: i === viewerIndex ? "white" : "rgba(255,255,255,0.35)" }}
                />
              ))}
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-4 mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={weeklyStories[viewerIndex].image_url}
                alt={weeklyStories[viewerIndex].caption ?? "Hikaye"}
                className="max-w-full max-h-full object-contain select-none"
              />
            </div>

            {/* Caption */}
            {weeklyStories[viewerIndex].caption && (
              <div className="px-6 pb-10 pt-4 text-center" style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
                <p className="text-white text-base font-medium drop-shadow-lg">
                  {weeklyStories[viewerIndex].caption}
                </p>
              </div>
            )}

            {/* Tap zones: left half = prev, right half = next */}
            <div className="absolute inset-0 flex pointer-events-none mt-10">
              <button
                className="w-1/2 h-full pointer-events-auto focus:outline-none"
                onClick={() => goToPrev()}
                aria-label="Önceki hikaye"
              />
              <button
                className="w-1/2 h-full pointer-events-auto focus:outline-none"
                onClick={() => goToNext()}
                aria-label="Sonraki hikaye"
              />
            </div>
          </div>
        </>
      )}

      {/* ── LISTINGS ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 mt-2 pt-2 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
              {t.featuredH2}
            </h2>
            <p className="text-stone-500">{t.featuredP}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {["all", "Berlin", "Dubai", "Istanbul", "Barcelona"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  activeFilter === f
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                    : "bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-300"
                }`}
              >
                {f === "all" ? t.listingFilterAll : f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1 cursor-pointer hover:ring-1 hover:ring-orange-200"
            >
              <div className="relative h-32 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${listing.gradient}`} />
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 1280px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  quality={80}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/25 via-transparent to-stone-900/30" />
                <div className={`absolute top-2 left-2 bg-gradient-to-r ${listing.tagColor} text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow`}>
                  {lang === "ru" ? (TAG_RU[listing.tag] ?? listing.tag) : listing.tag}
                </div>
                <button
                  onClick={() => toggleListing(listing.id)}
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 font-bold active:scale-90 text-xs ${
                    likedListings.includes(listing.id)
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110"
                      : "bg-stone-900/25 backdrop-blur-sm text-white/60 hover:text-white hover:bg-stone-900/50 hover:scale-110"
                  }`}
                >
                  ♥
                </button>
                <div className="absolute bottom-2 right-2 bg-stone-900/60 backdrop-blur-sm rounded-lg px-2 py-0.5">
                  <span className="text-white font-black text-xs">
                    {displayPrice(listing.price, listing.sym, currency)}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-orange-600 transition-colors truncate">
                  {listing.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {listing.city}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-amber-500 text-xs">★</span>
                  <span className="text-stone-900 text-xs font-bold">{listing.rating}</span>
                  <span className="text-stone-400 text-xs">({listing.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button className="bg-stone-100 border border-stone-200 text-stone-800 px-8 py-3.5 rounded-xl font-bold hover:bg-stone-200 hover:border-stone-300 transition-all duration-200 hover:shadow-lg active:scale-95">
            {t.viewAllBtn}
          </button>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="bg-amber-50/80 border-y border-amber-100 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">{t.howH2}</h2>
            <p className="text-stone-600 text-lg max-w-xl mx-auto">{t.howP}</p>
          </div>
          <div className="relative">
            {/* Connecting line — desktop only, aligned to icon center (~top-10 + half of w-20) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(12.5%+2.5rem)] right-[calc(12.5%+2.5rem)] h-px -z-10"
              style={{ background: "linear-gradient(to right, transparent, #FF6B35 20%, #FF6B35 80%, transparent)", opacity: 0.3, borderTop: "1px dashed #FF6B35" }}
            />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {t.howItWorks.map((step, i) => {
                const iconGradients = [
                  "bg-gradient-to-br from-blue-400 to-blue-600",
                  "bg-gradient-to-br from-violet-400 to-purple-600",
                  "bg-gradient-to-br from-pink-400 to-rose-500",
                  "bg-gradient-to-br from-emerald-400 to-green-600",
                ];
                const glowColors = [
                  "bg-blue-400/30",
                  "bg-violet-400/30",
                  "bg-pink-400/30",
                  "bg-emerald-400/30",
                ];
                const icons = [
                  /* Step 1 — person silhouette + sparkle */
                  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 21c0-3.87 3.13-7 7-7s7 3.13 7 7" />
                    <path d="M20 2l.6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6z" fill="white" stroke="none" />
                  </svg>,
                  /* Step 2 — neural network nodes */
                  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="w-10 h-10">
                    <circle cx="12" cy="12" r="2.5" />
                    <circle cx="4.5" cy="5.5" r="1.5" />
                    <circle cx="19.5" cy="5.5" r="1.5" />
                    <circle cx="4.5" cy="18.5" r="1.5" />
                    <circle cx="19.5" cy="18.5" r="1.5" />
                    <path d="M12 9.5L5.5 7" strokeOpacity={0.5} strokeWidth={1} />
                    <path d="M12 9.5L18.5 7" strokeOpacity={0.5} strokeWidth={1} />
                    <path d="M12 14.5L5.5 17" strokeOpacity={0.5} strokeWidth={1} />
                    <path d="M12 14.5L18.5 17" strokeOpacity={0.5} strokeWidth={1} />
                    <path d="M4.5 7v10" strokeOpacity={0.25} strokeWidth={1} />
                    <path d="M19.5 7v10" strokeOpacity={0.25} strokeWidth={1} />
                  </svg>,
                  /* Step 3 — two speech bubbles with heart */
                  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <path d="M4 5a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H9l-3 3V12H6a2 2 0 01-2-2V5z" />
                    <path d="M16 9h1a2 2 0 012 2v4a2 2 0 01-2 2h-1l-2 2v-2h-1" />
                    <path d="M9.5 7c0-.83.67-1.5 1.5-1.5.41 0 .78.16 1.05.43.27-.27.64-.43 1.05-.43.83 0 1.5.67 1.5 1.5 0 1.5-2.55 2.7-2.55 2.7S9.5 8.5 9.5 7z" fill="white" strokeWidth={0} />
                  </svg>,
                  /* Step 4 — house with keyhole */
                  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <path d="M3 11.5L12 3l9 8.5" />
                    <path d="M5 10v10h5v-5h4v5h5V10" />
                    <circle cx="12" cy="15.5" r="1.2" fill="white" strokeWidth={0} />
                    <line x1="12" y1="16.7" x2="12" y2="18.5" />
                  </svg>,
                ];
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 text-center flex flex-col items-center"
                  >
                    <div className="relative mb-2">
                      {/* Pulse glow behind icon */}
                      <div className={`absolute inset-0 rounded-3xl ${glowColors[i]} animate-pulse scale-110`} />
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5, transition: { type: "spring", stiffness: 300 } }}
                        className={`relative w-20 h-20 rounded-3xl ${iconGradients[i]} flex items-center justify-center shadow-lg`}
                      >
                        {icons[i]}
                      </motion.div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-md z-10">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mt-4">{step.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed text-center">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROOMMATES ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">{t.roommatesH2}</h2>
            <p className="text-stone-500">{t.roommatesP}</p>
          </div>
          <button className="text-sm text-orange-500 hover:text-orange-600 transition-all duration-200 hidden sm:block font-medium hover:underline underline-offset-2">
            {t.viewAll}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {matchProfiles.map((p, idx) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MATCH_PHOTOS[idx] ?? MATCH_PHOTOS[0]}
                  alt={p.name}
                  className="w-14 h-14 rounded-full object-cover mx-auto mt-3"
                />
                <p className="text-sm font-bold text-center mt-2">{p.name}, {p.age}</p>
                <p className="text-xs text-gray-400 text-center">{p.occupation}</p>
                <div className="flex justify-center mt-1">
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{p.match}%</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">{convertBudgetRange(p.budget, currency)}{t.perMonth}</p>
                <p className="text-xs text-gray-400 text-center">{p.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR CITIES ────────────────────────────────────────────────────── */}
      <PopularCities lang={lang} />

      {/* ── SOCIAL MEDIA ──────────────────────────────────────────────────────── */}
      <section className="py-10 px-4">
        <div className="max-w-sm mx-auto">

          {/* Section title */}
          <h2 className="text-xl font-black text-gray-900 text-center mb-6">
            🌐 {t.followTitle}
          </h2>

          {/* Instagram Card */}
          <motion.div
            initial={{opacity:0, y:20}}
            whileInView={{opacity:1, y:0}}
            viewport={{once:true}}
            className="rounded-3xl p-5 mb-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)'}}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-base">Instagram</p>
                <p className="text-white/70 text-xs">@sefira.app</p>
              </div>
              <div className="ml-auto bg-white/20 rounded-full px-2 py-0.5 text-xs">
                12.4K takipçi
              </div>
            </div>

            <p className="text-white/80 text-xs mb-3">{t.igDesc}</p>

            <a
              href="https://instagram.com/sefira.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-center py-2.5 rounded-2xl font-bold text-sm"
              style={{color:'#fd1d1d'}}
            >
              {t.followBtn}
            </a>
          </motion.div>

          {/* Telegram Card */}
          <motion.div
            initial={{opacity:0, y:20}}
            whileInView={{opacity:1, y:0}}
            viewport={{once:true}}
            transition={{delay:0.15}}
            className="rounded-3xl p-5 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#0088cc,#00b4ff)'}}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-base">Telegram</p>
                <p className="text-white/70 text-xs">@getsefira</p>
              </div>
              <div className="ml-auto bg-white/20 rounded-full px-2 py-0.5 text-xs">
                Kanal
              </div>
            </div>

            <p className="text-white/80 text-xs mb-3">{t.tgDesc}</p>

            <a
              href="https://t.me/getsefira"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-center py-2.5 rounded-2xl font-bold text-sm text-[#0088cc]"
            >
              {t.joinChannelBtn}
            </a>
          </motion.div>

        </div>
      </section>

      {/* ── PROMO IMAGE ───────────────────────────────────────────────────────── */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-sm mx-auto">
          {/* Top label */}
          <div className="flex justify-center mb-4">
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              🏠 Sefira App
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2 leading-tight">
            {lang === "tr" ? "Güvenli Ev Arkadaşı Bulmanın En Kolay Yolu"
              : lang === "en" ? "The Easiest Way to Find a Safe Roommate"
              : lang === "fa" ? "آسان‌ترین راه برای پیدا کردن هم‌خانه مطمئن"
              : lang === "ar" ? "أسهل طريقة لإيجاد شريك سكن آمن"
              : lang === "de" ? "Der einfachste Weg, einen sicheren Mitbewohner zu finden"
              : "Самый простой способ найти надёжного соседа"}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-8">
            {lang === "tr" ? "Binlerce doğrulanmış ilan, tek platformda"
              : lang === "en" ? "Thousands of verified listings, one platform"
              : lang === "fa" ? "هزاران آگهی تأیید شده، یک پلتفرم"
              : lang === "ar" ? "آلاف الإعلانات الموثقة في منصة واحدة"
              : lang === "de" ? "Tausende verifizierte Anzeigen, eine Plattform"
              : "Тысячи проверенных объявлений на одной платформе"}
          </p>

          {/* Image with frame */}
          <div className="relative mx-auto w-fit">
            {/* Glow ring behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl blur-2xl opacity-25 scale-105" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/sefira-promo.jpeg"
                alt="Sefira App"
                width={320}
                height={400}
                style={{ objectFit: "cover" }}
                className="rounded-3xl"
              />
            </div>
            {/* Floating badge top-right */}
            <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✨ #1 Platform
            </div>
          </div>

          {/* Stats row below image */}
          <div className="flex justify-between mt-8 bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <div className="text-center">
              <p className="text-lg font-black text-orange-500">10K+</p>
              <p className="text-xs text-gray-400">
                {lang === "tr" ? "Kullanıcı" : lang === "en" ? "Users" : lang === "fa" ? "کاربر" : lang === "ar" ? "مستخدم" : lang === "de" ? "Nutzer" : "Пользователей"}
              </p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-lg font-black text-orange-500">2.8K</p>
              <p className="text-xs text-gray-400">
                {lang === "tr" ? "İlan" : lang === "en" ? "Listings" : lang === "fa" ? "آگهی" : lang === "ar" ? "إعلان" : lang === "de" ? "Inserate" : "Объявлений"}
              </p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-lg font-black text-orange-500">4.9⭐</p>
              <p className="text-xs text-gray-400">
                {lang === "tr" ? "Puan" : lang === "en" ? "Rating" : lang === "fa" ? "امتیاز" : lang === "ar" ? "تقييم" : lang === "de" ? "Bewertung" : "Рейтинг"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 border-t border-stone-700">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/25">S</div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Sefira</span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs mb-7">{t.footerDesc}</p>
              <div className="flex gap-2.5">
                {["X", "in", "yt"].map((icon) => (
                  <button key={icon} className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-xs text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 font-bold hover:scale-110 active:scale-90">
                    {icon}
                  </button>
                ))}
                <a
                  href="https://www.instagram.com/sefira.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Sefira on Instagram"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-stone-400 hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/getsefira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Telegram"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
            {t.footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      {HELP_CENTER_TEXTS.has(link)
                        ? <Link href="/messages" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                        : <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</a>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500">{t.footerCopy}</p>
            <div className="flex items-center gap-6">
              {t.footerLegal.map((l) => (
                <a key={l} href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showAuth && (
        <AuthModal lang={lang} initialTab={authTab} onClose={() => { setShowAuth(false); setAuthTab('login'); }} />
      )}

      {/* ── WELCOME MODAL ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes sefira-welcome-in {
          0%   { opacity: 0; transform: scale(0.88) translateY(24px); }
          60%  { opacity: 1; transform: scale(1.03) translateY(-4px);  }
          100% { opacity: 1; transform: scale(1)    translateY(0);     }
        }
        @keyframes sefira-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes sefira-float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-6px);  }
        }
        @keyframes sefira-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── Stay message popup (after cancelling account deletion) ─────────── */}
      {showStayMessage && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", opacity: stayMessageVisible ? 1 : 0 }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl transition-all duration-300"
            style={{
              background: "linear-gradient(145deg, #ff6b35 0%, #f97316 35%, #ec4899 75%, #f43f5e 100%)",
              boxShadow: "0 32px 80px -12px rgba(249,115,22,0.6), 0 16px 40px -8px rgba(236,72,153,0.45)",
              transform: stayMessageVisible ? "scale(1) translateY(0)" : "scale(0.85) translateY(24px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)", backgroundSize: "200% auto", animation: "sefira-shimmer 3s linear infinite" }} />
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative px-6 py-8 flex flex-col items-center text-center gap-4">
              {/* Cat image */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-xl shadow-black/20 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/sefira-cat.jpg"
                  alt="cat"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Heart */}
              <div className="text-5xl leading-none" style={{ animation: "sefira-float 2.5s ease-in-out infinite" }}>❤️</div>

              {/* Title */}
              <h2 className="text-2xl font-black text-white drop-shadow-sm tracking-tight">
                {lang === "tr" ? "Seni Çok Seviyoruz!" : lang === "fa" ? "خیلی دوستت داریم!" : lang === "ar" ? "نحبك كثيراً 🧡" : "We Love You So Much!"}
              </h2>

              {/* Message */}
              <p className="text-white/90 text-sm leading-relaxed font-medium max-w-[260px]">
                {lang === "tr"
                  ? "Bizimle kaldığın için teşekkürler. Sen bizim için çok değerlisin! 🧡"
                  : lang === "fa"
                  ? "ممنون که موندی. تو برای ما خیلی ارزشمندی! 🧡"
                  : lang === "ar"
                  ? "شكراً لبقائك معنا. أنت تعني لنا الكثير! 🧡"
                  : "Thank you for staying with us. You mean so much to us! 🧡"}
              </p>

              {/* Close heart button */}
              <button
                onClick={() => {
                  setStayMessageVisible(false);
                  setTimeout(() => setShowStayMessage(false), 300);
                }}
                className="mt-2 text-5xl leading-none hover:scale-125 active:scale-95 transition-transform duration-200"
                aria-label="Close"
              >
                ❤️
              </button>
            </div>
          </div>
        </div>
      )}

      {showWelcomeToast && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(15,10,30,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "sefira-backdrop-in 0.3s ease forwards" }}
          onClick={() => setShowWelcomeToast(false)}
          role="dialog"
          aria-modal="true"
          aria-label={lang === "tr" ? "Hoş Geldiniz" : "Welcome"}
        >
          {/* Card — stop backdrop click propagating through */}
          <div
            className="relative w-full max-w-[480px] overflow-hidden rounded-3xl select-none"
            style={{
              animation: "sefira-welcome-in 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards",
              background: "linear-gradient(145deg, #ff6b35 0%, #f59e0b 30%, #ec4899 65%, #8b5cf6 100%)",
              boxShadow: "0 32px 80px -12px rgba(236,72,153,0.55), 0 16px 40px -8px rgba(139,92,246,0.45), 0 4px 16px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                backgroundSize: "200% auto",
                animation: "sefira-shimmer 3.5s linear infinite",
              }}
            />

            {/* Soft inner glow blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Brand image */}
            <div className="relative w-full h-[140px] sm:h-[180px] overflow-hidden rounded-t-3xl flex-shrink-0">
              <img
                src="/images/sefira-welcome.jpg"
                alt="Sefira Welcome"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              {/* Gradient fade into card background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(255,107,53,0.55) 75%, rgba(139,92,246,0.85) 100%)" }}
              />
            </div>

            {/* Content */}
            <div className="relative px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8 flex flex-col items-center text-center">

              {/* Floating emoji */}
              <div
                className="text-5xl sm:text-6xl mb-4 sm:mb-5 leading-none"
                style={{ animation: "sefira-float 3s ease-in-out infinite" }}
              >
                🏠✨
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3 drop-shadow-sm tracking-tight">
                {lang === "tr" ? "Hoş Geldiniz!" : lang === "fa" ? "خوش آمدید! 🏠✨" : lang === "ar" ? "أهلاً بك! 🏠✨" : "Welcome Home!"}
              </h2>

              {/* Body */}
              <p className="text-white/90 text-sm leading-relaxed font-medium max-w-[240px] sm:max-w-[260px]">
                {lang === "tr"
                  ? "Sizi aramızda görmekten çok mutluyuz. Harika bir gün geçirmenizi diliyoruz! 🌟"
                  : lang === "fa"
                  ? "از اینکه به ما پیوستید خوشحالیم. روز خوبی داشته باشید! 🌟"
                  : lang === "ar"
                  ? "يسعدنا وجودك معنا. نتمنى لك يوماً رائعاً! 🌟"
                  : "We are so happy to have you here. Wishing you a wonderful day! 🌟"}
              </p>

              {/* Close button */}
              <button
                onClick={() => setShowWelcomeToast(false)}
                aria-label="Close"
                className="mt-6 sm:mt-8 group flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 hover:border-white/50 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-black/10 hover:shadow-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {lang === "tr" ? "Kapat" : lang === "fa" ? "بستن" : lang === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: fixed bottom İlan Ver bar ─────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-xl border-t border-stone-200 shadow-2xl shadow-stone-900/10">
        <button
          onClick={handleCreateListing}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.ilanVer}
        </button>
      </div>

      {/* ── ONBOARDING FLOW ──────────────────────────────────────────────────── */}
      {showOnboarding && user && (
        <OnboardingFlow
          userId={user.id}
          lang={lang}
          onLangChange={setLang}
          missingFields={onboardingMissing}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* ── Welcome Popup ─────────────────────────────────────────────────── */}
      <WelcomePopup lang={lang} />

      {/* ── İlan Ver — auth required modal ────────────────────────────────── */}
      {showListingModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowListingModal(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-5 sm:hidden" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3 className="font-black text-stone-900 text-base leading-snug mb-5">
              {t.ilanVerModal}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setShowListingModal(false); setShowAuth(true); }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-95 transition-all duration-200"
              >
                {t.girisYap}
              </button>
              <button
                onClick={() => { setShowListingModal(false); setShowAuth(true); }}
                className="flex-1 border-2 border-stone-200 text-stone-700 font-black text-sm py-3 rounded-xl hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:scale-95 transition-all duration-200"
              >
                {t.kayitOl}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
