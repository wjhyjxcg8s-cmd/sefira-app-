"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InstagramCTA from "@/app/components/InstagramCTA";
import PopularCities from "@/app/components/PopularCities";
import PropertyFilters from "@/app/components/PropertyFilters";
import AuthModal from "@/app/components/AuthModal";
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
    optionSeekingTitle: "Oda / Ev Arkadaşı Arıyorum",
    optionSeekingSubtitle: "Oda veya ev arkadaşı arıyorum",
    optionOfferingTitle: "Ev Arkadaşı Arıyorum",
    optionOfferingSubtitle: "Odaya sahibim, ev arkadaşı arıyorum",
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
    communityBadge: "Topluluk Akışı",
    communityH2: "Gerçek Hikayeler. Gerçek İnsanlar.",
    communityP: "127.000'den fazla üyenin yolculuğunu paylaştığı topluluğa katılın",
    likesLabel: "beğeni",
    commentsLabel: "yorum",
    shareLabel: "Paylaş",
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
    optionSeekingTitle: "I'm looking for a room / housemate",
    optionSeekingSubtitle: "Looking for a room or housemate",
    optionOfferingTitle: "I have a room and need a housemate",
    optionOfferingSubtitle: "I have a room and need a housemate",
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
    communityBadge: "Community Feed",
    communityH2: "Real Stories. Real People.",
    communityP: "Join 127,000+ members sharing their journey",
    likesLabel: "likes",
    commentsLabel: "comments",
    shareLabel: "Share",
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
    optionSeekingTitle: "دنبال اتاق یا هم‌خانه می‌گردم",
    optionSeekingSubtitle: "دنبال اتاق یا هم‌خانه می‌گردم",
    optionOfferingTitle: "اتاق دارم و دنبال هم‌خانه می‌گردم",
    optionOfferingSubtitle: "اتاق دارم و دنبال هم‌خانه می‌گردم",
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
    communityBadge: "فید جامعه",
    communityH2: "داستان‌های واقعی. مردم واقعی.",
    communityP: "به جامعه‌ای با بیش از ۱۲۷,۰۰۰ عضو بپیوندید که سفر خود را به اشتراک می‌گذارند",
    likesLabel: "لایک",
    commentsLabel: "نظر",
    shareLabel: "اشتراک‌گذاری",
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
    optionSeekingTitle: "Ich suche ein Zimmer / einen Mitbewohner",
    optionSeekingSubtitle: "Ich suche ein Zimmer oder einen Mitbewohner",
    optionOfferingTitle: "Ich habe ein Zimmer und suche einen Mitbewohner",
    optionOfferingSubtitle: "Ich habe ein Zimmer und suche einen Mitbewohner",
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
    communityBadge: "Community-Feed",
    communityH2: "Echte Geschichten. Echte Menschen.",
    communityP: "Schließen Sie sich über 127.000 Mitgliedern an, die ihre Reise teilen",
    likesLabel: "Gefällt mir",
    commentsLabel: "Kommentare",
    shareLabel: "Teilen",
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
    optionSeekingTitle: "أبحث عن غرفة أو شريك سكن",
    optionSeekingSubtitle: "أبحث عن غرفة أو شريك للسكن",
    optionOfferingTitle: "لديَّ غرفة وأبحث عن شريك سكن",
    optionOfferingSubtitle: "لديَّ غرفة وأبحث عن شريك سكن",
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
    communityBadge: "تغذية المجتمع",
    communityH2: "قصص حقيقية. أشخاص حقيقيون.",
    communityP: "انضم إلى مجتمع يضم أكثر من ١٢٧,٠٠٠ عضو يتشاركون رحلتهم",
    likesLabel: "إعجاب",
    commentsLabel: "تعليق",
    shareLabel: "مشاركة",
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
];

const trendingCities = [
  { name: "Istanbul",  country: "Turkey",      listings: "2,847", growth: "+23%", glow: "bg-orange-500/10", border: "border-orange-500/20", emoji: "🕌" },
  { name: "Berlin",    country: "Germany",     listings: "1,923", growth: "+18%", glow: "bg-blue-500/10",   border: "border-blue-500/20",   emoji: "🐻" },
  { name: "Dubai",     country: "UAE",         listings: "1,456", growth: "+31%", glow: "bg-amber-500/10",  border: "border-amber-500/20",  emoji: "🏙️" },
  { name: "Barcelona", country: "Spain",       listings: "1,234", growth: "+15%", glow: "bg-yellow-500/10", border: "border-yellow-500/20", emoji: "🏖️" },
  { name: "Amsterdam", country: "Netherlands", listings: "987",   growth: "+12%", glow: "bg-red-500/10",    border: "border-red-500/20",    emoji: "🚲" },
  { name: "London",    country: "UK",          listings: "3,201", growth: "+8%",  glow: "bg-indigo-500/10", border: "border-indigo-500/20", emoji: "🎡" },
];

const testimonialsByLang = {
  tr: [
    { name: "Ayşe Kaya",    role: "Öğrenci",             city: "İstanbul",  quote: "Sefira sayesinde 48 saatte mükemmel ev arkadaşımı buldum. Yapay zeka eşleştirmesi inanılmaz derecede doğru; aynı uyku düzeni, aynı temizlik anlayışı.",      rating: 5, gradient: "from-blue-500 to-indigo-600",    initials: "AK", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
    { name: "Mehmet Demir", role: "Yazılım Mühendisi",   city: "Ankara",    quote: "Yurt dışından döndüğümde güvenli konut bulmak en büyük korkumdu. Sefira'nın doğrulama sistemi ve sıcak topluluğu beni hemen evimde hissettirdi.",            rating: 5, gradient: "from-emerald-500 to-teal-600",   initials: "MD", avatar: "https://randomuser.me/api/portraits/men/44.jpg"   },
    { name: "Fatma Yıldız", role: "Tıp Öğrencisi",       city: "İzmir",     quote: "Uygulama çok bağımlılık yapıcı. Gerçekten evim gibi hissettiren bir yer bulana kadar profillere bakmaya devam ettim. Harika bir eşleşme!",                   rating: 5, gradient: "from-rose-500 to-pink-600",      initials: "FY", avatar: "https://randomuser.me/api/portraits/women/67.jpg" },
    { name: "Emre Çelik",   role: "Yüksek Lisans Öğ.", city: "Bursa",     quote: "İzmir'e taşındığımda kimseyi tanımıyordum. Bir hafta içinde Sefira beni en yakın arkadaşlarım olacak ev arkadaşlarımla buluşturdu.",                         rating: 5, gradient: "from-yellow-500 to-orange-600",  initials: "EÇ", avatar: "https://randomuser.me/api/portraits/men/68.jpg"   },
    { name: "Zeynep Arslan","role": "Uzaktan Tasarımcı", city: "Antalya",   quote: "Doğrulanmış ilanlar beni pek çok dolandırıcılıktan kurtardı. Gezdiğim her yer tam olarak anlatıldığı gibiydi. Hiç stressiz taşındım.",                      rating: 5, gradient: "from-cyan-500 to-blue-600",      initials: "ZA", avatar: "https://randomuser.me/api/portraits/women/75.jpg" },
    { name: "Can Özdemir",  role: "Değişim Öğrencisi",  city: "İstanbul",  quote: "Yurt dışında oda bulmak bu kadar kolay olacağını hiç düşünmemiştim. Topluluk çok sıcakkanlıydı ve uygulama her şeyi şeffaf hale getirdi.",                   rating: 5, gradient: "from-violet-500 to-purple-600", initials: "CÖ", avatar: "https://randomuser.me/api/portraits/men/90.jpg"   },
  ],
  en: [
    { name: "Alex Morrison", role: "Digital Nomad",     city: "Amsterdam", quote: "Found my perfect roommate in 48 hours. The AI matching is insanely accurate. Same sleep schedule, same cleaning habits.",                                              rating: 5, gradient: "from-blue-500 to-indigo-600",   initials: "AM", avatar: "https://randomuser.me/api/portraits/men/32.jpg"   },
    { name: "Layla Hassan",  role: "Medical Student",   city: "Berlin",    quote: "As an expat I was terrified about finding safe housing. Sefiras verification system and warm community made me feel at home.",                                          rating: 5, gradient: "from-emerald-500 to-teal-600", initials: "LH", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Daniel Park",   role: "Tech Professional", city: "Dubai",     quote: "The UI is addictive. I kept swiping through profiles until I found a place that actually feels like home, not just a room.",                                            rating: 5, gradient: "from-rose-500 to-pink-600",    initials: "DP", avatar: "https://randomuser.me/api/portraits/men/67.jpg"   },
    { name: "Sofia Reyes",   role: "Graduate Student",  city: "Barcelona", quote: "I moved to Spain knowing nobody. Within a week Sefira connected me with flatmates who became my closest friends here.",                                               rating: 5, gradient: "from-yellow-500 to-orange-600", initials: "SR", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Marcus Webb",   role: "Remote Designer",   city: "Lisbon",    quote: "The verified listings saved me from so many scams. Every place I toured was exactly as described. Finally moved in stress-free.",                                      rating: 5, gradient: "from-cyan-500 to-blue-600",    initials: "MW", avatar: "https://randomuser.me/api/portraits/men/75.jpg"   },
    { name: "Nina Okafor",   role: "Exchange Student",  city: "London",    quote: "Never thought finding a room abroad would be this smooth. The community was welcoming and the app made everything transparent.",                                        rating: 5, gradient: "from-violet-500 to-purple-600", initials: "NO", avatar: "https://randomuser.me/api/portraits/women/90.jpg" },
  ],
  fa: [
    { name: "سارا محمدی",    role: "دانشجو",              city: "تهران",    quote: "بهترین هم‌خانه زندگیم رو از طریق سفیرا پیدا کردم!",                                                                                                rating: 5, gradient: "from-blue-500 to-indigo-600",    initials: "سم", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
    { name: "علی رضایی",     role: "مهندس نرم‌افزار",    city: "مشهد",     quote: "سیستم هوش مصنوعی سفیرا واقعاً دقیقه. برنامه خواب و عادات تمیزکاری یکسانیم!",                                                                    rating: 5, gradient: "from-emerald-500 to-teal-600",   initials: "عر", avatar: "https://randomuser.me/api/portraits/men/44.jpg"   },
    { name: "نیلوفر احمدی",  role: "دانشجو",              city: "اصفهان",   quote: "به عنوان دانشجو نگران بودم. سفیرا کمکم کرد خانه امنی پیدا کنم.",                                                                                 rating: 5, gradient: "from-rose-500 to-pink-600",      initials: "نا", avatar: "https://randomuser.me/api/portraits/women/67.jpg" },
    { name: "محمد کریمی",    role: "فریلنسر",             city: "شیراز",    quote: "با سفیرا در ۴۸ ساعت هم‌خانه ایده‌آلم را پیدا کردم. سیستم تأیید هویت خیلی مطمئنه.",                                                              rating: 5, gradient: "from-yellow-500 to-orange-600",  initials: "مک", avatar: "https://randomuser.me/api/portraits/men/68.jpg"   },
    { name: "زهرا حسینی",    role: "طراح گرافیک",         city: "تبریز",    quote: "آگهی‌های تأیید شده سفیرا مانع از بسیاری کلاهبرداری‌ها شد. هر خانه‌ای که بازدید کردم دقیقاً همانطور بود که توضیح داده شده بود.",               rating: 5, gradient: "from-cyan-500 to-blue-600",      initials: "زح", avatar: "https://randomuser.me/api/portraits/women/75.jpg" },
    { name: "امیر صادقی",    role: "دانشجوی تبادلی",      city: "تهران",    quote: "هیچ‌وقت فکر نمی‌کردم پیدا کردن اتاق در خارج از کشور این‌قدر آسان باشد. جامعه سفیرا خیلی صمیمی بود.",                                         rating: 5, gradient: "from-violet-500 to-purple-600", initials: "اص", avatar: "https://randomuser.me/api/portraits/men/90.jpg"   },
  ],
  ar: [
    { name: "سارة العلي",    role: "طالبة",               city: "دبي",       quote: "وجدتُ شريكة السكن المثالية عبر سفيرا في ٤٨ ساعة فقط. دقة المطابقة بالذكاء الاصطناعي مذهلة؛ نفس جدول النوم ونفس عادات النظافة.",              rating: 5, gradient: "from-blue-500 to-indigo-600",    initials: "سع", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
    { name: "خالد المنصور",  role: "مهندس برمجيات",       city: "الرياض",    quote: "حين عُدتُ من الخارج، كان إيجاد سكن آمن هاجسي الأكبر. نظام التحقق الدقيق في سفيرا ومجتمعها الدافئ جعلاني أشعر بالانتماء فوراً.",        rating: 5, gradient: "from-emerald-500 to-teal-600",   initials: "خم", avatar: "https://randomuser.me/api/portraits/men/44.jpg"   },
    { name: "نورا الحمدان",  role: "طالبة طب",             city: "القاهرة",   quote: "التطبيق رائع ولا يمكن الاستغناء عنه. واصلتُ تصفّح الملفات حتى وجدتُ مكاناً يشعرني بأنه بيتي الحقيقي.",                                   rating: 5, gradient: "from-rose-500 to-pink-600",      initials: "نح", avatar: "https://randomuser.me/api/portraits/women/67.jpg" },
    { name: "عمر الشريف",    role: "طالب دراسات عليا",    city: "بيروت",     quote: "انتقلتُ إلى مدينة جديدة ولا أعرف فيها أحداً. في أسبوع واحد، وصلتني سفيرا بشركاء سكن أصبحوا أقرب أصدقائي.",                                rating: 5, gradient: "from-yellow-500 to-orange-600",  initials: "عش", avatar: "https://randomuser.me/api/portraits/men/68.jpg"   },
    { name: "ريم السعيد",    role: "مصمّمة مستقلة",       city: "أبوظبي",    quote: "الإعلانات الموثَّقة أنقذتني من كثير من عمليات الاحتيال. كل مكان زرتُه كان مطابقاً تماماً لما هو موصوف. انتقلتُ دون أي توتر.",             rating: 5, gradient: "from-cyan-500 to-blue-600",      initials: "رس", avatar: "https://randomuser.me/api/portraits/women/75.jpg" },
    { name: "فيصل الغامدي",  role: "طالب تبادل",          city: "عمّان",     quote: "لم أتخيّل قط أن إيجاد غرفة في الخارج سيكون بهذه السهولة. المجتمع كان مرحّباً جداً والتطبيق جعل كل شيء شفافاً.",                           rating: 5, gradient: "from-violet-500 to-purple-600", initials: "فغ", avatar: "https://randomuser.me/api/portraits/men/90.jpg"   },
  ],
  de: [
    { name: "Lukas Bauer",    role: "Student",              city: "Berlin",    quote: "In 48 Stunden meinen perfekten Mitbewohner gefunden. Das KI-Matching ist unglaublich präzise – gleicher Schlafrhythmus, gleiche Sauberkeitsansprüche.",  rating: 5, gradient: "from-blue-500 to-indigo-600",    initials: "LB", avatar: "https://randomuser.me/api/portraits/men/32.jpg"   },
    { name: "Lena Hoffmann",  role: "Softwareentwicklerin", city: "München",   quote: "Als Neuankömmling hatte ich Angst, sichere Wohnsituation zu finden. Sefiras Verifizierungssystem und die herzliche Community haben mich sofort willkommen geheißen.", rating: 5, gradient: "from-emerald-500 to-teal-600",   initials: "LH", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Tim Schreiber",  role: "Tech-Profi",           city: "Hamburg",   quote: "Die App macht süchtig. Ich habe so lange Profile durchgescrollt, bis ich einen Ort gefunden habe, der sich wirklich wie Zuhause anfühlt.",                    rating: 5, gradient: "from-rose-500 to-pink-600",      initials: "TS", avatar: "https://randomuser.me/api/portraits/men/67.jpg"   },
    { name: "Julia Mayer",    role: "Masterstudentin",      city: "Frankfurt", quote: "Ich bin nach Deutschland gezogen und kannte niemanden. Innerhalb einer Woche verband mich Sefira mit Mitbewohnern, die meine engsten Freunde wurden.",          rating: 5, gradient: "from-yellow-500 to-orange-600",  initials: "JM", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Max Müller",     role: "Remote-Designer",      city: "Köln",      quote: "Die verifizierten Inserate haben mich vor so vielen Betrügereien bewahrt. Jede besichtigte Wohnung war genau so wie beschrieben. Stressfreier Umzug.",         rating: 5, gradient: "from-cyan-500 to-blue-600",      initials: "MM", avatar: "https://randomuser.me/api/portraits/men/75.jpg"   },
    { name: "Sarah König",    role: "Austauschstudentin",   city: "Stuttgart", quote: "Ich hätte nie gedacht, dass Zimmersuche im Ausland so reibungslos funktioniert. Die Community war so herzlich und die App sehr transparent.",                 rating: 5, gradient: "from-violet-500 to-purple-600", initials: "SK", avatar: "https://randomuser.me/api/portraits/women/90.jpg" },
  ],
};

const communityPostsByLang = {
  tr: [
    { id: 1, user: "Ahmet Y.", location: "İstanbul, Türkiye", content: "Sefira aracılığıyla en harika ev arkadaşlarımı buldum! Gelecek hafta taşınıyorum. Bu şehir artık gerçekten ev gibi geliyor.",                                       likes: 312, comments: 24, gradient: "from-pink-500 to-rose-600",    initials: "AY", time: "2 saat önce" },
    { id: 2, user: "Selin K.", location: "Ankara, Türkiye",   content: "Ev arkadaşı tavsiyesi: uyku düzeniniz konusunda dürüst olun! Benimki gece kuşu; mükemmel eşleştik. 6 aydır sıfır sorun.",                                         likes: 198, comments: 38, gradient: "from-blue-500 to-indigo-600",  initials: "SK", time: "5 saat önce" },
    { id: 3, user: "Berk M.",  location: "İzmir, Türkiye",    content: "Yeni dairemde ilk haftam. Sefira beni minimalist tasarımı ve sabah rutinlerini seven 3 kişiyle eşleştirdi. Rüya takım.",                                          likes: 421, comments: 59, gradient: "from-violet-500 to-purple-600",initials: "BM", time: "1 gün önce" },
  ],
  en: [
    { id: 1, user: "Sarah K.", location: "Berlin, Germany", content: "Just found the most amazing flatmates through Sefira! Moving in next weekend. This city finally feels like home.",                               likes: 342, comments: 28, gradient: "from-pink-500 to-rose-600",    initials: "SK", time: "2h ago" },
    { id: 2, user: "Ahmed M.", location: "Dubai, UAE",      content: "Roommate tip: be honest about your sleep schedule! Mine is a night owl and we matched perfectly. 6 months in, zero issues.",                    likes: 218, comments: 45, gradient: "from-blue-500 to-indigo-600",  initials: "AM", time: "5h ago" },
    { id: 3, user: "Yuki T.",  location: "Amsterdam, NL",   content: "First week in my new flat. Sefira matched me with 3 others who love minimalist design and early mornings. Dream team.",                          likes: 456, comments: 67, gradient: "from-violet-500 to-purple-600",initials: "YT", time: "1d ago" },
  ],
  fa: [
    { id: 1, user: "سارا م.",   location: "تهران، ایران",   content: "هفته اول تو خونه جدیدم. سفیرا منو با ۳ نفر که عاشق سکوت و صبح‌های زود هستن متصل کرد!",                      likes: 342, comments: 28, gradient: "from-pink-500 to-rose-600",    initials: "سم", time: "۲ ساعت پیش" },
    { id: 2, user: "علی ر.",    location: "مشهد، ایران",    content: "نکته هم‌خانه‌یابی: در مورد برنامه خوابت صادق باش! هم‌خانه‌ام شب‌زنده‌دار و ما کاملاً مچ شدیم.",              likes: 218, comments: 45, gradient: "from-blue-500 to-indigo-600",  initials: "عر", time: "۵ ساعت پیش" },
    { id: 3, user: "نیلوفر ا.", location: "اصفهان، ایران",  content: "اولین هفتم تو آپارتمان جدیدم. سفیرا منو با ۳ نفر که طراحی مینیمالیستی و صبح‌های زود رو دوست دارن آشنا کرد.", likes: 456, comments: 67, gradient: "from-violet-500 to-purple-600",initials: "نا", time: "۱ روز پیش" },
  ],
  ar: [
    { id: 1, user: "سارة ع.",  location: "دبي، الإمارات",  content: "وجدتُ للتو أروع شركاء السكن عبر سفيرا! سأنتقل إليهم الأسبوع القادم. بدأت هذه المدينة تشعرني بأنها بيتي الحقيقي.",          likes: 342, comments: 28, gradient: "from-pink-500 to-rose-600",    initials: "سع", time: "منذ ساعتين" },
    { id: 2, user: "خالد م.",  location: "الرياض، السعودية", content: "نصيحة لشريك السكن: كن صادقاً بشأن جدول نومك! شريكي سهراني وتطابقنا بشكل مثالي. ٦ أشهر مضت ولا مشاكل أبداً.",             likes: 218, comments: 45, gradient: "from-blue-500 to-indigo-600",  initials: "خم", time: "منذ ٥ ساعات" },
    { id: 3, user: "نورا ح.",  location: "القاهرة، مصر",    content: "أسبوعي الأول في شقتي الجديدة. وصلتني سفيرا بثلاثة أشخاص يحبون التصميم البسيط والصباح الباكر. فريق الأحلام!",              likes: 456, comments: 67, gradient: "from-violet-500 to-purple-600",initials: "نح", time: "منذ يوم" },
  ],
  de: [
    { id: 1, user: "Lena B.", location: "Berlin, Deutschland", content: "Habe gerade die tollsten Mitbewohner über Sefira gefunden! Ziehe nächstes Wochenende ein. Diese Stadt fühlt sich endlich wie Zuhause an.",      likes: 342, comments: 28, gradient: "from-pink-500 to-rose-600",    initials: "LB", time: "vor 2 Std." },
    { id: 2, user: "Max M.",  location: "München, Deutschland", content: "Tipp für die WG-Suche: Seid ehrlich bei eurem Schlafrhythmus! Meiner ist ein Nachtmensch und wir passen perfekt zusammen. 6 Monate, null Probleme.", likes: 218, comments: 45, gradient: "from-blue-500 to-indigo-600",  initials: "MM", time: "vor 5 Std." },
    { id: 3, user: "Julia K.", location: "Hamburg, Deutschland", content: "Erste Woche in meiner neuen Wohnung. Sefira hat mich mit 3 Leuten zusammengebracht, die minimalistisches Design und frühe Morgen lieben. Traumteam!", likes: 456, comments: 67, gradient: "from-violet-500 to-purple-600",initials: "JK", time: "vor 1 Tag" },
  ],
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

// ─── Wizard types ─────────────────────────────────────────────────────────────
type WizardMode = "seeking" | "offering" | null;
type GenderPref = "male" | "female" | "any";

export default function Home() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, signOut: handleSignOut } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
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
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar" || saved === "de") setLang(saved);
  }, []);
  useEffect(() => { localStorage.setItem("sefira-lang", lang); }, [lang]);

  // ── Unread messages badge ─────────────────────────────────────────────────
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  useEffect(() => {
    const read = localStorage.getItem("sefira_msg_support_read") === "true";
    setHasUnreadMessages(!read);
  }, [profileMenuOpen]);

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

  const t = translations[lang];
  const testimonials   = testimonialsByLang[lang];
  const communityPosts = communityPostsByLang[lang];

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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:shadow-orange-500/50 transition-all duration-300">
              S
            </div>
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
                      {lang === "tr" ? "Para Birimini Seçin" : lang === "fa" ? "انتخاب واحد پولی" : lang === "ar" ? "اختر العملة" : lang === "de" ? "Währung wählen" : "Select Currency"}
                    </p>
                  </div>
                  {(["USD", "EUR", "TRY"] as const).map((cur) => {
                    const meta = {
                      USD: { icon: "💵", name: lang === "tr" ? "ABD Doları" : lang === "fa" ? "دلار آمریکا" : lang === "ar" ? "دولار أمريكي" : lang === "de" ? "US-Dollar" : "US Dollar" },
                      EUR: { icon: "💶", name: lang === "tr" ? "Euro" : lang === "fa" ? "یورو" : lang === "ar" ? "يورو" : lang === "de" ? "Euro" : "Euro" },
                      TRY: { icon: "💴", name: lang === "tr" ? "Türk Lirası" : lang === "fa" ? "لیر ترکیه" : lang === "ar" ? "ليرة تركية" : lang === "de" ? "Türkische Lira" : "Turkish Lira" },
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

            {/* Lang switcher — single button + dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => { setLangMenuOpen((o) => !o); setProfileMenuOpen(false); setCurrencyMenuOpen(false); }}
                className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] font-black transition-all duration-200 hover:bg-stone-200 whitespace-nowrap"
              >
                <span className="text-sm leading-none">
                  {lang === "tr" ? "🇹🇷" : lang === "en" ? "🇬🇧" : lang === "fa" ? "🇮🇷" : lang === "ar" ? "🇸🇦" : "🇩🇪"}
                </span>
                <span className="hidden sm:inline text-stone-700">
                  {lang === "tr" ? "TR" : lang === "en" ? "EN" : lang === "fa" ? "FA" : lang === "ar" ? "AR" : "DE"}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className="absolute top-full mt-1 right-0 z-[100] bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden min-w-[90px]">
                  {(["tr", "en", "fa", "ar", "de"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangMenuOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 text-[12px] font-bold transition-colors hover:bg-stone-50 ${lang === l ? "text-orange-500" : "text-stone-700"}`}
                    >
                      <span className="text-sm">{l === "tr" ? "🇹🇷" : l === "en" ? "🇬🇧" : l === "fa" ? "🇮🇷" : l === "ar" ? "🇸🇦" : "🇩🇪"}</span>
                      {l === "tr" ? "TR" : l === "en" ? "EN" : l === "fa" ? "FA" : l === "ar" ? "AR" : "DE"}
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

      {/* ── PROFILE DROPDOWN ────────────────────────────────────────────────── */}
      {user && profileMenuOpen && (
        <>
          {/* Invisible backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setProfileMenuOpen(false)}
          />
          {/* Compact dropdown panel */}
          <div className="fixed top-16 right-4 z-50 w-[220px] bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden" dir="ltr">
            {/* Avatar + name header */}
            <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50/60 border-b border-orange-100 flex flex-col items-center gap-1.5">
              <button
                onClick={() => { setProfileMenuOpen(false); router.push("/profile"); }}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-md shadow-orange-500/30 overflow-hidden ring-2 ring-white hover:ring-orange-400 hover:opacity-90 transition-all duration-200"
              >
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (user.user_metadata?.full_name ?? user.email ?? "U")
                    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                )}
              </button>
              <p className="font-black text-stone-900 text-sm leading-tight truncate max-w-[180px] text-center">
                {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
              </p>
            </div>

            {/* Menu items */}
            <div className="p-1.5 flex flex-col gap-0.5">
              {/* Edit Profile */}
              <Link
                href="/profile"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-150 font-semibold group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500 flex-shrink-0">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-xs">{lang === "tr" ? "Profilimi Düzenle" : lang === "fa" ? "ویرایش پروفایل" : lang === "ar" ? "تعديل الملف الشخصي" : lang === "de" ? "Profil bearbeiten" : "Edit Profile"}</span>
              </Link>

              {/* Saved Listings */}
              <Link
                href="/saved-listings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-150 font-semibold group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500 flex-shrink-0">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs">{lang === "tr" ? "Kaydedilenler" : lang === "fa" ? "ذخیره‌ها" : lang === "ar" ? "المحفوظات" : lang === "de" ? "Gespeichert" : "Saved"}</span>
              </Link>

              {/* Post Listing */}
              <button
                onClick={() => { handleCreateListing(); setProfileMenuOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-150 font-semibold group w-full text-left"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 text-orange-500 flex-shrink-0">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-xs">{lang === "tr" ? "İlan Ver" : lang === "fa" ? "ثبت آگهی" : lang === "ar" ? "نشر إعلان" : lang === "de" ? "Inserat aufgeben" : "Post Listing"}</span>
              </button>

              {/* My Listings */}
              <Link
                href="/my-listings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-150 font-semibold group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500 flex-shrink-0">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="13" y2="16" />
                </svg>
                <span className="text-xs">{lang === "tr" ? "İlanlarım" : lang === "fa" ? "آگهی‌های من" : lang === "ar" ? "إعلاناتي" : lang === "de" ? "Meine Inserate" : "My Listings"}</span>
              </Link>

              {/* My Messages */}
              <Link
                href="/messages"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-150 font-semibold group"
              >
                <div className="relative flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {hasUnreadMessages && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 border border-white" />
                  )}
                </div>
                <span className="text-xs">{lang === "tr" ? "Mesajlarım" : lang === "fa" ? "پیام‌های من" : lang === "ar" ? "رسائلي" : lang === "de" ? "Meine Nachrichten" : "My Messages"}</span>
              </Link>

              {/* My Comments & Ratings */}
              <Link
                href="/my-reviews"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-150 font-semibold group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500 flex-shrink-0">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-xs">{lang === "tr" ? "Yorumlarım ve Puanlarım" : lang === "fa" ? "کامنت‌ها و امتیازهای من" : lang === "ar" ? "تعليقاتي وتقييماتي" : lang === "de" ? "Meine Bewertungen" : "My Comments & Ratings"}</span>
              </Link>

              <div className="h-px bg-stone-100 my-1 mx-2" />

              {/* Sign Out */}
              <button
                onClick={() => { handleSignOut(); setProfileMenuOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all duration-150 font-semibold group w-full text-left"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-rose-500 flex-shrink-0">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                <span className="text-xs">{t.signOut}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden bg-[#0f1729]">

        {/* Animated dark gradient background */}
        <div className="absolute inset-0 hero-dark-bg" />

        {/* Animated gradient orbs */}
        <div className="hero-orb-1 absolute -top-24 -left-16 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-500/30 via-amber-400/15 to-transparent blur-3xl pointer-events-none" />
        <div className="hero-orb-2 absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-purple-700/20 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="hero-orb-3 absolute -bottom-20 -right-16 w-[560px] h-[560px] rounded-full bg-indigo-700/22 blur-3xl pointer-events-none" />

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
            <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-8 text-sm text-orange-300 hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-default shadow-lg shadow-orange-500/15 animate-fade-in-up backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              {t.heroBadge}
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tighter mb-6 animate-fade-in-up stagger-2 hero-title-glow">
              <span className="text-white">{t.heroLine1}</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
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

                    {/* Option A: Seeking */}
                    <button
                      onClick={() => { setWizardMode("seeking"); setWizardStep(1); }}
                      className="group relative text-left p-5 rounded-2xl border-2 border-stone-200 bg-white hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-fuchsia-500/0 group-hover:from-orange-500/5 group-hover:via-amber-500/3 group-hover:to-fuchsia-500/5 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl mb-4 shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all duration-300">
                          🔍
                        </div>
                        <p className="font-black text-stone-900 text-sm leading-snug mb-1.5">
                          {t.optionSeekingTitle}
                        </p>
                        <p className="text-xs text-stone-400 font-medium leading-relaxed" dir="rtl">
                          {t.optionSeekingSubtitle}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-stone-200 group-hover:border-orange-400 group-hover:bg-orange-50 transition-all duration-300 flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>

                    {/* Option B: Offering */}
                    <button
                      onClick={() => { setWizardMode("offering"); setWizardStep(1); }}
                      className="group relative text-left p-5 rounded-2xl border-2 border-stone-200 bg-white hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 via-fuchsia-500/0 to-pink-500/0 group-hover:from-violet-500/5 group-hover:via-fuchsia-500/3 group-hover:to-pink-500/5 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl mb-4 shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-violet-500/40 transition-all duration-300">
                          🏠
                        </div>
                        <p className="font-black text-stone-900 text-sm leading-snug mb-1.5">
                          {t.optionOfferingTitle}
                        </p>
                        <p className="text-xs text-stone-400 font-medium leading-relaxed" dir="rtl">
                          {t.optionOfferingSubtitle}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-stone-200 group-hover:border-violet-400 group-hover:bg-violet-50 transition-all duration-300 flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
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

      {/* ── STORIES ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-bold text-stone-900">{t.storiesTitle}</h2>
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium shadow-sm shadow-emerald-500/10">
            {t.storiesLive}
          </span>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {stories.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform duration-200 ${
                    !s.isAdd
                      ? "ring-2 ring-orange-400/50 ring-offset-2 ring-offset-stone-50 group-hover:ring-orange-400/80 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-200"
                      : "border-2 border-dashed border-stone-300"
                  }`}
                >
                  {s.isAdd ? (
                    <span className="text-2xl text-stone-400 font-light">+</span>
                  ) : (
                    s.initials
                  )}
                </div>
                {!s.isAdd && s.online && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-stone-50" />
                )}
              </div>
              <span className="text-xs text-stone-500 group-hover:text-stone-900 transition-colors whitespace-nowrap">
                {s.isAdd ? t.addStory : s.name}
              </span>
              {s.city && <span className="text-xs text-stone-400">{s.city}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTAGRAM CTA ─────────────────────────────────────────────────────── */}
      <InstagramCTA lang={lang} />

      {/* ── LISTINGS ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1 cursor-pointer hover:ring-1 hover:ring-orange-200"
            >
              <div className="relative h-52 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${listing.gradient}`} />
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  quality={80}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/25 via-transparent to-stone-900/30" />
                <div className={`absolute top-3 left-3 bg-gradient-to-r ${listing.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                  {listing.tag}
                </div>
                <button
                  onClick={() => toggleListing(listing.id)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 font-bold active:scale-90 ${
                    likedListings.includes(listing.id)
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110"
                      : "bg-stone-900/25 backdrop-blur-sm text-white/60 hover:text-white hover:bg-stone-900/50 hover:scale-110"
                  }`}
                >
                  ♥
                </button>
                {listing.verified && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-stone-900/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-xs text-white font-medium">{t.listingVerified}</span>
                  </div>
                )}
                {/* Dynamic currency price */}
                <div className="absolute bottom-3 right-3 bg-stone-900/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
                  <span className="text-white font-black text-sm">
                    {displayPrice(listing.price, listing.sym, currency)}
                  </span>
                  <span className="text-white/50 text-xs">{t.perMonth}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-stone-900 mb-1.5 group-hover:text-orange-600 transition-colors text-sm leading-snug">
                  {listing.title}
                </h3>
                <p className="text-xs text-stone-500 mb-3">
                  {listing.city}, {listing.country}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-500 text-xs">★</span>
                  <span className="text-stone-900 text-xs font-bold">{listing.rating}</span>
                  <span className="text-stone-400 text-xs">({listing.reviews})</span>
                  <span className="ml-auto text-xs text-stone-500">{listing.available}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {listing.amenities.map((a) => (
                    <span key={a} className="text-xs bg-stone-100 rounded-md px-2 py-0.5 text-stone-500">
                      {a}
                    </span>
                  ))}
                  <span className="text-xs text-stone-400 ml-auto">{listing.gender}</span>
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
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">{t.howH2}</h2>
            <p className="text-stone-600 text-lg max-w-xl mx-auto">{t.howP}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {t.howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center group">
                {i < t.howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-stone-300 to-transparent -translate-x-1/2 z-0" />
                )}
                <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-2xl mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-orange-500/20 transition-all duration-300`}>
                  {step.icon}
                </div>
                <div className="text-xs font-black text-stone-400 mb-2 tracking-widest group-hover:text-stone-600 transition-colors duration-300">{step.step}</div>
                <h3 className="font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchProfiles.map((p) => (
            <div
              key={p.id}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1 cursor-pointer hover:ring-1 hover:ring-orange-500/15"
            >
              <div className={`h-44 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center`}>
                <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/25 flex items-center justify-center text-2xl font-black shadow-xl">
                  {p.initials}
                </div>
                <div className="absolute top-3 right-3 bg-stone-900/75 backdrop-blur-md rounded-2xl px-3 py-1.5 text-center">
                  <div className="text-lg font-black text-white">{p.match}%</div>
                  <div className="text-xs text-white/70">{t.matchLabel}</div>
                </div>
                {p.verified && (
                  <div className="absolute top-3 left-3 bg-orange-500/75 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                    {t.verifiedLabel}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-stone-900">{p.name}, {p.age}</h3>
                    <p className="text-xs text-stone-500">{p.occupation}</p>
                  </div>
                  <span className="text-xs text-stone-400">{p.nationality}</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">{lang === "tr" ? p.bioTr : lang === "fa" ? p.bioFa : lang === "ar" ? (p.bioAr ?? p.bio) : p.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.lifestyle.map((tag) => (
                    <span key={tag} className="text-xs bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5 text-stone-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mb-5">
                  <span>{convertBudgetRange(p.budget, currency)}{t.perMonth}</span>
                  <span>{p.pets ? t.petsOkShort : t.noPetsShort}</span>
                  <span className="ml-auto text-stone-400">{p.city}</span>
                </div>
                {/* ── Three action buttons ── */}
                <div className="flex items-center gap-2.5">

                  {/* Reject / Skip */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Skip"
                    className="w-11 h-11 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-300 hover:border-stone-300 hover:text-stone-500 hover:bg-white hover:shadow-sm transition-all duration-200 active:scale-90 flex-shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  {/* Message — primary gradient CTA */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Message"
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 hover:opacity-95 hover:shadow-xl hover:shadow-fuchsia-500/30 hover:-translate-y-px transition-all duration-200 active:scale-[0.97] active:translate-y-0 group"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>

                  {/* Save / Heart toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(p.id); }}
                    aria-label="Save"
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 ${
                      savedProfiles.includes(p.id)
                        ? "border-rose-400 bg-rose-50 text-rose-500 shadow-md shadow-rose-500/15"
                        : "border-stone-200 bg-white text-stone-300 hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/60 hover:shadow-sm"
                    } ${animatingIds.includes(p.id) ? "animate-heart-pop" : ""}`}
                  >
                    <svg viewBox="0 0 24 24" fill={savedProfiles.includes(p.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR CITIES ────────────────────────────────────────────────────── */}
      <PopularCities lang={lang} />

      {/* ── COMMUNITY FEED ────────────────────────────────────────────────────── */}
      <section className="bg-orange-50/60 border-y border-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
              {t.communityBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">{t.communityH2}</h2>
            <p className="text-stone-600">{t.communityP}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPosts.map((post) => (
              <div key={post.id} className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {post.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">{post.user}</p>
                    <p className="text-xs text-stone-500">{post.location}</p>
                  </div>
                  <span className="text-xs text-stone-400 flex-shrink-0">{post.time}</span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-5">{post.content}</p>
                <div className="flex items-center gap-5 text-xs text-stone-500">
                  <button className="hover:text-rose-500 transition-colors">{post.likes} {t.likesLabel}</button>
                  <button className="hover:text-orange-500 transition-colors">{post.comments} {t.commentsLabel}</button>
                  <button className="hover:text-amber-600 transition-colors ml-auto">{t.shareLabel}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">{t.testiH2}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-400 text-xl">★★★★★</span>
            <span className="text-stone-900 font-black text-xl">4.9</span>
            <span className="text-stone-500">{t.testiReviews}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div key={item.name} className="bg-white border border-stone-200 rounded-2xl p-7 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/5 hover:ring-1 hover:ring-stone-200 transition-all duration-200">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed mb-6 italic">&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-500">{item.role} · {item.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOWNLOAD APP ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-amber-200 py-20 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-50">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-5 tracking-tight leading-tight">
              {t.appH2a}
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{t.appH2b}</span>
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-9">{t.appP}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center gap-4 bg-stone-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all duration-200 shadow-2xl shadow-stone-900/25 hover:-translate-y-0.5 active:scale-95">
                <span className="text-3xl leading-none">🍎</span>
                <div className="text-left">
                  <div className="text-xs text-stone-400 font-normal">{t.appStoreLabel}</div>
                  <div className="text-sm font-black">{t.appStoreName}</div>
                </div>
              </button>
              <button className="flex items-center gap-4 bg-orange-500 text-white px-6 py-4 rounded-2xl font-bold hover:bg-orange-600 border border-orange-400 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:shadow-xl active:scale-95">
                <span className="text-3xl leading-none">▶</span>
                <div className="text-left">
                  <div className="text-xs text-orange-100 font-normal">{t.googlePlayLabel}</div>
                  <div className="text-sm font-black">{t.googlePlayName}</div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-60 h-[500px] animate-float">
              <div className="absolute inset-0 bg-stone-800 rounded-[2.5rem] border-4 border-stone-700/50 shadow-2xl overflow-hidden">
                <div className="absolute inset-2 bg-stone-900 rounded-[2rem] overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <span className="text-xs text-white font-medium">9:41</span>
                    <span className="text-xs text-white/40">● ● ● ●</span>
                  </div>
                  <div className="px-3 py-2 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Sefira</span>
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-lg" />
                    </div>
                    <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/20 rounded-xl p-3">
                      <div className="text-xs text-orange-400 font-bold mb-1">{t.newMatch}</div>
                      <div className="text-xs text-white">{t.likedProfile}</div>
                      <div className="text-xs text-white/50">{t.compatibility}</div>
                    </div>
                    <div className="text-xs text-white/40 font-medium px-1">{t.suggested}</div>
                    {[
                      { init: "KT", name: "Kai T.",   match: 94, grad: "from-cyan-500 to-blue-600" },
                      { init: "SR", name: "Sofia R.", match: 91, grad: "from-rose-500 to-pink-600" },
                      { init: "LM", name: "Lena M.",  match: 89, grad: "from-violet-500 to-purple-600" },
                    ].map((c) => (
                      <div key={c.init} className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center text-xs font-black flex-shrink-0`}>
                          {c.init}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-medium">{c.name}</div>
                          <div className="text-xs text-white/40">{c.match}% {t.matchLabel.toLowerCase()}</div>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute right-[-3px] top-28 w-1 h-14 bg-stone-600 rounded-full" />
              <div className="absolute left-[-3px] top-20 w-1 h-8 bg-stone-600 rounded-full" />
              <div className="absolute left-[-3px] top-32 w-1 h-14 bg-stone-600 rounded-full" />
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
                      <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors duration-200">{link}</a>
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
        <AuthModal lang={lang} onClose={() => setShowAuth(false)} />
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
