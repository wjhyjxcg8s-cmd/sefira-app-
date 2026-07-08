"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import WelcomePopup from "@/app/components/WelcomePopup";

import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

import LatestListings from "@/app/components/LatestListings";
import PopularCities from "@/app/components/PopularCities";
import PropertyFilters from "@/app/components/PropertyFilters";
import AuthModal from "@/app/components/AuthModal";
import OnboardingFlow from "@/app/components/OnboardingFlow";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";
import {
  type Currency,
  CURRENCY_SYMBOLS,
  convertBudgetRange,
  displayPrice,
  fetchLiveRates,
} from "@/app/lib/currency";

// ─── PWA type ─────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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
    signOutConfirmTitle: "Çıkış Yap",
    signOutConfirmMsg: "Hesabınızdan çıkmak istediğinizden emin misiniz?",
    signOutConfirmCancel: "İptal",
    signOutConfirmOk: "Çıkış Yap",
    getStarted: "Başla",
    heroBadge: "52 şehirde 127.000'den fazla doğrulanmış kullanıcı tarafından güvenilir",
    heroLine1: "Alanınız Size Kazandırsın, Başkalarına Fırsat Olsun.",
    heroLine2: "",
    heroLine3: "",
    heroP: "Evinizi, ofisinizi veya ticari alanınızı güvenle paylaşın ya da ihtiyacınız olan alanı kolayca bulun.",
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
      { label: "Uyku Düzeni",       value: 94,  color: "from-orange-500 to-orange-600" },
      { label: "Temizlik",          value: 100, color: "from-amber-500 to-orange-700" },
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
      { step: "04", title: "Taşın",                  desc: "Dijital olarak imzala, topluluk desteği al ve mükemmel evinize yerleş.",                                                      icon: "⌂", gradient: "from-orange-500 to-orange-600" },
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
    footerDesc: "Evinizi, ofisinizi veya ticari alanınızı güvenle paylaşın ya da ihtiyacınız olan alanı kolayca bulun.",
    footerLinks: [
      { title: "Seçenekler",   links: ["Oda / Ev Arkadaşı Bul", "Evini Paylaş", "Ticari Alan Bul", "Ticari Alanını Paylaş"] },
      { title: "Şirket", links: ["Hakkımızda", "Blog", "Kariyer", "Basın", "İletişim"] },
      { title: "Destek", links: ["Yardım Merkezi", "Güvenlik", "Kullanım Koşulları", "Gizlilik", "Çerezler"] },
      { title: "Uygulama", links: ["App Store", "Google Play"] },
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
    landlordBadge: "EV SAHİBİ",
    tenantBadge: "EV ARKADAŞI ARAYAN",
    landlordSubtext: "Güvenli housemate bul",
    tenantSubtext: "İdeal evinizi bul",
    commercialOwnerBadge: "TİCARİ ALAN SAHİBİ",
    commercialOwnerTitle: "Ticari paylaşım alanım var, paylaşmak istiyorum",
    commercialOwnerSubtitle: "Alanınızı doğru kişiyle paylaşın",
    commercialSeekerBadge: "TİCARİ ALAN ARAYAN",
    commercialSeekerTitle: "Ticari paylaşım alanı arıyorum",
    commercialSeekerSubtitle: "Size uygun ticari alanı bulun",
    commercialModalTitleOwner: "Mekan türünü seçin",
    commercialModalTitleSeeker: "Aradığınız mekan türünü seçin",
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
    signOutConfirmTitle: "Sign Out",
    signOutConfirmMsg: "Are you sure you want to sign out?",
    signOutConfirmCancel: "Cancel",
    signOutConfirmOk: "Sign Out",
    getStarted: "Get Started",
    heroBadge: "Trusted by 127,000+ verified users across 52 cities",
    heroLine1: "Let Your Space Earn for You, and Open Doors for Others.",
    heroLine2: "",
    heroLine3: "",
    heroP: "Share your home, office or commercial space with confidence — or easily find the space you need.",
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
      { label: "Sleep Schedule",  value: 94,  color: "from-orange-500 to-orange-600" },
      { label: "Cleanliness",     value: 100, color: "from-amber-500 to-orange-700" },
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
      { step: "04", title: "Move In",            desc: "Sign digitally, get community support, and settle into your perfect home.",                    icon: "⌂", gradient: "from-orange-500 to-orange-600" },
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
    footerDesc: "Safely share your home, office or commercial space — or easily find the space you need.",
    footerLinks: [
      { title: "Options", links: ["Find a Room / Roommate", "Share Your Home", "Find Commercial Space", "Share Your Commercial Space"] },
      { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
      { title: "Support", links: ["Help Center", "Safety", "Terms", "Privacy", "Cookies"] },
      { title: "App", links: ["App Store", "Google Play"] },
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
    landlordBadge: "LANDLORD",
    tenantBadge: "ROOM SEEKER",
    landlordSubtext: "Find a verified roommate",
    tenantSubtext: "Find your ideal home",
    commercialOwnerBadge: "COMMERCIAL SPACE OWNER",
    commercialOwnerTitle: "I have a commercial space to share",
    commercialOwnerSubtitle: "Share your space with the right person",
    commercialSeekerBadge: "LOOKING FOR COMMERCIAL SPACE",
    commercialSeekerTitle: "I'm looking for a commercial space",
    commercialSeekerSubtitle: "Find the right space for you",
    commercialModalTitleOwner: "Select space type",
    commercialModalTitleSeeker: "Select the space you're looking for",
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
    signOutConfirmTitle: "خروج از حساب",
    signOutConfirmMsg: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
    signOutConfirmCancel: "انصراف",
    signOutConfirmOk: "خروج",
    getStarted: "شروع کن",
    heroBadge: "مورد اعتماد بیش از ۱۲۷,۰۰۰ کاربر تأیید شده در ۵۲ شهر",
    heroLine1: "فضای شما برایتان درآمد بسازد، برای دیگران فرصت.",
    heroLine2: "",
    heroLine3: "",
    heroP: "خانه، آفیس یا فضای تجاری خود را با اطمینان به اشتراک بگذارید یا فضای مورد نیازتان را به راحتی پیدا کنید.",
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
      { label: "برنامه خواب",      value: 94,  color: "from-orange-500 to-orange-600" },
      { label: "نظافت",            value: 100, color: "from-amber-500 to-orange-700" },
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
      { step: "۰۴", title: "اسباب‌کشی کنید",           desc: "دیجیتالی امضا کنید، پشتیبانی جامعه بگیرید و در خانه کامل خود مستقر شوید.",                                               icon: "⌂", gradient: "from-orange-500 to-orange-600" },
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
    footerDesc: "خانه، دفتر یا فضای تجاری خود را با اطمینان به اشتراک بگذارید یا فضای موردنیاز خود را به‌راحتی پیدا کنید.",
    footerLinks: [
      { title: "گزینه‌ها",    links: ["اتاق یا هم‌خانه پیدا کن", "خانه‌ات را به اشتراک بگذار", "مکان تجاری پیدا کن", "مکان تجاری‌ات را به اشتراک بگذار"] },
      { title: "شرکت",     links: ["درباره ما", "وبلاگ", "مشاغل", "مطبوعات", "تماس"] },
      { title: "پشتیبانی", links: ["مرکز کمک", "امنیت", "شرایط استفاده", "حریم خصوصی", "کوکی‌ها"] },
      { title: "اپلیکیشن", links: ["App Store", "Google Play"] },
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
    landlordBadge: "صاحب‌خانه",
    tenantBadge: "هم‌خانه‌یاب",
    landlordSubtext: "هم‌خانه معتبر پیدا کن",
    tenantSubtext: "خانه ایده‌آلت را بیاب",
    commercialOwnerBadge: "صاحب فضای تجاری",
    commercialOwnerTitle: "فضای تجاری دارم، می‌خواهم به اشتراک بگذارم",
    commercialOwnerSubtitle: "فضای خود را با فرد مناسب به اشتراک بگذارید",
    commercialSeekerBadge: "دنبال فضای تجاری",
    commercialSeekerTitle: "دنبال فضای تجاری مشترک می‌گردم",
    commercialSeekerSubtitle: "فضای مناسب خود را پیدا کنید",
    commercialModalTitleOwner: "نوع مکان را انتخاب کنید",
    commercialModalTitleSeeker: "نوع مکان مورد نظر را انتخاب کنید",
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
    signOutConfirmTitle: "Abmelden",
    signOutConfirmMsg: "Sind Sie sicher, dass Sie sich abmelden möchten?",
    signOutConfirmCancel: "Abbrechen",
    signOutConfirmOk: "Abmelden",
    getStarted: "Loslegen",
    heroBadge: "Von über 127.000 verifizierten Nutzern in 52 Städten vertraut",
    heroLine1: "Lassen Sie Ihren Raum für Sie verdienen und für andere zur Chance werden.",
    heroLine2: "",
    heroLine3: "",
    heroP: "Teilen Sie Ihr Zuhause, Büro oder Ihre Gewerbefläche sicher — oder finden Sie ganz einfach den Raum, den Sie suchen.",
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
      { label: "Schlafrhythmus",             value: 94,  color: "from-orange-500 to-orange-600" },
      { label: "Sauberkeit",                 value: 100, color: "from-amber-500 to-orange-700" },
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
      { step: "04", title: "Einziehen",             desc: "Digital unterzeichnen, Community-Support erhalten und in Ihr Traumzuhause einziehen.",                                                     icon: "⌂", gradient: "from-orange-500 to-orange-600" },
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
    footerDesc: "Teilen Sie Ihr Zuhause, Ihr Büro oder Ihre Gewerbefläche sicher — oder finden Sie ganz einfach den Raum, den Sie brauchen.",
    footerLinks: [
      { title: "Optionen",    links: ["Zimmer / Mitbewohner finden", "Dein Zuhause teilen", "Gewerbefläche finden", "Gewerbefläche teilen"] },
      { title: "Unternehmen", links: ["Über uns", "Blog", "Karriere", "Presse", "Kontakt"] },
      { title: "Support",    links: ["Hilfe-Center", "Sicherheit", "Nutzungsbedingungen", "Datenschutz", "Cookies"] },
      { title: "App", links: ["App Store", "Google Play"] },
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
    landlordBadge: "VERMIETER",
    tenantBadge: "MITBEWOHNER SUCHER",
    landlordSubtext: "Mitbewohner finden",
    tenantSubtext: "Traumzuhause finden",
    commercialOwnerBadge: "GEWERBERAUM-EIGENTÜMER",
    commercialOwnerTitle: "Ich habe einen Gewerberaum zum Teilen",
    commercialOwnerSubtitle: "Teilen Sie Ihren Raum mit der richtigen Person",
    commercialSeekerBadge: "GEWERBERAUM GESUCHT",
    commercialSeekerTitle: "Ich suche einen gemeinsamen Gewerberaum",
    commercialSeekerSubtitle: "Finden Sie den richtigen Raum für Sie",
    commercialModalTitleOwner: "Raumtyp auswählen",
    commercialModalTitleSeeker: "Gesuchten Raumtyp auswählen",
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
    signOutConfirmTitle: "تسجيل الخروج",
    signOutConfirmMsg: "هل أنت متأكد من أنك تريد تسجيل الخروج؟",
    signOutConfirmCancel: "إلغاء",
    signOutConfirmOk: "خروج",
    getStarted: "ابدأ الآن",
    heroBadge: "موثوق به من قِبَل أكثر من ١٢٧,٠٠٠ مستخدم موثَّق في ٥٢ مدينة",
    heroLine1: "دع مساحتك تربح لك، وتفتح فرصة للآخرين.",
    heroLine2: "",
    heroLine3: "",
    heroP: "شارك منزلك أو مكتبك أو مساحتك التجارية بثقة، أو ابحث بسهولة عن المساحة التي تحتاجها.",
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
      { label: "جدول النوم",          value: 94,  color: "from-orange-500 to-orange-600" },
      { label: "النظافة",             value: 100, color: "from-amber-500 to-orange-700" },
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
      { step: "٠٤", title: "انتقل للسكن",              desc: "وقِّع رقمياً، واحصل على دعم المجتمع، واستقرّ في منزلك المثالي.",                                                       icon: "⌂", gradient: "from-orange-500 to-orange-600" },
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
    footerDesc: "شارك منزلك أو مكتبك أو مساحتك التجارية بأمان، أو ابحث بسهولة عن المساحة التي تحتاجها.",
    footerLinks: [
      { title: "الخيارات",  links: ["ابحث عن غرفة أو شريك سكن", "شارك منزلك", "إيجاد مساحة تجارية", "شارك مساحتك التجارية"] },
      { title: "الشركة",  links: ["من نحن", "المدوّنة", "الوظائف", "الصحافة", "اتصل بنا"] },
      { title: "الدعم",   links: ["مركز المساعدة", "الأمان", "شروط الاستخدام", "الخصوصية", "ملفات تعريف الارتباط"] },
      { title: "التطبيق", links: ["App Store", "Google Play"] },
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
    landlordBadge: "صاحب المنزل",
    tenantBadge: "باحث عن شريك سكن",
    landlordSubtext: "ابحث عن شريك سكن موثَّق",
    tenantSubtext: "ابحث عن منزلك المثالي",
    commercialOwnerBadge: "صاحب مساحة تجارية",
    commercialOwnerTitle: "لدي مساحة تجارية أريد مشاركتها",
    commercialOwnerSubtitle: "شارك مساحتك مع الشخص المناسب",
    commercialSeekerBadge: "أبحث عن مساحة تجارية",
    commercialSeekerTitle: "أبحث عن مساحة تجارية مشتركة",
    commercialSeekerSubtitle: "اعثر على المساحة المناسبة لك",
    commercialModalTitleOwner: "اختر نوع المكان",
    commercialModalTitleSeeker: "اختر نوع المكان الذي تبحث عنه",
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
    signOutConfirmTitle: "Выйти",
    signOutConfirmMsg: "Вы уверены, что хотите выйти?",
    signOutConfirmCancel: "Отмена",
    signOutConfirmOk: "Выйти",
    getStarted: "Начать",
    heroBadge: "Поиск соседей по комнате",
    heroLine1: "Пусть ваше пространство приносит доход вам и возможности другим.",
    heroLine2: "",
    heroLine3: "",
    heroP: "Делитесь своим домом, офисом или коммерческим пространством уверенно — или легко найдите нужное вам место.",
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
      { label: "Расписание",  value: 94,  color: "from-orange-500 to-orange-600" },
      { label: "Чистота",     value: 100, color: "from-amber-500 to-orange-700" },
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
      { step: "04", title: "Въезжайте",           desc: "Подпишите договор и обустраивайтесь в новом доме", icon: "⌂", gradient: "from-orange-500 to-orange-600" },
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
    footerDesc: "Безопасно делитесь своим домом, офисом или коммерческим пространством — или легко найдите нужное вам место.",
    footerLinks: [
      { title: "Опции",   links: ["Найти комнату / соседа", "Поделиться жильём", "Найти коммерческое помещение", "Поделиться коммерческим помещением"] },
      { title: "Компания",  links: ["О нас", "Блог", "Карьера", "Пресса", "Контакты"] },
      { title: "Поддержка", links: ["Центр помощи", "Безопасность", "Условия", "Конфиденциальность", "Cookies"] },
      { title: "Приложение", links: ["App Store", "Google Play"] },
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
    landlordBadge: "ХОЗЯИН",
    tenantBadge: "Ищу соседа",
    landlordSubtext: "Найди проверенного соседа",
    tenantSubtext: "Найди своё идеальное жильё",
    commercialOwnerBadge: "ВЛАДЕЛЕЦ КОММЕРЧЕСКОЙ ПЛОЩАДИ",
    commercialOwnerTitle: "У меня есть коммерческая площадь для совместного использования",
    commercialOwnerSubtitle: "Поделитесь площадью с подходящим человеком",
    commercialSeekerBadge: "ИЩУ КОММЕРЧЕСКУЮ ПЛОЩАДЬ",
    commercialSeekerTitle: "Ищу коммерческую площадь для совместного использования",
    commercialSeekerSubtitle: "Найдите подходящую площадь для себя",
    commercialModalTitleOwner: "Выберите тип помещения",
    commercialModalTitleSeeker: "Выберите тип помещения, которое ищете",
  },
};
type Lang = keyof typeof translations;

// ─── Static structural data ───────────────────────────────────────────────────
const stories = [
  { id: 1, name: "Add Story", isAdd: true,  gradient: "from-stone-200 to-stone-300",    initials: "+",  city: "",       online: false },
  { id: 2, name: "Sarah K.", isAdd: false, gradient: "from-pink-500 to-rose-600",      initials: "SK", city: "Berlin", online: true  },
  { id: 3, name: "Ahmed M.", isAdd: false, gradient: "from-blue-500 to-indigo-600",    initials: "AM", city: "Dubai",  online: true  },
  { id: 4, name: "Yuki T.",  isAdd: false, gradient: "from-violet-500 to-purple-600",  initials: "YT", city: "Tokyo",  online: false },
  { id: 5, name: "Maria L.", isAdd: false, gradient: "from-amber-500 to-orange-700",   initials: "ML", city: "BCN",    online: true  },
  { id: 6, name: "James W.", isAdd: false, gradient: "from-orange-500 to-orange-600",   initials: "JW", city: "London", online: false },
  { id: 7, name: "Priya S.", isAdd: false, gradient: "from-rose-500 to-pink-600",      initials: "PS", city: "Mumbai", online: true  },
  { id: 8, name: "Carlos R.",isAdd: false, gradient: "from-amber-500 to-blue-600",      initials: "CR", city: "Madrid", online: true  },
  { id: 9, name: "Lena M.",  isAdd: false, gradient: "from-purple-500 to-violet-600",  initials: "LM", city: "Paris",  online: false },
];


const HELP_CENTER_TEXTS = new Set([
  "Yardım Merkezi", "Help Center", "Hilfe-Center",
  "مرکز کمک", "مركز المساعدة", "Центр помощи",
]);

const COOKIE_TEXTS = new Set([
  "Çerezler", "Cookies", "کوکی‌ها",
  "ملفات تعريف الارتباط", "Cookies",
]);

const PRIVACY_TEXTS = new Set([
  "Gizlilik", "Privacy", "Datenschutz",
  "حریم خصوصی", "الخصوصية", "Конфиденциальность",
  "Политика конфиденциальности",
]);

const TERMS_TEXTS = new Set([
  "Kullanım Koşulları", "Terms", "Nutzungsbedingungen",
  "شرایط استفاده", "شروط الاستخدام", "Условия использования", "Условия",
]);

const SECURITY_TEXTS = new Set([
  "Güvenlik", "Safety", "Sicherheit",
  "امنیت", "الأمان", "Безопасность",
]);

const MOBILE_APP_TEXTS = new Set([
  "App Store", "Google Play",
]);

const BLOG_TEXTS = new Set([
  "Blog",        // TR, EN, DE
  "وبلاگ",       // FA
  "المدوّنة",    // AR (with shadda diacritic on the د)
  "Блог",        // RU
]);

const ROOM_SEEKER_TEXTS = new Set([
  "Oda / Ev Arkadaşı Bul", "Find a Room / Roommate", "اتاق یا هم‌خانه پیدا کن", "ابحث عن غرفة أو شريك سكن", "Zimmer / Mitbewohner finden", "Найти комнату / соседа",
]);

const SHARE_HOME_TEXTS = new Set([
  "Evini Paylaş", "Share Your Home", "خانه‌ات را به اشتراک بگذار", "شارك منزلك", "Dein Zuhause teilen", "Поделиться жильём",
]);

const COMMERCIAL_SEEKER_TEXTS = new Set([
  "Ticari Alan Bul", "Find Commercial Space", "مکان تجاری پیدا کن", "إيجاد مساحة تجارية", "Gewerbefläche finden", "Найти коммерческое помещение",
]);

const COMMERCIAL_OWNER_TEXTS = new Set([
  "Ticari Alanını Paylaş", "Share Your Commercial Space", "مکان تجاری‌ات را به اشتراک بگذار", "شارك مساحتك التجارية", "Gewerbefläche teilen", "Поделиться коммерческим помещением",
]);


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
    available: "Now", gradient: "from-amber-500 via-orange-700 to-rose-700",
    verified: true, amenities: ["Pool", "Gym", "Concierge"], tag: "New",
    tagColor: "from-amber-500 to-orange-700", gender: "Male",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3, title: "Charming Room near Bosphorus", city: "Istanbul", country: "Turkey",
    price: 450, sym: "USD" as const, rating: 4.7, reviews: 204, type: "Private Room",
    available: "May 25", gradient: "from-orange-500 via-orange-600 to-amber-700",
    verified: false, amenities: ["WiFi", "Kitchen", "Sea View"], tag: "Best Value",
    tagColor: "from-orange-500 to-orange-600", gender: "Any",
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
    available: "Jun 20", gradient: "from-orange-500 via-amber-600 to-sky-700",
    verified: true, amenities: ["WiFi", "Balcony", "Tram"], tag: "New",
    tagColor: "from-orange-500 to-amber-600", gender: "Male",
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
    available: "Jun 8", gradient: "from-amber-500 via-orange-600 to-orange-700",
    verified: false, amenities: ["WiFi", "Kitchen", "Art"], tag: "Best Value",
    tagColor: "from-amber-500 to-orange-600", gender: "Any",
    image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 12, title: "Penthouse Suite, Downtown Dubai", city: "Dubai", country: "UAE",
    price: 1800, sym: "USD" as const, rating: 5.0, reviews: 29, type: "Entire Flat",
    available: "Now", gradient: "from-yellow-500 via-amber-500 to-orange-700",
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

const commercialTypeOptionsByLang: Record<string, { slug: string; emoji: string; label: string }[]> = {
  tr: [
    { slug: "ofis", emoji: "🏢", label: "Ofis" },
    { slug: "dukkan", emoji: "🏪", label: "Dükkan" },
    { slug: "berber-koltugu", emoji: "💈", label: "Berber Koltuğu" },
    { slug: "atolye", emoji: "🔧", label: "Atölye" },
    { slug: "depo", emoji: "📦", label: "Depo" },
    { slug: "mutfak", emoji: "🍳", label: "Mutfak" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "İçerik Stüdyosu" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Eğitim Sınıfı" },
    { slug: "otopark", emoji: "🚗", label: "Otopark" },
    { slug: "ticari-adres", emoji: "📮", label: "Ticari Adres" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Kuaför / Güzellik Salonu" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Muayenehane / Klinik" },
    { slug: "spor-alani", emoji: "🏋️", label: "Spor Alanı" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Etkinlik Salonu" },
  ],
  en: [
    { slug: "ofis", emoji: "🏢", label: "Office" },
    { slug: "dukkan", emoji: "🏪", label: "Shop" },
    { slug: "berber-koltugu", emoji: "💈", label: "Barber Chair" },
    { slug: "atolye", emoji: "🔧", label: "Workshop" },
    { slug: "depo", emoji: "📦", label: "Warehouse" },
    { slug: "mutfak", emoji: "🍳", label: "Kitchen" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "Content Studio" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Training Room" },
    { slug: "otopark", emoji: "🚗", label: "Parking" },
    { slug: "ticari-adres", emoji: "📮", label: "Business Address" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Hair Salon / Beauty Salon" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Clinic / Doctor's Office" },
    { slug: "spor-alani", emoji: "🏋️", label: "Sports Facility" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Event Hall" },
  ],
  fa: [
    { slug: "ofis", emoji: "🏢", label: "آفیس" },
    { slug: "dukkan", emoji: "🏪", label: "دکان" },
    { slug: "berber-koltugu", emoji: "💈", label: "صندلی آرایشگاه" },
    { slug: "atolye", emoji: "🔧", label: "کارگاه" },
    { slug: "depo", emoji: "📦", label: "انبار" },
    { slug: "mutfak", emoji: "🍳", label: "آشپزخانه" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "استودیو تولید محتوا" },
    { slug: "egitim-sinifi", emoji: "📚", label: "کلاس آموزشی" },
    { slug: "otopark", emoji: "🚗", label: "پارکینگ" },
    { slug: "ticari-adres", emoji: "📮", label: "آدرس تجاری" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "آرایشگاه / سالن زیبایی" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "مطب / کلینیک" },
    { slug: "spor-alani", emoji: "🏋️", label: "فضای ورزشی" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "سالن مراسمات" },
  ],
  ar: [
    { slug: "ofis", emoji: "🏢", label: "مكتب" },
    { slug: "dukkan", emoji: "🏪", label: "محل تجاري" },
    { slug: "berber-koltugu", emoji: "💈", label: "كرسي حلاقة" },
    { slug: "atolye", emoji: "🔧", label: "ورشة" },
    { slug: "depo", emoji: "📦", label: "مستودع" },
    { slug: "mutfak", emoji: "🍳", label: "مطبخ" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "استوديو المحتوى" },
    { slug: "egitim-sinifi", emoji: "📚", label: "قاعة تدريب" },
    { slug: "otopark", emoji: "🚗", label: "موقف سيارات" },
    { slug: "ticari-adres", emoji: "📮", label: "عنوان تجاري" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "صالون تجميل" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "عيادة / كلينيك" },
    { slug: "spor-alani", emoji: "🏋️", label: "مرفق رياضي" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "قاعة الفعاليات" },
  ],
  de: [
    { slug: "ofis", emoji: "🏢", label: "Büro" },
    { slug: "dukkan", emoji: "🏪", label: "Laden" },
    { slug: "berber-koltugu", emoji: "💈", label: "Friseurstuhl" },
    { slug: "atolye", emoji: "🔧", label: "Werkstatt" },
    { slug: "depo", emoji: "📦", label: "Lager" },
    { slug: "mutfak", emoji: "🍳", label: "Küche" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "Content-Studio" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Schulungsraum" },
    { slug: "otopark", emoji: "🚗", label: "Parkplatz" },
    { slug: "ticari-adres", emoji: "📮", label: "Geschäftsadresse" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Friseursalon / Schönheitssalon" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Praxis / Klinik" },
    { slug: "spor-alani", emoji: "🏋️", label: "Sportstätte" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Veranstaltungssaal" },
  ],
  ru: [
    { slug: "ofis", emoji: "🏢", label: "Офис" },
    { slug: "dukkan", emoji: "🏪", label: "Магазин" },
    { slug: "berber-koltugu", emoji: "💈", label: "Кресло парикмахера" },
    { slug: "atolye", emoji: "🔧", label: "Мастерская" },
    { slug: "depo", emoji: "📦", label: "Склад" },
    { slug: "mutfak", emoji: "🍳", label: "Кухня" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "Студия контента" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Учебный класс" },
    { slug: "otopark", emoji: "🚗", label: "Парковка" },
    { slug: "ticari-adres", emoji: "📮", label: "Бизнес-адрес" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Салон красоты" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Клиника / Кабинет врача" },
    { slug: "spor-alani", emoji: "🏋️", label: "Спортивный объект" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Зал мероприятий" },
  ],
};

const commercialTypeDescriptions: Record<string, { owner: Record<string, string>; seeker: Record<string, string> }> = {
  ofis: {
    owner: {
      tr: "Ofisinizdeki boş masa, oda veya alanları serbest çalışanlar, girişimler veya diğer şirketlerle paylaşarak kullanılmayan alanınızdan gelir elde edebilirsiniz.",
      en: "If you have empty desks, rooms or space in your office, you can share them with freelancers, startups or other companies and earn income from your unused space.",
      fa: "اگر در دفتر کارتان میز، اتاق یا فضای خالی دارید، می‌توانید آن را با فریلنسرها، استارتاپ‌ها یا شرکت‌های دیگر به اشتراک بگذارید و از فضای بلااستفاده خود درآمد کسب کنید.",
      ar: "إذا كان لديك مكاتب أو غرف أو مساحات فارغة في مكتبك، يمكنك مشاركتها مع المستقلين والشركات الناشئة وكسب دخل من المساحة غير المستخدمة.",
      de: "Wenn Sie freie Schreibtische, Räume oder Flächen in Ihrem Büro haben, können Sie diese mit Freelancern, Startups oder anderen Unternehmen teilen.",
      ru: "Если в вашем офисе есть свободные столы, комнаты или площади, вы можете сдавать их фрилансерам, стартапам или другим компаниям.",
    },
    seeker: {
      tr: "Çalışma alanı, masa veya ortak ofise ihtiyacınız varsa ilan verin, alan sahipleri sizi bulsun.",
      en: "Need a desk, room or shared office? Post a listing and let space owners find you.",
      fa: "اگر برای کار، استارتاپ یا شرکت خود به میز، اتاق یا دفتر اشتراکی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا با شما تماس بگیرند.",
      ar: "هل تحتاج إلى مكتب مشترك أو مساحة عمل؟ انشر إعلانك ودع أصحاب المساحات يجدونك.",
      de: "Benötigen Sie einen Schreibtisch oder ein Shared Office? Inserieren Sie und lassen Sie Raumeigentümer Sie finden.",
      ru: "Нужен стол, комната или коворкинг? Разместите объявление и позвольте владельцам пространства найти вас.",
    },
  },
  dukkan: {
    owner: {
      tr: "Dükkanınızın kullanılmayan bir bölümü varsa veya başka bir işletmeyle iş birliği yapacak kadar alanınız varsa, bu alanı başkalarıyla paylaşabilirsiniz.",
      en: "If part of your shop is unused or you have enough space to collaborate with another business, you can share it with others.",
      fa: "اگر بخشی از مغازه شما بدون استفاده مانده یا فضای کافی برای همکاری با کسب‌وکار دیگری دارید، می‌توانید آن را با دیگران به اشتراک بگذارید.",
      ar: "إذا كان جزء من محلك غير مستخدم أو لديك مساحة كافية للتعاون مع عمل آخر، يمكنك مشاركته مع الآخرين.",
      de: "Wenn ein Teil Ihres Ladens ungenutzt ist oder Sie genug Platz für die Zusammenarbeit mit einem anderen Unternehmen haben, können Sie ihn mit anderen teilen.",
      ru: "Если часть вашего магазина пустует или у вас достаточно места для сотрудничества с другим бизнесом, вы можете поделиться им.",
    },
    seeker: {
      tr: "İşletmeniz için dükkan alanı arıyorsanız ilan verin, dükkan sahipleri sizinle iletişime geçsin.",
      en: "Looking for shop space for your business? Post a listing and let shop owners reach out to you.",
      fa: "اگر برای راه‌اندازی یا گسترش کسب‌وکار خود به بخشی از یک مغازه نیاز دارید، آگهی ثبت کنید تا صاحبان مغازه شما را پیدا کنند.",
      ar: "هل تبحث عن مساحة محل لعملك؟ انشر إعلانك ودع أصحاب المحلات يتواصلون معك.",
      de: "Suchen Sie Ladenfläche für Ihr Unternehmen? Inserieren Sie und lassen Sie Eigentümer auf Sie zukommen.",
      ru: "Ищете торговую площадь для бизнеса? Разместите объявление и позвольте владельцам магазинов связаться с вами.",
    },
  },
  "berber-koltugu": {
    owner: {
      tr: "Berber salonunuzda boş koltuk varsa, bunu diğer berberlere kiralayabilir veya ortaklık şeklinde kullanımlarına sunabilirsiniz.",
      en: "If you have an empty chair in your barbershop, you can rent it to other barbers or make it available on a shared basis.",
      fa: "اگر در سالن آرایشگری خود صندلی خالی دارید، می‌توانید آن را به آرایشگران دیگر اجاره دهید یا به صورت اشتراکی در اختیارشان قرار دهید.",
      ar: "إذا كان لديك كرسي فارغ في صالون الحلاقة، يمكنك تأجيره لحلاقين آخرين أو إتاحته على أساس مشترك.",
      de: "Wenn Sie in Ihrem Friseursalon einen freien Stuhl haben, können Sie ihn an andere Friseure vermieten oder gemeinschaftlich nutzen lassen.",
      ru: "Если в вашей парикмахерской есть свободное кресло, вы можете сдать его другим мастерам.",
    },
    seeker: {
      tr: "Bir salonda berber koltuğuna ihtiyacınız varsa ilan verin, uygun salonlar sizi bulsun.",
      en: "Need a barber chair in a salon? Post a listing and let suitable salons find you.",
      fa: "اگر آرایشگر هستید و به صندلی در یک سالن نیاز دارید، آگهی ثبت کنید تا سالن‌های مناسب با شما تماس بگیرند.",
      ar: "هل تحتاج إلى كرسي حلاقة في صالون؟ انشر إعلانك ودع الصالونات المناسبة تجدك.",
      de: "Benötigen Sie einen Friseurstuhl in einem Salon? Inserieren Sie und lassen Sie passende Salons Sie finden.",
      ru: "Нужно кресло в парикмахерской? Разместите объявление и позвольте подходящим салонам найти вас.",
    },
  },
  atolye: {
    owner: {
      tr: "Atölyenizde boş alan veya başkalarının kullanabileceği ekipmanlarınız varsa, bunları diğer kişi veya işletmelerle paylaşabilirsiniz.",
      en: "If you have empty space or equipment that others can use in your workshop, you can share it with other individuals or businesses.",
      fa: "اگر در کارگاه خود فضای خالی یا تجهیزات قابل استفاده برای دیگران دارید، می‌توانید آن را با افراد یا کسب‌وکارهای دیگر به اشتراک بگذارید.",
      ar: "إذا كان لديك مساحة فارغة أو معدات يمكن للآخرين استخدامها في ورشتك، يمكنك مشاركتها مع أفراد أو شركات أخرى.",
      de: "Wenn Sie in Ihrer Werkstatt freie Flächen oder Geräte haben, die andere nutzen können, können Sie diese teilen.",
      ru: "Если в вашей мастерской есть свободное место или оборудование для других, вы можете поделиться ими.",
    },
    seeker: {
      tr: "Atölye veya çalışma alanına ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need a workshop or work space? Post a listing and let owners contact you.",
      fa: "اگر برای تولید، تعمیر یا فعالیت‌های فنی به کارگاه نیاز دارید، آگهی ثبت کنید تا صاحبان کارگاه شما را پیدا کنند.",
      ar: "هل تحتاج إلى ورشة عمل؟ انشر إعلانك ودع أصحاب المساحات يتواصلون معك.",
      de: "Benötigen Sie eine Werkstatt oder Arbeitsfläche? Inserieren Sie und lassen Sie Eigentümer Sie kontaktieren.",
      ru: "Нужна мастерская или рабочее пространство? Разместите объявление и позвольте владельцам связаться с вами.",
    },
  },
  depo: {
    owner: {
      tr: "Ürün depolamaya uygun bir deponuz veya alanınız varsa ve bir kısmı boşsa, bunu başkalarıyla paylaşabilirsiniz.",
      en: "If you have a warehouse or suitable space for storing goods and part of it is empty, you can share it with others.",
      fa: "اگر انبار یا فضای مناسبی برای نگهداری کالا دارید و بخشی از آن خالی است، می‌توانید آن را با دیگران به اشتراک بگذارید.",
      ar: "إذا كان لديك مستودع أو مساحة مناسبة لتخزين البضائع وجزء منها فارغ، يمكنك مشاركته مع الآخرين.",
      de: "Wenn Sie ein Lager oder geeigneten Stauraum haben und ein Teil davon leer ist, können Sie ihn mit anderen teilen.",
      ru: "Если у вас есть склад или подходящее место для хранения товаров и часть его пустует, вы можете поделиться им.",
    },
    seeker: {
      tr: "Depolama alanına ihtiyacınız varsa ilan verin, depo sahipleri sizi bulsun.",
      en: "Need storage space for your goods? Post a listing and let warehouse owners find you.",
      fa: "اگر برای نگهداری کالا یا تجهیزات به فضای انبار نیاز دارید، آگهی ثبت کنید تا صاحبان انبار با شما تماس بگیرند.",
      ar: "هل تحتاج إلى مستودع لتخزين بضاعتك؟ انشر إعلانك ودع أصحاب المستودعات يجدونك.",
      de: "Benötigen Sie Lagerfläche für Ihre Waren? Inserieren Sie und lassen Sie Lagereigentümer Sie finden.",
      ru: "Нужно складское помещение? Разместите объявление и позвольте владельцам складов найти вас.",
    },
  },
  mutfak: {
    owner: {
      tr: "Endüstriyel mutfağınız veya yemek hazırlama alanınız belirli saat veya günlerde kullanılmıyorsa, aşçılar, catering firmaları veya yemek markaları ile paylaşabilirsiniz.",
      en: "If your commercial kitchen or food preparation space is unused at certain hours or days, you can share it with chefs, caterers or food brands.",
      fa: "اگر آشپزخانه صنعتی یا فضای آماده‌سازی غذا یا رستوران دارید و در ساعات یا روزهای خاص بدون استفاده است، می‌توانید آن را با آشپزها، کترینگ‌ها یا برندهای غذایی به اشتراک بگذارید.",
      ar: "إذا كانت مطبخك التجاري أو مساحة تحضير الطعام غير مستخدمة في أوقات أو أيام معينة، يمكنك مشاركتها مع الطهاة وشركات تقديم الطعام.",
      de: "Wenn Ihre Großküche oder Speisenzubereitungsfläche zu bestimmten Zeiten ungenutzt ist, können Sie sie mit Köchen, Caterern oder Lebensmittelmarken teilen.",
      ru: "Если ваша коммерческая кухня или пространство для приготовления еды пустует в определённые часы или дни, вы можете поделиться им с поварами или кейтеринговыми компаниями.",
    },
    seeker: {
      tr: "Gıda işletmeniz için endüstriyel mutfağa ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need a commercial kitchen for your food business? Post a listing and let space owners reach out.",
      fa: "اگر برای کسب‌وکار غذایی یا کترینگ به آشپزخانه صنعتی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا شما را پیدا کنند.",
      ar: "هل تحتاج إلى مطبخ صناعي لمشروعك الغذائي؟ انشر إعلانك ودع أصحاب المساحات يتواصلون معك.",
      de: "Benötigen Sie eine Gewerbeküche für Ihr Food-Business? Inserieren Sie und lassen Sie Eigentümer Sie kontaktieren.",
      ru: "Нужна промышленная кухня для вашего пищевого бизнеса? Разместите объявление и позвольте владельцам связаться с вами.",
    },
  },
  "icerik-studyosu": {
    owner: {
      tr: "Stüdyonuz, fotoğraf çekim alanınız veya içerik üretim ekipmanlarınız varsa, bunları içerik üreticileri, fotoğrafçılar ve kameramanlarla paylaşabilirsiniz.",
      en: "If you have a studio, photography space or content production equipment, you can make them available to content creators, photographers and videographers.",
      fa: "اگر استودیو، فضای عکاسی یا تجهیزات تولید محتوا دارید، می‌توانید آن را در اختیار تولیدکنندگان محتوا، عکاسان و فیلم‌برداران قرار دهید.",
      ar: "إذا كان لديك استوديو أو مساحة تصوير أو معدات إنتاج محتوى، يمكنك إتاحتها لمنتجي المحتوى والمصورين.",
      de: "Wenn Sie ein Studio, einen Fotobereich oder Inhaltsproduktionsausrüstung haben, können Sie diese Kreativen, Fotografen und Kameraleuten zur Verfügung stellen.",
      ru: "Если у вас есть студия, фотопространство или оборудование для создания контента, вы можете предоставить их контент-мейкерам, фотографам и видеографам.",
    },
    seeker: {
      tr: "Fotoğraf, video veya içerik üretimi için stüdyoya ihtiyacınız varsa ilan verin, stüdyo sahipleri sizi bulsun.",
      en: "Need a studio for photography, video or podcasting? Post a listing and let studio owners find you.",
      fa: "اگر برای عکاسی، فیلم‌برداری، پادکست یا تولید محتوا به استودیو نیاز دارید، آگهی ثبت کنید تا صاحبان استودیو با شما تماس بگیرند.",
      ar: "هل تحتاج إلى استوديو للتصوير أو إنتاج المحتوى؟ انشر إعلانك ودع أصحاب الاستوديوهات يجدونك.",
      de: "Benötigen Sie ein Studio für Foto, Video oder Podcasting? Inserieren Sie und lassen Sie Studioeigentümer Sie finden.",
      ru: "Нужна студия для фото, видео или подкастов? Разместите объявление и позвольте владельцам студий найти вас.",
    },
  },
  "egitim-sinifi": {
    owner: {
      tr: "Sınıfınız veya eğitim alanınız bazı gün veya saatlerde boşsa, kurs, atölye ve seminerler için başkalarıyla paylaşabilirsiniz.",
      en: "If your classroom or training space is empty on certain days or hours, you can share it with others for courses, workshops and seminars.",
      fa: "اگر کلاس یا فضای آموزشی شما در بعضی روزها یا ساعات خالی است، می‌توانید آن را برای برگزاری دوره‌ها، کارگاه‌ها و سمینارها با دیگران به اشتراک بگذارید.",
      ar: "إذا كانت قاعة الدراسة أو مساحة التدريب فارغة في أيام أو ساعات معينة، يمكنك مشاركتها مع الآخرين للدورات والورش والندوات.",
      de: "Wenn Ihr Klassenzimmer oder Schulungsraum an bestimmten Tagen oder Stunden leer steht, können Sie ihn für Kurse, Workshops und Seminare mit anderen teilen.",
      ru: "Если ваш класс или учебное пространство пустует в определённые дни или часы, вы можете поделиться им для проведения курсов, мастер-классов и семинаров.",
    },
    seeker: {
      tr: "Kurs veya atölye için eğitim alanına ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need a space for classes or workshops? Post a listing and let space owners contact you.",
      fa: "اگر برای برگزاری کلاس، دوره یا کارگاه به فضای آموزشی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا شما را پیدا کنند.",
      ar: "هل تحتاج إلى فضاء تعليمي لإقامة دوراتك؟ انشر إعلانك ودع أصحاب المساحات يتواصلون معك.",
      de: "Benötigen Sie einen Raum für Kurse oder Workshops? Inserieren Sie und lassen Sie Eigentümer Sie kontaktieren.",
      ru: "Нужно помещение для занятий или воркшопов? Разместите объявление и позвольте владельцам связаться с вами.",
    },
  },
  otopark: {
    owner: {
      tr: "Otopark olarak kullanılabilecek fazla alanınız varsa, bunu başkalarıyla paylaşabilir ve kullanılmayan alanınızdan gelir elde edebilirsiniz.",
      en: "If you have extra space that can be used as a parking area, you can share it with others and earn income from your unused space.",
      fa: "اگر فضای اضافی دارید که می‌توان از آن به عنوان پارکینگ استفاده کرد، می‌توانید آن را با دیگران به اشتراک بگذارید و از فضای بلااستفاده خود درآمد کسب کنید.",
      ar: "إذا كان لديك مساحة إضافية يمكن استخدامها كموقف سيارات، يمكنك مشاركتها مع الآخرين وكسب دخل من المساحة غير المستخدمة.",
      de: "Wenn Sie zusätzlichen Platz haben, der als Parkplatz genutzt werden kann, können Sie ihn mit anderen teilen und Einnahmen erzielen.",
      ru: "Если у вас есть дополнительное пространство, которое можно использовать как парковку, вы можете поделиться им и получать доход.",
    },
    seeker: {
      tr: "Aracınız için park yeri arıyorsanız ilan verin, park yeri sahipleri sizi bulsun.",
      en: "Need parking for your vehicle? Post a listing and let parking owners find you.",
      fa: "اگر برای خودرو یا موتورسیکلت خود به جای پارک نیاز دارید، آگهی ثبت کنید تا صاحبان پارکینگ با شما تماس بگیرند.",
      ar: "هل تحتاج إلى موقف سيارة؟ انشر إعلانك ودع أصحاب المواقف يجدونك.",
      de: "Benötigen Sie einen Parkplatz für Ihr Fahrzeug? Inserieren Sie und lassen Sie Parkplatzeigentümer Sie finden.",
      ru: "Нужна парковка для вашего автомобиля? Разместите объявление и позвольте владельцам парковок найти вас.",
    },
  },
  "ticari-adres": {
    owner: {
      tr: "Şirket tescili veya posta alımı için ticari adres sağlayabiliyorsanız, bu hizmetleri başkalarıyla paylaşabilirsiniz.",
      en: "If you can provide a business address for company registration or receiving mail, you can share this service with others.",
      fa: "اگر امکان ارائه آدرس تجاری برای ثبت شرکت یا دریافت مرسولات را دارید، می‌توانید این خدمات را با دیگران به اشتراک بگذارید.",
      ar: "إذا كان بإمكانك توفير عنوان تجاري لتسجيل الشركات أو استلام البريد، يمكنك مشاركة هذه الخدمة مع الآخرين.",
      de: "Wenn Sie eine Geschäftsadresse für die Unternehmensregistrierung oder den Postempfang anbieten können, können Sie diesen Service mit anderen teilen.",
      ru: "Если вы можете предоставить юридический адрес для регистрации компании или получения почты, вы можете поделиться этой услугой с другими.",
    },
    seeker: {
      tr: "Şirket kaydı veya posta için ticari adrese ihtiyacınız varsa ilan verin, uygun hizmet sağlayıcılar sizi bulsun.",
      en: "Need a business address for registration or mail? Post a listing and let providers find you.",
      fa: "اگر برای ثبت شرکت یا دریافت مرسولات به آدرس تجاری نیاز دارید، آگهی ثبت کنید تا ارائه‌دهندگان مناسب شما را پیدا کنند.",
      ar: "هل تحتاج إلى عنوان تجاري لتسجيل شركتك؟ انشر إعلانك ودع مقدمي الخدمة يجدونك.",
      de: "Benötigen Sie eine Geschäftsadresse für Ihre Firmenanmeldung? Inserieren Sie und lassen Sie Anbieter Sie finden.",
      ru: "Нужен юридический адрес для регистрации компании? Разместите объявление и позвольте провайдерам найти вас.",
    },
  },
  "kuafor-guzellik-salonu": {
    owner: {
      tr: "Güzellik salonunuzda boş koltuk, oda veya alan varsa, bunları kuaförler ve güzellik uzmanlarıyla paylaşabilirsiniz.",
      en: "If you have empty chairs, rooms or space in your beauty salon, you can share them with hairdressers and beauty professionals.",
      fa: "اگر در سالن زیبایی خود صندلی، اتاق یا فضای خالی دارید، می‌توانید آن را با آرایشگران و متخصصان زیبایی به اشتراک بگذارید.",
      ar: "إذا كان لديك كراسي أو غرف أو مساحات فارغة في صالون التجميل، يمكنك مشاركتها مع مصففي الشعر وخبراء التجميل.",
      de: "Wenn Sie in Ihrem Schönheitssalon freie Stühle, Räume oder Flächen haben, können Sie diese mit Friseuren und Schönheitsprofis teilen.",
      ru: "Если в вашем салоне красоты есть свободные кресла, комнаты или пространство, вы можете поделиться ими с парикмахерами и специалистами по красоте.",
    },
    seeker: {
      tr: "Güzellik salonunda koltuk veya çalışma alanına ihtiyacınız varsa ilan verin, uygun salonlar sizi bulsun.",
      en: "Need a chair or workspace in a beauty salon? Post a listing and let suitable salons find you.",
      fa: "اگر آرایشگر یا متخصص زیبایی هستید و به صندلی یا فضای کاری در یک سالن نیاز دارید، آگهی ثبت کنید تا سالن‌های مناسب با شما تماس بگیرند.",
      ar: "هل تحتاج إلى كرسي أو مساحة عمل في صالون تجميل؟ انشر إعلانك ودع الصالونات المناسبة تجدك.",
      de: "Benötigen Sie einen Stuhl oder Arbeitsplatz in einem Schönheitssalon? Inserieren Sie und lassen Sie passende Salons Sie finden.",
      ru: "Нужно кресло или рабочее место в салоне красоты? Разместите объявление и позвольте подходящим салонам найти вас.",
    },
  },
  "muayenehane-klinik": {
    owner: {
      tr: "Muayenehane veya kliniğiniz büyükse ve başka bir doktor ya da uzmanın odalardan birini kullanabilmesi mümkünse, alanınızı başkalarıyla paylaşabilirsiniz.",
      en: "If your clinic or medical office is large and another doctor or specialist can use one of its rooms, you can share your space with others.",
      fa: "اگر مطب یا کلینیک شما بزرگ است و امکان استفاده یک پزشک یا متخصص دیگر از یکی از فضاها یا اتاق‌های آن وجود دارد، می‌توانید فضای خود را با دیگران به اشتراک بگذارید.",
      ar: "إذا كانت عيادتك أو مركزك الطبي كبيراً ويمكن لطبيب أو متخصص آخر استخدام أحد غرفه، يمكنك مشاركة مساحتك مع الآخرين.",
      de: "Wenn Ihre Praxis oder Klinik groß ist und ein anderer Arzt oder Spezialist einen der Räume nutzen kann, können Sie Ihren Raum mit anderen teilen.",
      ru: "Если ваш медицинский кабинет или клиника большие и другой врач или специалист может использовать одну из комнат, вы можете поделиться своим пространством.",
    },
    seeker: {
      tr: "Muayene odası veya klinik alanına ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need an examination room or clinic space? Post a listing and let clinic owners contact you.",
      fa: "اگر پزشک یا متخصص هستید و به اتاق معاینه یا فضای درمانی نیاز دارید، آگهی ثبت کنید تا صاحبان مطب و کلینیک شما را پیدا کنند.",
      ar: "هل تحتاج إلى غرفة فحص أو مساحة طبية؟ انشر إعلانك ودع أصحاب العيادات يتواصلون معك.",
      de: "Benötigen Sie einen Untersuchungsraum oder Klinikfläche? Inserieren Sie und lassen Sie Klinikbetreiber Sie kontaktieren.",
      ru: "Нужен кабинет или клиническое пространство? Разместите объявление и позвольте владельцам клиник связаться с вами.",
    },
  },
  "spor-alani": {
    owner: {
      tr: "Spor salonunuz, futbol sahanız veya başka bir spor alanınız belirli saat ya da günlerde kullanılmıyorsa, antrenörler, takımlar ve sporcularla paylaşarak boş zamanlarınızdan gelir elde edebilirsiniz.",
      en: "If you have a gym, football pitch, sports hall or any other sports facility that is unused at certain hours or days, you can share it with coaches, teams and athletes and earn income from your idle time.",
      fa: "اگر باشگاه، زمین فوتبال، سالن ورزشی یا هر فضای ورزشی دیگری دارید که در برخی ساعات یا روزها بدون استفاده است، می‌توانید آن را با مربیان، تیم‌ها و ورزشکاران به اشتراک بگذارید و از زمان‌های خالی مجموعه خود درآمد کسب کنید.",
      ar: "إذا كان لديك صالة رياضية أو ملعب كرة قدم أو أي مرفق رياضي آخر غير مستخدم في أوقات أو أيام معينة، يمكنك مشاركته مع المدربين والفرق والرياضيين وكسب دخل من الأوقات الفارغة.",
      de: "Wenn Ihr Fitnessstudio, Fußballplatz, Sporthalle oder eine andere Sportstätte zu bestimmten Zeiten oder Tagen ungenutzt ist, können Sie sie mit Trainern, Teams und Sportlern teilen und Einnahmen erzielen.",
      ru: "Если ваш спортзал, футбольное поле, спортивный зал или другой спортивный объект пустует в определённые часы или дни, вы можете поделиться им с тренерами, командами и спортсменами.",
    },
    seeker: {
      tr: "Antrenman veya spor etkinliği için alan arıyorsanız ilan verin, alan sahipleri sizi bulsun.",
      en: "Need a gym or sports facility for training or classes? Post a listing and let owners find you.",
      fa: "اگر برای تمرین، برگزاری کلاس یا فعالیت ورزشی به سالن یا زمین ورزشی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا با شما تماس بگیرند.",
      ar: "هل تحتاج إلى صالة أو ملعب رياضي؟ انشر إعلانك ودع أصحاب المرافق يجدونك.",
      de: "Benötigen Sie eine Sporthalle oder ein Spielfeld? Inserieren Sie und lassen Sie Eigentümer Sie finden.",
      ru: "Нужен зал или спортивная площадка? Разместите объявление и позвольте владельцам найти вас.",
    },
  },
  "etkinlik-salonu": {
    owner: {
      tr: "Düğün, doğum günü, konferans veya diğer etkinlikler için uygun bir salon, bahçe veya alanınız varsa ve bazı günler boşsa, bunu başkalarıyla paylaşarak gelirinizi artırabilirsiniz.",
      en: "If you have a hall, garden or suitable space for weddings, birthdays, conferences or other events and it is empty on some days, you can share it with others and earn income from your space.",
      fa: "اگر سالن، باغ یا فضای مناسبی برای برگزاری عروسی، تولد، همایش یا سایر مراسم و رویدادها دارید و در برخی روزها خالی است، می‌توانید آن را با دیگران به اشتراک بگذارید و از فضای خود درآمد کسب کنید.",
      ar: "إذا كان لديك قاعة أو حديقة أو مساحة مناسبة لإقامة حفلات الأعراس وأعياد الميلاد والمؤتمرات أو الفعاليات الأخرى وكانت فارغة في بعض الأيام، يمكنك مشاركتها مع الآخرين وكسب دخل.",
      de: "Wenn Sie einen Saal, Garten oder geeigneten Raum für Hochzeiten, Geburtstage, Konferenzen oder andere Veranstaltungen haben und dieser an manchen Tagen leer steht, können Sie ihn mit anderen teilen.",
      ru: "Если у вас есть зал, сад или подходящее пространство для свадеб, дней рождения, конференций или других мероприятий, и оно пустует в некоторые дни, вы можете поделиться им с другими.",
    },
    seeker: {
      tr: "Düğün, doğum günü veya etkinlik için salon arıyorsanız ilan verin, salon sahipleri sizinle iletişime geçsin.",
      en: "Need a venue for a wedding, event or gathering? Post a listing and let hall owners reach out.",
      fa: "اگر برای برگزاری عروسی، تولد، همایش یا سایر مراسم به سالن مناسب نیاز دارید، آگهی ثبت کنید تا صاحبان سالن شما را پیدا کنند.",
      ar: "هل تحتاج إلى قاعة لحفل أو فعالية؟ انشر إعلانك ودع أصحاب القاعات يتواصلون معك.",
      de: "Benötigen Sie einen Saal für eine Hochzeit oder Veranstaltung? Inserieren Sie und lassen Sie Saalbetreiber Sie kontaktieren.",
      ru: "Нужен зал для свадьбы или мероприятия? Разместите объявление и позвольте владельцам залов связаться с вами.",
    },
  },
};

const commercialConfirmLabels: Record<string, { continue: string; cancel: string }> = {
  tr: { continue: "Devam Et", cancel: "İptal" },
  en: { continue: "Continue", cancel: "Cancel" },
  fa: { continue: "ادامه", cancel: "انصراف" },
  ar: { continue: "متابعة", cancel: "إلغاء" },
  de: { continue: "Weiter", cancel: "Abbrechen" },
  ru: { continue: "Продолжить", cancel: "Отмена" },
};

const thisWeekLabel: Record<string, string> = {
  tr: "Bu Hafta",
  en: "This Week",
  fa: "این هفته",
  ar: "هذا الأسبوع",
  de: "Diese Woche",
  ru: "На этой неделе",
};

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

// ─── Notification item ────────────────────────────────────────────────────────
interface NotifItem {
  id: string;
  type: "new_listing";
  city: string;
  district: string | null;
  rent: number | null;
  currency: string | null;
  listingType: string;
  avatar_url: string | null;
  display_name: string | null;
  createdAt: number;
  read: boolean;
}

interface MsgNotifItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  createdAt: string;
}

// ─── Supabase listing type ─────────────────────────────────────────────────────
interface SupabaseListing {
  id: string;
  type: string;
  city: string;
  district: string | null;
  rent: number | null;
  currency: string | null;
  photos: string[] | null;
  house_type: string | null;
  rooms: number | null;
  smoking: boolean | null;
  user_id: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
}

const listingTypeTrans: Record<string, Record<string, string>> = {
  has_place: { tr: "Ev Sahibi", en: "Host", fa: "صاحب‌خانه", ar: "صاحب المنزل", de: "Vermieter", ru: "Арендодатель" },
  needs_place: { tr: "Kiracı", en: "Tenant", fa: "مستأجر", ar: "مستأجر", de: "Mieter", ru: "Арендатор" },
};

interface SmartRec {
  id: string;
  type: string;
  city: string;
  country_code: string | null;
  rent: number | null;
  max_budget: number | null;
  currency: string | null;
  photos: string[] | null;
  house_type: string | null;
  rooms: number | null;
  seeker_age: string | null;
  occupation: string | null;
  gender_preference: string | null;
  seeker_gender: string | null;
  user_id: string;
  listing_category: string | null;
}

export default function Home() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, signOut: handleSignOut } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showAuthPromptModal, setShowAuthPromptModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showLangTooltip, setShowLangTooltip] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [msgNotifications, setMsgNotifications] = useState<MsgNotifItem[]>([]);

  // ── PWA install banner ────────────────────────────────────────────────────
  const [pwaPrompt, setPwaPrompt] = useState<Event | null>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [pwaIsIos, setPwaIsIos] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("sefira-pwa-dismissed")) return;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    if (isIos) {
      setPwaIsIos(true);
      setShowPwaBanner(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e);
      setShowPwaBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function dismissPwaBanner() {
    localStorage.setItem("sefira-pwa-dismissed", "1");
    setShowPwaBanner(false);
  }

  async function triggerPwaInstall() {
    if (!pwaPrompt) return;
    (pwaPrompt as BeforeInstallPromptEvent).prompt();
    const { outcome } = await (pwaPrompt as BeforeInstallPromptEvent).userChoice;
    if (outcome === "accepted") dismissPwaBanner();
  }

  // ── Hero video: resume on tab focus ──────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        video.play().catch(() => {});
      }
    };
    const handleFocus = () => {
      video.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // ── Hero badge counting animation ─────────────────────────────────────────
  const [countUsers, setCountUsers] = useState(0);
  const [countStars, setCountStars] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCountUsers(Math.floor(eased * 127));
      setCountStars(parseFloat((eased * 4.9).toFixed(1)));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  // ── Hero scroll parallax ──────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const badgeTopParallax = useTransform(scrollY, [0, 600], [0, -20]);
  const badgeBottomParallax = useTransform(scrollY, [0, 600], [0, 18]);

  // ── Scroll detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Restore scroll position after back-navigation from a listing ──────────
  useEffect(() => {
    const saved = sessionStorage.getItem("sefira-scroll");
    if (!saved) return;
    sessionStorage.removeItem("sefira-scroll");
    const top = parseInt(saved, 10);
    if (!top) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
    });
  }, []);

  // ── Restore scroll position (homeScrollPosition) ─────────────────────────
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('homeScrollPosition')
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' })
        sessionStorage.removeItem('homeScrollPosition')
      }, 50)
    }
  }, []);

  // ── Safety net: never let a stale overflow lock survive into this page ────
  useEffect(() => {
    document.body.style.overflow = "";
  }, []);

  // ── Lock body scroll when profile drawer is open ──────────────────────────
  useEffect(() => {
    document.body.style.overflow = profileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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

  // ── Load persisted notifications from localStorage ───────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sefira-notifications");
      if (stored) setNotifications(JSON.parse(stored));
      const unread = localStorage.getItem("sefira-notifications-unread");
      if (unread) setUnreadCount(parseInt(unread, 10) || 0);
    } catch { /* ignore */ }
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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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

  // ── Commercial space type-selector modal ─────────────────────────────────
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [commercialMode, setCommercialMode] = useState<'owner' | 'seeker' | null>(null);
  const [selectedTypeForConfirm, setSelectedTypeForConfirm] = useState<string | null>(null);

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

  // ── Load saved/dismissed IDs from storage ─────────────────────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sefira-saved") || "[]");
      setSavedRecIds(saved);
      const dismissed = JSON.parse(sessionStorage.getItem("sefira-dismissed") || "[]");
      setDismissedRecIds(dismissed);
    } catch { /* ignore */ }
  }, []);

  // ── Fetch smart recommendations ──────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const SMART_REC_SELECT = `id, type, city, country_code, rent, max_budget, currency, photos, house_type, rooms, seeker_age, occupation, gender_preference, seeker_gender, user_id, listing_category`;

    // Build reverse map: lowercased localized country name -> ISO-3166-1 alpha-2 code.
    // Covers all 6 app locales so profile.country matches regardless of how it was stored.
    function buildCountryReverseMap(): Record<string, string> {
      const locales = ["tr", "en", "fa", "ar", "de", "ru"];
      const map: Record<string, string> = {};
      // All alpha-2 codes (A–Z × A–Z that are valid regions)
      for (let i = 65; i <= 90; i++) {
        for (let j = 65; j <= 90; j++) {
          const code = String.fromCharCode(i) + String.fromCharCode(j);
          for (const locale of locales) {
            try {
              const dn = new Intl.DisplayNames([locale], { type: "region" });
              const name = dn.of(code);
              // Intl.DisplayNames returns the code itself when it's not a valid region
              if (name && name !== code) map[name.toLowerCase().trim()] = code;
            } catch { /* ignore */ }
          }
        }
      }
      return map;
    }

    async function fetchRecent(dismissed: string[]) {
      const { data, error } = await supabase
        .from("listings")
        .select(SMART_REC_SELECT)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) console.error("SmartRec fetchRecent error:", error.message);
      return (data as unknown as SmartRec[] | null)?.filter((r) => !dismissed.includes(r.id)) ?? [];
    }

    async function fetchRecs() {
      const dismissed: string[] = (() => {
        try { return JSON.parse(sessionStorage.getItem("sefira-dismissed") || "[]"); } catch { return []; }
      })();

      if (!user) {
        const recs = await fetchRecent(dismissed);
        if (active) setSmartRecs(recs);
        return;
      }

      const { data: userListings } = await supabase
        .from("listings")
        .select("type, city, country_code, max_budget, gender_preference")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .limit(1);

      if (!userListings || userListings.length === 0) {
        // No listing: try to match by country code resolved from profile country name
        const { data: profile } = await supabase
          .from("profiles")
          .select("country")
          .eq("user_id", user.id)
          .single();

        let recs: SmartRec[] = [];
        if (profile?.country) {
          const reverseMap = buildCountryReverseMap();
          const code = reverseMap[profile.country.toLowerCase().trim()];
          if (code) {
            const { data, error } = await supabase
              .from("listings")
              .select(SMART_REC_SELECT)
              .eq("is_deleted", false)
              .eq("country_code", code)
              .neq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(12);
            if (error) console.error("SmartRec country query error:", error.message);
            recs = ((data as unknown as SmartRec[] | null) ?? []).filter((r) => !dismissed.includes(r.id)).slice(0, 6);
          }
        }
        // Fallback to most recent if country lookup failed or returned nothing
        if (recs.length === 0) recs = await fetchRecent(dismissed);
        if (active) setSmartRecs(recs);
        return;
      }

      const mine = userListings[0];
      let q = supabase
        .from("listings")
        .select(SMART_REC_SELECT)
        .eq("is_deleted", false)
        .neq("user_id", user.id)
        .ilike("city", mine.city)
        .order("created_at", { ascending: false })
        .limit(12);

      if (mine.type === "has_place") {
        // Residential rows use type='needs_place'; commercial rows have no `type` but set needs_place=true
        q = q.or("type.eq.needs_place,needs_place.eq.true");
        if (mine.gender_preference && mine.gender_preference !== "any") q = q.eq("seeker_gender", mine.gender_preference);
      } else {
        // Residential rows use type='has_place'; commercial rows have no `type` but set has_place=true
        q = q.or("type.eq.has_place,has_place.eq.true");
        if (mine.max_budget) q = q.lte("rent", mine.max_budget);
      }

      const { data, error } = await q;
      if (error) console.error("SmartRec city query error:", error.message);
      let recs = ((data as unknown as SmartRec[] | null) ?? []).filter((r) => !dismissed.includes(r.id)).slice(0, 6);
      // Fallback to most recent if city-match query returned nothing
      if (recs.length === 0) recs = await fetchRecent(dismissed);
      if (active) setSmartRecs(recs);
    }

    fetchRecs();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── City filter for LatestListings ───────────────────────────────────────
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const listingsRef = useRef<HTMLDivElement>(null);

  function handleCityClick(cityName: string) {
    setFilterCity(cityName);
    listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Existing state ────────────────────────────────────────────────────────
  const [likedListings, setLikedListings] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const { lang, setLang } = useLang();
  const commercialTypeOptions = commercialTypeOptionsByLang[lang] ?? commercialTypeOptionsByLang.tr;

  // ── Smart Recommendations ─────────────────────────────────────────────────
  const [smartRecs, setSmartRecs] = useState<SmartRec[]>([]);
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | 'residential' | 'commercial'>('all');
  const [savedRecIds, setSavedRecIds] = useState<string[]>([]);
  const [dismissedRecIds, setDismissedRecIds] = useState<string[]>([]);
  const [recAvatarMap, setRecAvatarMap] = useState<Record<string, string | null>>({});
  const [activeRecIndex, setActiveRecIndex] = useState(0);
  const recScrollRef = useRef<HTMLDivElement>(null);

  // ── Fetch avatars for needs_place smart recs ─────────────────────────────
  useEffect(() => {
    const ids = smartRecs.filter((r) => r.type === "needs_place").map((r) => r.user_id).filter(Boolean);
    if (ids.length === 0) return;
    supabase
      .from("profiles")
      .select("user_id, avatar_url")
      .in("user_id", ids)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string | null> = {};
        for (const p of data) map[p.user_id] = p.avatar_url ?? null;
        setRecAvatarMap(map);
      });
  }, [smartRecs]);

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

  // ── Latest listings from Supabase (notifications only) ──────────────────
  useEffect(() => {
    supabase
      .from("listings")
      .select(`
        id, type, city, district, rent, currency, photos,
        house_type, rooms, smoking, furnished, current_residents,
        user_id,
        profiles(display_name, avatar_url)
      `)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (!data) return;
        const incoming = data as unknown as SupabaseListing[];

        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newItems: NotifItem[] = incoming
            .filter((l) => !existingIds.has(l.id))
            .map((l) => ({
              id: l.id,
              type: "new_listing" as const,
              city: l.city,
              district: l.district,
              rent: l.rent,
              currency: l.currency,
              listingType: l.type,
              avatar_url: l.profiles?.avatar_url ?? null,
              display_name: l.profiles?.display_name ?? null,
              createdAt: Date.now(),
              read: false,
            }));
          if (newItems.length === 0) return prev;
          const merged = [...newItems, ...prev];
          try {
            localStorage.setItem("sefira-notifications", JSON.stringify(merged));
            const newUnread = merged.filter((n) => !n.read).length;
            localStorage.setItem("sefira-notifications-unread", String(newUnread));
            setUnreadCount(newUnread);
          } catch { /* ignore */ }
          return merged;
        });
      });
  }, []);

  // ── Poll for unread peer messages (every 15s when logged in) ────────────
  useEffect(() => {
    if (!user) return;

    async function checkUnread() {
      const res = await fetch("/api/messages/unread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user!.id }),
      });
      const result = await res.json();
      if (result.notifications) {
        setMsgNotifications(result.notifications);
      }
    }

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

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
    if (user) router.push("/choose-listing-type");
    else setShowListingModal(true);
  };

  useEffect(() => {
    const openCommercial = new URLSearchParams(window.location.search).get("openCommercial");
    if (openCommercial === "owner" || openCommercial === "seeker") {
      setCommercialMode(openCommercial);
      setShowCommercialModal(true);
      router.replace("/");
    }
  }, []);

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
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden" dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"} style={{ overscrollBehavior: "none" }}>
      <style>{`
        @keyframes sefira-kenburns {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
      `}</style>

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
                  background: 'linear-gradient(135deg, #F97316, #ea580c)',
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

            {/* Notifications bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  const opening = !notifOpen;
                  setNotifOpen(opening);
                  setLangMenuOpen(false);
                  setCurrencyMenuOpen(false);
                  setProfileMenuOpen(false);
                  if (opening) {
                    // Mark listing notifications as read
                    setNotifications((prev) => {
                      const updated = prev.map((n) => ({ ...n, read: true }));
                      try { localStorage.setItem("sefira-notifications", JSON.stringify(updated)); } catch { /* ignore */ }
                      return updated;
                    });
                    setUnreadCount(0);
                    try { localStorage.setItem("sefira-notifications-unread", "0"); } catch { /* ignore */ }
                    // Message notifications remain until individually clicked
                  }
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                aria-label="Bildirimler"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {(unreadCount + msgNotifications.length) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {(unreadCount + msgNotifications.length) > 9 ? "9+" : (unreadCount + msgNotifications.length)}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute top-full mt-2 right-0 z-[100] bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden w-80 animate-dropdown-slide">
                  <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                    <p className="text-sm font-black text-stone-800">
                      {lang === "tr" ? "Yeni İlanlar" : lang === "fa" ? "آگهی‌های جدید" : lang === "ar" ? "إعلانات جديدة" : lang === "de" ? "Neue Anzeigen" : lang === "ru" ? "Новые объявления" : "New Listings"}
                    </p>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          setNotifications([]);
                          setUnreadCount(0);
                          try {
                            localStorage.setItem("sefira-notifications", "[]");
                            localStorage.setItem("sefira-notifications-unread", "0");
                          } catch { /* ignore */ }
                        }}
                        className="text-[10px] font-bold text-stone-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                      >
                        {lang === "tr" ? "Tümünü Temizle" : lang === "fa" ? "پاک کردن همه" : lang === "ar" ? "مسح الكل" : lang === "de" ? "Alle löschen" : lang === "ru" ? "Очистить всё" : "Clear All"}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {/* ── Unread peer messages section ── */}
                    {msgNotifications.length > 0 && (
                      <div className="border-b border-stone-100 pb-1">
                        <p className="text-[10px] font-black text-stone-400 px-4 pt-2.5 pb-1 uppercase tracking-wider">
                          {lang === "tr" ? "💬 Yeni Mesajlar" : lang === "fa" ? "💬 پیام‌های جدید" : lang === "ar" ? "💬 رسائل جديدة" : lang === "de" ? "💬 Neue Nachrichten" : lang === "ru" ? "💬 Новые сообщения" : "💬 New Messages"}
                        </p>
                        {msgNotifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              fetch("/api/messages/mark-read", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ conversationId: notif.conversationId, userId: user!.id }),
                              });
                              setMsgNotifications((prev) =>
                                prev.filter((n) => n.conversationId !== notif.conversationId)
                              );
                              setNotifOpen(false);
                              router.push(`/messages?convId=${notif.conversationId}`);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors text-left"
                          >
                            {notif.senderAvatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={notif.senderAvatar}
                                className="w-9 h-9 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                                alt=""
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
                                {notif.senderName[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-stone-800 truncate">{notif.senderName}</p>
                              <p className="text-[11px] text-stone-500 truncate">{notif.content}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* ── Listing notifications section ── */}
                    {notifications.length === 0 && msgNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-stone-400">
                        {lang === "tr" ? "Henüz bildirim yok" : lang === "fa" ? "هیچ اعلانی یافت نشد" : lang === "ar" ? "لا توجد إشعارات بعد" : lang === "de" ? "Noch keine Benachrichtigungen" : lang === "ru" ? "Нет уведомлений" : "No notifications yet"}
                      </div>
                    ) : notifications.length === 0 ? null : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-stone-50 last:border-0 transition-colors ${!notif.read ? "bg-orange-50" : "hover:bg-stone-50"}`}
                        >
                          {notif.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={notif.avatar_url} className="w-8 h-8 rounded-full object-cover border-2 border-orange-200 flex-shrink-0" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-bold border-2 border-orange-200 flex-shrink-0">
                              {notif.display_name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${notif.listingType === "has_place" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                                {listingTypeTrans[notif.listingType]?.[lang] || listingTypeTrans[notif.listingType]?.["tr"] || notif.listingType}
                              </span>
                              <span className="text-xs text-stone-600 font-medium truncate">
                                {notif.display_name || (lang === "tr" ? "Kullanıcı" : "User")}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 truncate mt-0.5">
                              {notif.city}{notif.district ? ` / ${notif.district}` : ""}
                            </p>
                            {notif.rent && notif.currency && (
                              <p className="text-xs font-bold text-orange-500 mt-0.5">{notif.rent} {notif.currency}/ay</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const updated = notifications.filter((n) => n.id !== notif.id);
                              setNotifications(updated);
                              const newUnread = updated.filter((n) => !n.read).length;
                              setUnreadCount(newUnread);
                              try {
                                localStorage.setItem("sefira-notifications", JSON.stringify(updated));
                                localStorage.setItem("sefira-notifications-unread", String(newUnread));
                              } catch { /* ignore */ }
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded-full text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
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
          {/* Overlay */}
          <div
            onClick={() => setProfileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 40,
              opacity: profileMenuOpen ? 1 : 0,
              transition: "opacity 0.3s ease-out",
              pointerEvents: profileMenuOpen ? "auto" : "none",
            }}
          />

          {/* Drawer */}
          <div
            dir="ltr"
            style={{
              position: "fixed",
              top: 0,
              right: profileMenuOpen ? 0 : "-100%",
              width: "85%",
              maxWidth: "360px",
              height: "100dvh",
              zIndex: 50,
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              transition: "right 0.3s ease",
              boxShadow: "-4px 0 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Gradient header — fixed, NOT scrollable */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 40%, #9333EA 100%)',
                padding: '90px 24px 32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(20px)',
              }} />

              {/* Avatar */}
              <button
                onClick={() => { setProfileMenuOpen(false); router.push("/profile"); }}
                style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #ea580c, #d97706)",
                  border: "3px solid white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "28px", color: "white",
                  overflow: "hidden", cursor: "pointer", flexShrink: 0,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  marginBottom: "12px",
                  position: "relative", zIndex: 1,
                }}
              >
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (user.user_metadata?.full_name ?? user.email ?? "U")
                    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                )}
              </button>

              <p style={{ fontWeight: 700, fontSize: "18px", color: "white", margin: "0", textAlign: "center" }}>
                {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0, textAlign: "center" }}>
                {user.email}
              </p>
            </div>

            {/* Menu items — flex: 1 1 0 + height: 0 is required for iOS Safari/PWA scroll */}
            <div style={{ flex: "1 1 0", height: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }} className="px-3 py-4 flex flex-col gap-1.5">
              <style>{`
                @keyframes drawerItemIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
                .drawer-item {
                  opacity: 0;
                  animation: drawerItemIn 0.22s ease-out forwards;
                }
              `}</style>

              {/* Edit Profile */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/profile"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '0ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-violet-400 to-purple-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Profilimi Düzenle" : lang === "fa" ? "ویرایش پروفایل" : lang === "ar" ? "تعدیل الملف الشخصی" : lang === "de" ? "Profil bearbeiten" : lang === "ru" ? "Редактировать профиль" : "Edit Profile"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Post Listing */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { handleCreateListing(); setProfileMenuOpen(false); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '40ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-orange-400 to-orange-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "İlan Ver" : lang === "fa" ? "ثبت آگهی" : lang === "ar" ? "نشر إعلان" : lang === "de" ? "Inserat aufgeben" : lang === "ru" ? "Разместить объявление" : "Post Listing"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Search */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/search-wizard"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '80ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-violet-600 to-purple-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Arama" : lang === "fa" ? "جستجو" : lang === "ar" ? "بحث" : lang === "de" ? "Suche" : lang === "ru" ? "Поиск" : "Search"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Saved */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/saved"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '120ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-blue-400 to-blue-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Kaydedilenler" : lang === "fa" ? "ذخیره‌ها" : lang === "ar" ? "المحفوظات" : lang === "de" ? "Gespeichert" : lang === "ru" ? "Сохранённые" : "Saved"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* My Listings */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/my-listings"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '160ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-orange-400 to-orange-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "İlanlarım" : lang === "fa" ? "آگهی‌های من" : lang === "ar" ? "إعلاناتی" : lang === "de" ? "Meine Inserate" : lang === "ru" ? "Мои объявления" : "My Listings"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* My Messages */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/messages"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '200ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-orange-400 to-amber-500" style={{ position: "relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {unreadSupportCount > 0 && (
                    <div style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px", borderRadius: "9999px", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                      <span style={{ color: "white", fontWeight: 700, fontSize: "10px", lineHeight: 1 }}>
                        {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
                      </span>
                    </div>
                  )}
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Mesajlarım" : lang === "fa" ? "پیام‌های من" : lang === "ar" ? "رسائلی" : lang === "de" ? "Meine Nachrichten" : lang === "ru" ? "Мои سооبщения" : "My Messages"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Reviews & Ratings */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/my-reviews"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '240ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-yellow-400 to-amber-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Yorumlarım ve Puanım" : lang === "fa" ? "کامنت‌ها و امتیازهای من" : lang === "ar" ? "تعلیقاتی وتقییماتی" : lang === "de" ? "Meine Bewertungen" : lang === "ru" ? "Мои отзывы и оценки" : "Reviews & Ratings"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Support */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/support-chat"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '260ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-sky-400 to-teal-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Destek" : lang === "fa" ? "پشتیبانی" : lang === "ar" ? "الدعم" : lang === "de" ? "Support" : lang === "ru" ? "Поддержка" : "Support"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Advertise */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); router.push("/advertise"); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-gray-100"
                style={{ animationDelay: '280ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {lang === "tr" ? "Reklam Ver" : lang === "fa" ? "تبلیغات" : lang === "ar" ? "الإعلانات" : lang === "de" ? "Werbung" : lang === "ru" ? "Реклама" : "Advertise"}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>

              {/* Divider */}
              <div className="h-px bg-gray-200 mx-4 my-2" />

              {/* Sign Out */}
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setProfileMenuOpen(false); setShowSignOutConfirm(true); }}
                className="drawer-item w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 group hover:bg-gray-50 active:scale-[0.97] active:bg-red-50"
                style={{ animationDelay: '240ms' }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-red-400 to-rose-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <span className="flex-1 text-left font-semibold text-gray-800 text-[15px] group-hover:text-orange-700 transition-colors">
                  {t.signOut}
                </span>
                <span className="text-gray-300 group-hover:text-orange-400 text-lg transition-transform duration-150 group-active:translate-x-1">›</span>
              </motion.button>
            </div>
          </div>
        </>
      )}

      {/* ── Sign Out Confirmation Dialog ─────────────────────────────────────── */}
      {showSignOutConfirm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div
            style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 360, direction: lang === "fa" || lang === "ar" ? "rtl" : "ltr" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 8, textAlign: "center" }}>{t.signOutConfirmTitle}</p>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>{t.signOutConfirmMsg}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setShowSignOutConfirm(false); handleSignOut(); }}
                style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "linear-gradient(to right, #ef4444, #f97316)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
              >
                {t.signOutConfirmOk}
              </button>
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                style={{ width: "100%", padding: "14px 0", borderRadius: 12, background: "white", color: "#6b7280", fontWeight: 600, fontSize: 15, border: "2px solid #e5e7eb", cursor: "pointer" }}
              >
                {t.signOutConfirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div className="min-h-screen w-full px-4 pb-4 pt-10 overflow-hidden relative bg-stone-50">

        {/* Decorative blur circles */}
        <div className="absolute w-96 h-96 rounded-full bg-orange-50 blur-3xl opacity-60 -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full bg-blue-50 blur-3xl opacity-40 bottom-0 -left-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 pt-10 pb-8 md:grid md:grid-cols-2 gap-8 items-center w-full">

          {/* ── LEFT: Typography + Wizard ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start"
          >

            {/* Pill badge */}
            <span className="inline-flex items-center bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
              {({ tr: "Alan Paylaşım Platformu", en: "Space Sharing Platform", fa: "پلتفرم اشتراک‌گذاری فضا", ar: "منصة مشاركة المساحات", de: "Plattform für Raumteilung", ru: "Платформа совместного использования" } as Record<string, string>)[lang] ?? "Space Sharing Platform"}
            </span>

            {/* Headline */}
            <AnimatedGradientText className="text-2xl font-bold px-6 py-2 mt-2">
              <span className="animate-gradient bg-gradient-to-r from-orange-600 via-amber-500 to-orange-700 bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent [--bg-size:300%]">
                {t.heroLine1} {t.heroLine2} {t.heroLine3}
              </span>
            </AnimatedGradientText>

            {/* Subtitle */}
            <p className="text-gray-500 text-base mt-3 leading-relaxed max-w-xl">
              {t.heroP}
            </p>

            {/* ── SEARCH WIZARD ─────────────────────────────────────────────── */}
            <div className="w-full mt-3">

              {wizardMode === null ? (
                <>
                  {/* CTA buttons */}
                  <div className="flex flex-col gap-3 max-w-md mx-auto px-4 my-3">
                    {/* Card 1 — Landlord */}
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -4 }}
                      onClick={() => { if (!user) { setShowAuthPromptModal(true); return; } router.push('/create-listing?type=has_place'); }}
                      className="w-full relative overflow-hidden rounded-3xl p-[17px] text-left shadow-[0_12px_40px_-12px_rgba(249,115,22,0.6)] active:scale-[0.98] transition-transform"
                      style={{ background: 'linear-gradient(135deg,#F97316 0%,#ea580c 55%,#c2410c 100%)' }}
                    >
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-xl" />
                      <div className="absolute right-8 bottom-2 w-20 h-20 bg-white/10 rounded-full blur-md" />

                      <div className="relative z-10 flex items-center gap-4">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner"
                        >
                          🏡
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wide">
                            🔑 {t.landlordBadge}
                          </span>
                          <p className="text-white font-black text-base leading-snug">
                            {t.optionSeekingTitle}
                          </p>
                          <p className="text-white/80 text-[13px] mt-1 font-medium">
                            {t.landlordSubtext}
                          </p>
                        </div>

                        <motion.span
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                          className="text-white text-2xl shrink-0"
                        >→</motion.span>
                      </div>
                    </motion.button>

                    {/* Card 2 — Tenant */}
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.25 }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -4 }}
                      onClick={() => { if (!user) { setShowAuthPromptModal(true); return; } router.push('/create-listing?type=needs_place'); }}
                      className="w-full relative overflow-hidden rounded-3xl p-[17px] text-left shadow-[0_12px_40px_-12px_rgba(79,70,229,0.6)] active:scale-[0.98] transition-transform"
                      style={{ background: 'linear-gradient(135deg,#7C8CF8 0%,#5B6EE8 55%,#4F46E5 100%)' }}
                    >
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-xl" />
                      <div className="absolute right-8 bottom-2 w-20 h-20 bg-white/10 rounded-full blur-md" />

                      <div className="relative z-10 flex items-center gap-4">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                          className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner"
                        >
                          🔍
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wide">
                            🎒 {t.tenantBadge}
                          </span>
                          <p className="text-white font-black text-base leading-snug">
                            {t.optionOfferingTitle}
                          </p>
                          <p className="text-white/80 text-[13px] mt-1 font-medium">
                            {t.tenantSubtext}
                          </p>
                        </div>

                        <motion.span
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 }}
                          className="text-white text-2xl shrink-0"
                        >→</motion.span>
                      </div>
                    </motion.button>

                    {/* Card 3 — Commercial space owner */}
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.4 }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -4 }}
                      onClick={() => { if (!user) { setShowAuthPromptModal(true); return; } setCommercialMode('owner'); setShowCommercialModal(true); }}
                      className="w-full relative overflow-hidden rounded-3xl p-[17px] text-left shadow-[0_12px_40px_-12px_rgba(16,185,129,0.6)] active:scale-[0.98] transition-transform"
                      style={{ background: 'linear-gradient(135deg,#34D399 0%,#10B981 55%,#047857 100%)' }}
                    >
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-xl" />
                      <div className="absolute right-8 bottom-2 w-20 h-20 bg-white/10 rounded-full blur-md" />

                      <div className="relative z-10 flex items-center gap-4">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                          className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner"
                        >
                          🏢
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wide">
                            🏢 {t.commercialOwnerBadge}
                          </span>
                          <p className="text-white font-black text-base leading-snug">
                            {t.commercialOwnerTitle}
                          </p>
                          <p className="text-white/80 text-[13px] mt-1 font-medium">
                            {t.commercialOwnerSubtitle}
                          </p>
                        </div>

                        <motion.span
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: 0.5 }}
                          className="text-white text-2xl shrink-0"
                        >→</motion.span>
                      </div>
                    </motion.button>

                    {/* Card 4 — Commercial space seeker */}
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.55 }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -4 }}
                      onClick={() => { if (!user) { setShowAuthPromptModal(true); return; } setCommercialMode('seeker'); setShowCommercialModal(true); }}
                      className="w-full relative overflow-hidden rounded-3xl p-[17px] text-left shadow-[0_12px_40px_-12px_rgba(13,148,136,0.6)] active:scale-[0.98] transition-transform"
                      style={{ background: 'linear-gradient(135deg,#2DD4BF 0%,#0D9488 55%,#115E59 100%)' }}
                    >
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-xl" />
                      <div className="absolute right-8 bottom-2 w-20 h-20 bg-white/10 rounded-full blur-md" />

                      <div className="relative z-10 flex items-center gap-4">
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                          className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shrink-0 shadow-inner"
                        >
                          🔍
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wide">
                            🔍 {t.commercialSeekerBadge}
                          </span>
                          <p className="text-white font-black text-base leading-snug">
                            {t.commercialSeekerTitle}
                          </p>
                          <p className="text-white/80 text-[13px] mt-1 font-medium">
                            {t.commercialSeekerSubtitle}
                          </p>
                        </div>

                        <motion.span
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: 0.7 }}
                          className="text-white text-2xl shrink-0"
                        >→</motion.span>
                      </div>
                    </motion.button>
                  </div>
                </>

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
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
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
                                    : "border-orange-400 bg-orange-50 text-orange-800 shadow-lg shadow-orange-500/15 scale-[1.02]"
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
                              background: `linear-gradient(to right, #F97316 ${sliderPct}%, #e7e5e4 ${sliderPct}%)`,
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
          </motion.div>

          {/* ── RIGHT: Sefira promo video ──────────────────────────────────── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
            className="relative flex items-center justify-center py-8 order-first md:order-last"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto max-w-xs"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 rounded-3xl blur-2xl opacity-40 scale-110" />

              {/* Video with shimmer border + particles */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 18 } } }}
                whileHover={{ scale: 1.03 }}
                className="relative"
              >
                {/* Static border wrapper */}
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '2px solid #f97316' }}>
                  {/* Inner video container */}
                  <div style={{ position: 'relative', borderRadius: '21px', overflow: 'hidden', height: '400px' }}>
                    <video
                      ref={videoRef}
                      src="https://ceetzophaybywfuhezhv.supabase.co/storage/v1/object/public/media/IMG_1365.MP4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      poster="/hero-bg.webp"
                      className="w-full h-full object-cover"
                      style={{ animation: 'sefira-kenburns 5s ease-in-out alternate infinite' }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  </div>
                </div>
              </motion.div>

              {/* Floating badge top-left */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 18 } } }}
                whileTap={{ scale: 0.94 }}
                style={{ y: badgeTopParallax }}
                className="absolute -top-4 -left-4"
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-orange-100"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white text-sm">✓</div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{countUsers}K+</p>
                    <p className="text-[10px] text-gray-400">Verified Users</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating badge bottom-right */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 18 } } }}
                whileTap={{ scale: 0.94 }}
                style={{ y: badgeBottomParallax }}
                className="absolute -bottom-4 -right-4"
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-orange-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm">⭐</div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{countStars.toFixed(1)} Stars</p>
                    <p className="text-[10px] text-gray-400">12K+ Reviews</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Decorative dots */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/4 -right-3 w-3 h-3 bg-orange-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute bottom-1/4 -left-3 w-2 h-2 bg-pink-400 rounded-full"
              />
            </motion.div>
          </motion.div>

        </div>

      </div>

      {/* ── WEEKLY STORIES ────────────────────────────────────────────────────── */}
      {weeklyStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-5 mt-2 pt-0 pb-4">
          <p className="text-sm font-bold text-stone-800 mb-3 sm:mb-4">
            {thisWeekLabel[lang] ?? "Bu Hafta"}
          </p>
          <div
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 overscroll-x-contain"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y", overscrollBehaviorX: "contain" } as React.CSSProperties}
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
                  style={{ background: "linear-gradient(135deg, #F97316, #f59e0b, #ec4899)" }}
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
      <section className="max-w-7xl mx-auto px-5 mt-2 pt-2 pb-0 mb-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
              {t.featuredH2}
            </h2>
            <p className="text-stone-500">{t.featuredP}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {listings.map((listing, idx) => (
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
                  {...(idx === 0 ? { priority: true } : { loading: "lazy" })}
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
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-orange-700 transition-colors truncate">
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
      </section>

      {/* ── SMART RECOMMENDATIONS ─────────────────────────────────────────────── */}
      {smartRecs.length > 0 && (
        <section className="py-10 bg-white border-b border-stone-100">
          {/* Header */}
          <div className="max-w-2xl mx-auto px-4 mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-stone-900">
                {({ tr: "✨ Senin İçin Seçilenler", en: "✨ Picked For You", fa: "✨ پیشنهاد ویژه برای شما", ar: "✨ مختارة لك", de: "✨ Für dich ausgewählt", ru: "✨ Подобрано для вас" } as Record<string, string>)[lang] ?? "✨ Picked For You"}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {({ tr: "Profiline göre en uygun ilanlar", en: "Best matches based on your profile", fa: "بهترین آگهی‌ها بر اساس پروفایل شما", ar: "أفضل الإعلانات بناءً على ملفك", de: "Beste Treffer basierend auf deinem Profil", ru: "Лучшие объявления по вашему профилю" } as Record<string, string>)[lang] ?? "Best matches based on your profile"}
              </p>
            </div>
            {smartRecs.length > 3 && (
              <div className="flex items-center gap-1.5 pb-1 flex-shrink-0">
                {smartRecs.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-200 ${i === activeRecIndex ? "w-4 h-1.5 bg-orange-500" : "w-1.5 h-1.5 bg-stone-300"}`} />
                ))}
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className="max-w-2xl mx-auto px-4 mb-4 flex items-center gap-2">
            {([
              { value: "all", label: ({ tr: "Tümü", en: "All", fa: "همه", ar: "الكل", de: "Alle", ru: "Все" } as Record<string, string>)[lang] ?? "All" },
              { value: "residential", label: "🏠 " + (({ tr: "Konut", en: "Residential", fa: "مسکونی", ar: "سكني", de: "Wohnen", ru: "Жильё" } as Record<string, string>)[lang] ?? "Residential") },
              { value: "commercial", label: "🏢 " + (({ tr: "Ticari", en: "Commercial", fa: "تجاری", ar: "تجاري", de: "Gewerbe", ru: "Коммерция" } as Record<string, string>)[lang] ?? "Commercial") },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRecommendationFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                  recommendationFilter === tab.value
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Horizontal scroll track */}
          <div
            ref={recScrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 overscroll-x-contain"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth", touchAction: "pan-x pan-y", overscrollBehaviorX: "contain" } as React.CSSProperties}
            onScroll={() => {
              const el = recScrollRef.current;
              if (!el) return;
              const firstCard = el.firstElementChild as HTMLElement | null;
              const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 272; // card + gap-4
              // RTL browsers (Chrome: negative scrollLeft, Safari: positive but reversed)
              const isRTLLang = lang === "fa" || lang === "ar";
              const rawScroll = isRTLLang ? Math.abs(el.scrollLeft) : el.scrollLeft;
              const idx = Math.round(rawScroll / cardWidth);
              setActiveRecIndex(Math.min(Math.max(idx, 0), smartRecs.length - 1));
            }}
          >
            {smartRecs.filter((rec) => {
              if (recommendationFilter === "all") return true;
              if (recommendationFilter === "commercial") return rec.listing_category === "commercial";
              return rec.listing_category === "residential" || rec.listing_category == null;
            }).map((rec, i) => {
              const isSaved = savedRecIds.includes(rec.id);
              const flagEmoji = rec.country_code && rec.country_code.length === 2
                ? String.fromCodePoint(...(rec.country_code.toUpperCase().split("").map((c: string) => 0x1F1E6 + c.charCodeAt(0) - 65)))
                : "🌍";
              const thumbnail = rec.photos?.[0] ?? null;
              const isHasPlace = rec.type === "has_place";
              const summary = isHasPlace
                ? [rec.house_type, rec.rooms ? `${rec.rooms} oda` : null].filter(Boolean).join(" · ")
                : [rec.seeker_age, rec.occupation].filter(Boolean).join(" · ");
              const priceDisplay = isHasPlace
                ? rec.rent ? `${rec.rent} ${rec.currency ?? ""}` : null
                : rec.max_budget ? `max ${rec.max_budget} ${rec.currency ?? ""}` : null;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="snap-start flex-shrink-0"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <motion.div
                    onClick={() => {
                      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString())
                      router.push(`/listings/${rec.id}`)
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-64 rounded-[24px] overflow-hidden cursor-pointer"
                    style={{ height: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
                  >
                    {/* Background image or gradient */}
                    {thumbnail ? (
                      <Image src={thumbnail} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" loading="lazy" />
                    ) : recAvatarMap[rec.user_id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={recAvatarMap[rec.user_id]!} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center ${isHasPlace ? "bg-gradient-to-br from-orange-400 to-amber-500" : "bg-gradient-to-br from-violet-500 to-blue-500"}`}>
                        {isHasPlace ? (
                          <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center text-5xl">🏠</div>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="white" className="w-20 h-20 opacity-70">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Category badge */}
                    {rec.listing_category === "commercial" ? (
                      <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                        🏢 {({ tr: "Ticari", en: "Commercial", fa: "تجاری", ar: "تجاري", de: "Gewerbe", ru: "Коммерческий" } as Record<string, string>)[lang] ?? "Commercial"}
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                        🏠 {({ tr: "Konut", en: "Residential", fa: "مسکونی", ar: "سكني", de: "Wohnen", ru: "Жильё" } as Record<string, string>)[lang] ?? "Residential"}
                      </span>
                    )}

                    {/* Info text — above the buttons */}
                    <div className="absolute bottom-[68px] left-0 right-0 px-4 pointer-events-none">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-base font-bold text-white truncate" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                          {flagEmoji} {rec.city}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white flex-shrink-0 ${isHasPlace ? "bg-emerald-500" : "bg-blue-500"}`}>
                          {listingTypeTrans[rec.type]?.[lang] ?? rec.type}
                        </span>
                      </div>
                      {priceDisplay && (
                        <p className="text-lg font-black text-orange-300" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>{priceDisplay}</p>
                      )}
                      {summary && (
                        <p className="text-xs text-white/75 truncate mt-0.5">{summary}</p>
                      )}
                    </div>

                    {/* Action buttons — overlaid at bottom of card */}
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4">
                      {/* Kaydet */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = isSaved ? savedRecIds.filter((x: string) => x !== rec.id) : [...savedRecIds, rec.id];
                          setSavedRecIds(next);
                          try { localStorage.setItem("sefira-saved", JSON.stringify(next)); } catch { /* ignore */ }
                        }}
                        className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.35)" }}
                      >
                        <svg viewBox="0 0 24 24" fill={isSaved ? "white" : "none"} stroke="white" strokeWidth="2" className="w-5 h-5">
                          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                        </svg>
                      </button>

                      {/* Mesaj Gönder */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            setShowAuth(true);
                          } else {
                            router.push(`/messages?userId=${rec.user_id}&listingId=${rec.id}`);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-full bg-orange-500 active:bg-orange-600 transition-colors"
                        style={{ boxShadow: "0 4px 16px rgba(249,115,22,0.5)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 flex-shrink-0">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <span className="text-white text-xs font-bold truncate">
                          {({ tr: "Mesaj", en: "Message", fa: "پیام", ar: "رسالة", de: "Nachricht", ru: "Написать" } as Record<string, string>)[lang] ?? "Message"}
                        </span>
                      </button>

                      {/* Geç */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = [...dismissedRecIds, rec.id];
                          setDismissedRecIds(next);
                          try { sessionStorage.setItem("sefira-dismissed", JSON.stringify(next)); } catch { /* ignore */ }
                          setSmartRecs((prev) => prev.filter((r) => r.id !== rec.id));
                          setActiveRecIndex((idx) => Math.max(0, Math.min(idx, smartRecs.length - 2)));
                        }}
                        className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.35)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── LATEST LISTINGS ───────────────────────────────────────────────────── */}
      <div ref={listingsRef}>
        <LatestListings key={lang} lang={lang} filterCity={filterCity} onClearFilter={() => setFilterCity(null)} />
      </div>

      {/* ── POPULAR CITIES ────────────────────────────────────────────────────── */}
      <PopularCities lang={lang} onCityClick={handleCityClick} />

      {/* ── LIGHT → DARK TRANSITION ───────────────────────────────────────────── */}
      <div className="h-24 bg-gradient-to-b from-stone-50 to-stone-900" />

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="bg-gradient-to-b from-stone-900 to-stone-950 border-t border-stone-700">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/25">S</div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Sefira</span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs mb-7">{t.footerDesc}</p>
              <div className="flex gap-2.5">
                <a
                  href="https://twitter.com/getsefira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Sefira on X"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 cursor-pointer hover:opacity-80"
                >
                  X
                </a>
                <a
                  href="https://linkedin.com/company/sefira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Sefira on LinkedIn"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 cursor-pointer hover:opacity-80"
                >
                  in
                </a>
                <a
                  href="https://www.instagram.com/sefira.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Sefira on Instagram"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-stone-400 hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 cursor-pointer hover:opacity-80"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://t.me/getsefira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Telegram"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 cursor-pointer hover:opacity-80"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCcvN3kYg3tYE1ongda_2fFw"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 cursor-pointer hover:opacity-80"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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
                        : COOKIE_TEXTS.has(link)
                          ? <Link href="/cookies" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                          : PRIVACY_TEXTS.has(link)
                            ? <Link href="/privacy" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                            : TERMS_TEXTS.has(link)
                              ? <Link href="/terms" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                              : SECURITY_TEXTS.has(link)
                                ? <Link href="/security" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                                : ROOM_SEEKER_TEXTS.has(link)
                                  ? <Link href="/create-listing?type=needs_place" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                                  : SHARE_HOME_TEXTS.has(link)
                                    ? <Link href="/create-listing?type=has_place" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                                    : COMMERCIAL_SEEKER_TEXTS.has(link)
                                      ? <Link href="/commercial-type-select?mode=seeker" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                                      : COMMERCIAL_OWNER_TEXTS.has(link)
                                        ? <Link href="/commercial-type-select?mode=owner" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                                        : MOBILE_APP_TEXTS.has(link)
                                          ? <Link href="/mobile-app" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
                                          : BLOG_TEXTS.has(link)
                                            ? <Link href="/blog" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</Link>
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
                COOKIE_TEXTS.has(l)
                  ? <Link key={l} href="/cookies" className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200">{l}</Link>
                  : PRIVACY_TEXTS.has(l)
                    ? <Link key={l} href="/privacy" className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200">{l}</Link>
                    : TERMS_TEXTS.has(l)
                      ? <Link key={l} href="/terms" className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200">{l}</Link>
                      : SECURITY_TEXTS.has(l)
                        ? <Link key={l} href="/security" className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200">{l}</Link>
                        : <a key={l} href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showAuth && (
        <AuthModal lang={lang} initialTab={authTab} onClose={() => { setShowAuth(false); setAuthTab('login'); }} />
      )}

      {/* ── Auth prompt modal (non-logged-in users clicking hero cards) ──────── */}
      <AnimatePresence>
        {showAuthPromptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center"
            onClick={() => setShowAuthPromptModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-3xl max-w-sm w-full mx-4 shadow-2xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAuthPromptModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
                aria-label="Kapat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="text-5xl text-center mb-4">🔐</div>

              <h3 className="text-center font-black text-stone-900 mb-2" style={{ fontSize: 22 }}>
                {({
                  tr: "Devam etmek için giriş yapın",
                  en: "Sign in to continue",
                  fa: "برای ادامه وارد شوید",
                  ar: "سجّل الدخول للمتابعة",
                  de: "Melden Sie sich an, um fortzufahren",
                  ru: "Войдите для продолжения",
                } as Record<string, string>)[lang] ?? "Sign in to continue"}
              </h3>
              <p className="text-center text-stone-500 mb-6" style={{ fontSize: 14 }}>
                {({
                  tr: "Sefira'nın tüm özelliklerinden yararlanmak için hesabınıza giriş yapın.",
                  en: "Sign in to your account to access all Sefira features.",
                  fa: "برای دسترسی به تمام امکانات سفیرا وارد حساب کاربری خود شوید.",
                  ar: "سجّل الدخول للوصول إلى جميع ميزات سفيرا.",
                  de: "Melden Sie sich an, um alle Sefira-Funktionen zu nutzen.",
                  ru: "Войдите в аккаунт для доступа ко всем функциям Sefira.",
                } as Record<string, string>)[lang] ?? "Sign in to your account to access all Sefira features."}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowAuthPromptModal(false); setAuthTab("login"); setShowAuth(true); }}
                  className="w-full py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
                >
                  {({ tr: "Giriş Yap", en: "Sign In", fa: "ورود", ar: "تسجيل الدخول", de: "Anmelden", ru: "Войти" } as Record<string, string>)[lang] ?? "Sign In"}
                </button>
                <button
                  onClick={() => { setShowAuthPromptModal(false); setAuthTab("register"); setShowAuth(true); }}
                  className="w-full py-3.5 rounded-full font-bold text-orange-600 bg-white border-2 border-orange-400 hover:bg-orange-50 active:scale-95 transition-all duration-200 text-sm"
                >
                  {({ tr: "Kayıt Ol", en: "Sign Up", fa: "ثبت نام", ar: "إنشاء حساب", de: "Registrieren", ru: "Зарегистрироваться" } as Record<string, string>)[lang] ?? "Sign Up"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              background: "linear-gradient(145deg, #F97316 0%, #ea580c 35%, #ec4899 75%, #f43f5e 100%)",
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
              background: "linear-gradient(145deg, #F97316 0%, #f59e0b 30%, #ec4899 65%, #8b5cf6 100%)",
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
                style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(249,115,22,0.55) 75%, rgba(139,92,246,0.85) 100%)" }}
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

      {/* ── PWA install banner ───────────────────────────────────────────── */}
      {showPwaBanner && (
        <div className="fixed bottom-[72px] sm:bottom-4 left-0 right-0 sm:left-4 sm:right-4 z-50 mx-0 sm:mx-auto sm:max-w-sm">
          <div className="bg-orange-500 text-white px-4 py-3 rounded-none sm:rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">📱</span>
            <p className="flex-1 text-sm font-medium leading-snug">
              {pwaIsIos
                ? "Safari'de 'Paylaş' → 'Ana Ekrana Ekle'"
                : "Sefira'yı ana ekrana ekle!"}
            </p>
            {!pwaIsIos && (
              <button
                onClick={triggerPwaInstall}
                className="flex-shrink-0 bg-white text-orange-500 text-sm font-bold px-3 py-1.5 rounded-full"
              >
                Ekle
              </button>
            )}
            <button
              onClick={dismissPwaBanner}
              aria-label="Kapat"
              className="flex-shrink-0 text-white/80 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile: fixed bottom İlan Ver bar ─────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-xl border-t border-stone-200 shadow-2xl shadow-stone-900/10">
        <button
          onClick={handleCreateListing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2"
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
                className="flex-1 border-2 border-stone-200 text-stone-700 font-black text-sm py-3 rounded-xl hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-95 transition-all duration-200"
              >
                {t.kayitOl}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Commercial space type-selector full-page screen ──────────────────── */}
      <AnimatePresence>
        {showCommercialModal && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white flex flex-col"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            {/* Orange header */}
            <div
              className="relative flex items-center px-4 shrink-0"
              style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#f97316' }}
            >
              <button
                onClick={() => setShowCommercialModal(false)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
                aria-label="Geri"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3 className="text-white font-black text-lg flex-1 text-center pr-9">
                {commercialMode === 'owner' ? t.commercialModalTitleOwner : t.commercialModalTitleSeeker}
              </h3>
            </div>

            {/* Options grid */}
            <div className="flex-1 overflow-y-auto p-5 pb-8 grid grid-cols-2 gap-3 content-start">
              {commercialTypeOptions.map((opt) => (
                <button
                  key={opt.slug}
                  onClick={() => setSelectedTypeForConfirm(opt.slug)}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-stone-200 hover:border-orange-300 hover:bg-orange-50 active:scale-95 transition-all duration-200 text-center"
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-sm font-bold text-stone-700">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Commercial type confirmation bottom sheet ─────────────────────────── */}
      <AnimatePresence>
        {selectedTypeForConfirm && (() => {
          const selectedOpt = commercialTypeOptions.find((o) => o.slug === selectedTypeForConfirm);
          if (!selectedOpt) return null;
          const mode = commercialMode === 'seeker' ? 'seeker' : 'owner';
          const descriptionSet = commercialTypeDescriptions[selectedOpt.slug]?.[mode];
          const description = descriptionSet?.[lang] ?? descriptionSet?.tr ?? "";
          const labels = commercialConfirmLabels[lang] ?? commercialConfirmLabels.tr;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTypeForConfirm(null)}
                className="fixed inset-0 bg-black/40"
                style={{ zIndex: 99999 }}
              />
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
                style={{ zIndex: 100000 }}
              >
                <div className="text-5xl text-center mb-3">{selectedOpt.emoji}</div>
                <h4 className="text-center font-bold text-[20px] text-stone-900 mb-2">{selectedOpt.label}</h4>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-6">{description}</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowCommercialModal(false);
                      router.push(`/create-commercial-listing?type=${selectedOpt.slug}&mode=${commercialMode}`);
                      setSelectedTypeForConfirm(null);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-95 transition-all duration-200"
                  >
                    {labels.continue}
                  </button>
                  <button
                    onClick={() => setSelectedTypeForConfirm(null)}
                    className="w-full border-2 border-stone-200 text-stone-700 font-black text-sm py-3 rounded-xl hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-95 transition-all duration-200"
                  >
                    {labels.cancel}
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
