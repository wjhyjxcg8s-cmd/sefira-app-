"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import RoommateCards from "@/app/components/RoommateCards";
import InstagramCTA from "@/app/components/InstagramCTA";
import PopularCities from "@/app/components/PopularCities";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  tr: {
    navLinks: [
      { label: "Oda Bul", href: "#" },
      { label: "Ev Arkadaşı Bul", href: "#" },
      { label: "İlan Ver", href: "#" },
      { label: "Topluluk", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "Doğrulanmış Kullanıcı" },
      { value: "52",    label: "Dünya Genelinde Şehir" },
      { value: "98%",   label: "Eşleşme Memnuniyeti" },
      { value: "4.9★",  label: "Uygulama Puanı" },
    ],
    signIn: "Giriş Yap",
    getStarted: "Başla",
    heroBadge: "52 şehirde 127.000'den fazla doğrulanmış kullanıcı tarafından güvenilir",
    heroLine1: "İdeal Evinizi",
    heroLine2: "ve Ev Arkadaşınızı",
    heroLine3: "Bulun.",
    heroP: "Yapay zeka destekli ev arkadaşı eşleştirme ve premium kiralık ilan keşfi. Yurt dışında yaşayanlar, öğrenciler ve modern profesyoneller için tasarlandı.",
    searchTabs: ["Oda", "Ev Arkadaşı", "Daire"],
    countryPlaceholder: "Ülke",
    cityPlaceholder: "Şehir",
    loadingText: "Yükleniyor…",
    priorityGroupLabel: "⭐ Popüler Ülkeler",
    allCountriesLabel: "Tüm Ülkeler",
    searchPlaceholder: "Şehir, mahalle veya anahtar kelime ara...",
    searchBtn: "Ara",
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
  },
  en: {
    navLinks: [
      { label: "Find Rooms", href: "#" },
      { label: "Find Roommates", href: "#" },
      { label: "List Property", href: "#" },
      { label: "Community", href: "#" },
    ],
    stats: [
      { value: "127K+", label: "Verified Users" },
      { value: "52",    label: "Cities Worldwide" },
      { value: "98%",   label: "Match Satisfaction" },
      { value: "4.9★",  label: "App Rating" },
    ],
    signIn: "Sign In",
    getStarted: "Get Started",
    heroBadge: "Trusted by 127,000+ verified users across 52 cities",
    heroLine1: "Find Your",
    heroLine2: "Perfect Home",
    heroLine3: "and Roommate.",
    heroP: "AI-powered roommate matching meets premium rental discovery. Built for expats, students, and modern professionals.",
    searchTabs: ["Room", "Roommate", "Flat"],
    countryPlaceholder: "Country",
    cityPlaceholder: "City",
    loadingText: "Loading…",
    priorityGroupLabel: "⭐ Top Destinations",
    allCountriesLabel: "All Countries",
    searchPlaceholder: "Search city, neighborhood, or keyword...",
    searchBtn: "Search",
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
    verified: true, pets: false, smoking: false, budget: "700-1000",
  },
  {
    id: 2, name: "Kai Tanaka", age: 29, occupation: "Software Engineer", nationality: "Japanese",
    match: 94, city: "Berlin", gradient: "from-cyan-600 via-blue-700 to-indigo-800",
    initials: "KT", lifestyle: ["Early bird", "Gamer", "Coffee lover"],
    bio: "Remote dev who values clean spaces and good coffee. Lets build a calm, focused home.",
    verified: true, pets: true, smoking: false, budget: "800-1100",
  },
  {
    id: 3, name: "Sofia Ramirez", age: 24, occupation: "Medical Student", nationality: "Spanish",
    match: 91, city: "Berlin", gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    initials: "SR", lifestyle: ["Student", "Active", "Social"],
    bio: "Med student, tidy and friendly. Latin music on weekends, focused on weeknights.",
    verified: false, pets: false, smoking: false, budget: "500-750",
  },
];

const listings = [
  {
    id: 1, title: "Modern Studio near Alexanderplatz", city: "Berlin", country: "Germany",
    price: 850, sym: "EUR", rating: 4.9, reviews: 127, type: "Private Room",
    available: "Jun 1", gradient: "from-blue-600 via-indigo-700 to-violet-800",
    verified: true, amenities: ["WiFi", "Gym", "Balcony"], tag: "Most Popular",
    tagColor: "from-blue-500 to-indigo-600", gender: "Any",
    // Unsplash: bright modern apartment living room
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2, title: "Luxury Sea-View Apartment", city: "Dubai", country: "UAE",
    price: 1200, sym: "USD", rating: 4.8, reviews: 89, type: "Entire Flat",
    available: "Now", gradient: "from-amber-500 via-orange-600 to-rose-700",
    verified: true, amenities: ["Pool", "Gym", "Concierge"], tag: "New",
    tagColor: "from-amber-500 to-orange-600", gender: "Male",
    // Unsplash: luxury penthouse / high-rise interior
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3, title: "Charming Room near Bosphorus", city: "Istanbul", country: "Turkey",
    price: 450, sym: "USD", rating: 4.7, reviews: 204, type: "Private Room",
    available: "May 25", gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    verified: false, amenities: ["WiFi", "Kitchen", "Sea View"], tag: "Best Value",
    tagColor: "from-emerald-500 to-teal-600", gender: "Any",
    // Unsplash: cozy bright room with natural light
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4, title: "Designer Loft in Eixample", city: "Barcelona", country: "Spain",
    price: 780, sym: "EUR", rating: 5.0, reviews: 56, type: "Private Room",
    available: "Jun 15", gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    verified: true, amenities: ["WiFi", "Rooftop", "A/C"], tag: "Top Rated",
    tagColor: "from-rose-500 to-pink-600", gender: "Female",
    // Unsplash: designer loft with exposed brick and warm light
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

const testimonials = [
  { name: "Alex Morrison", role: "Digital Nomad",     city: "Amsterdam", quote: "Found my perfect roommate in 48 hours. The AI matching is insanely accurate. Same sleep schedule, same cleaning habits.",                                              rating: 5, gradient: "from-blue-500 to-indigo-600",   initials: "AM" },
  { name: "Layla Hassan",  role: "Medical Student",   city: "Berlin",    quote: "As an expat I was terrified about finding safe housing. Sefiras verification system and warm community made me feel at home.",                                          rating: 5, gradient: "from-emerald-500 to-teal-600", initials: "LH" },
  { name: "Daniel Park",   role: "Tech Professional", city: "Dubai",     quote: "The UI is addictive. I kept swiping through profiles until I found a place that actually feels like home, not just a room.",                                            rating: 5, gradient: "from-rose-500 to-pink-600",    initials: "DP" },
];

const communityPosts = [
  { id: 1, user: "Sarah K.", location: "Berlin, Germany", content: "Just found the most amazing flatmates through Sefira! Moving in next weekend. This city finally feels like home.",                               likes: 342, comments: 28, gradient: "from-pink-500 to-rose-600",    initials: "SK", time: "2h ago" },
  { id: 2, user: "Ahmed M.", location: "Dubai, UAE",      content: "Roommate tip: be honest about your sleep schedule! Mine is a night owl and we matched perfectly. 6 months in, zero issues.",                    likes: 218, comments: 45, gradient: "from-blue-500 to-indigo-600",  initials: "AM", time: "5h ago" },
  { id: 3, user: "Yuki T.",  location: "Amsterdam, NL",   content: "First week in my new flat. Sefira matched me with 3 others who love minimalist design and early mornings. Dream team.",                          likes: 456, comments: 67, gradient: "from-violet-500 to-purple-600",initials: "YT", time: "1d ago" },
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

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [likedListings, setLikedListings] = useState<number[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTabIdx, setSearchTabIdx] = useState(0);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [lang, setLang] = useState<Lang>("tr");

  const t = translations[lang];

  const toggleListing = (id: number) =>
    setLikedListings((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleProfile = (id: number) =>
    setLikedProfiles((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

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

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200 shadow-sm shadow-stone-200/80">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-shrink-0 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:shadow-orange-500/50 transition-all duration-300">
              S
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Sefira
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-7">
            {t.navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setLang((l) => (l === "tr" ? "en" : "tr"))}
              className="flex items-center gap-1.5 text-xs font-bold bg-stone-100 border border-stone-200 rounded-lg px-3 py-2.5 sm:py-2 text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-stone-200 transition-all duration-200 active:scale-95"
            >
              <span className="text-sm sm:text-xs leading-none">{lang === "tr" ? "🇹🇷" : "🇬🇧"}</span>
              <span>{lang === "tr" ? "TR" : "EN"}</span>
              <span className="hidden sm:inline text-stone-400">·</span>
              <span className="hidden sm:inline text-stone-400">{lang === "tr" ? "EN" : "TR"}</span>
            </button>
            <button className="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-stone-100">
              {t.signIn}
            </button>
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
            <button className="text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl hover:opacity-95 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95">
              {t.getStarted}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO — split-screen */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">

        {/* Layered background: warm base + Orange → Magenta → Deep Purple glow blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-orange-50/40 to-violet-50/20" />
        <div className="absolute -top-24 -left-16 w-[600px] h-[600px] bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute -bottom-20 -right-16 w-[560px] h-[560px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Split-screen grid */}
        <div className="relative max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 xl:gap-20 items-center w-full">

          {/* ── LEFT: Typography + Search ───────────────────────────── */}
          <div className="flex flex-col items-start">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2.5 bg-orange-50 border border-orange-200 rounded-full px-5 py-2 mb-8 text-sm text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-all duration-300 cursor-default shadow-lg shadow-orange-500/5 animate-fade-in-up backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              {t.heroBadge}
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tighter mb-6 animate-fade-in-up stagger-2">
              <span className="text-stone-900">{t.heroLine1}</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                {t.heroLine2}
              </span>
              <br />
              <span className="text-stone-900">{t.heroLine3}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-stone-600 max-w-xl mb-8 leading-relaxed animate-fade-in-up stagger-3">
              {t.heroP}
            </p>

            {/* Search bar */}
            <div className="w-full bg-white border border-stone-200 rounded-2xl p-2 flex flex-col sm:flex-row flex-wrap gap-2 mb-4 shadow-xl focus-within:border-orange-300 focus-within:shadow-orange-500/10 focus-within:shadow-2xl transition-all duration-300 animate-fade-in-up stagger-4">
              <div className="flex bg-stone-100 rounded-xl p-1 gap-1 flex-shrink-0">
                {t.searchTabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setSearchTabIdx(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      searchTabIdx === i
                        ? "bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 text-white shadow-lg shadow-orange-500/30"
                        : "text-stone-500 hover:text-stone-900 hover:bg-white transition-all duration-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <select
                value={selectedCountry}
                onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity(""); }}
                className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-600 outline-none cursor-pointer flex-shrink-0 hover:border-stone-400 focus:border-orange-400 transition-colors duration-200"
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
                className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-600 outline-none cursor-pointer flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:border-stone-400 focus:border-orange-400 transition-colors duration-200"
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
                className="flex-1 bg-transparent px-4 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none text-sm min-w-0"
              />
              <button className="bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 text-white px-7 py-3 rounded-xl font-bold text-sm hover:opacity-95 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-violet-500/30 active:scale-95 whitespace-nowrap">
                {t.searchBtn}
              </button>
            </div>

            {/* Quick city chips */}
            <div className="flex flex-wrap gap-2 mb-10">
              {(selectedCountry && PRIORITY_CITIES[selectedCountry]
                ? PRIORITY_CITIES[selectedCountry]
                : selectedCountry && cities.length > 0
                ? cities.slice(0, 6)
                : ["Berlin", "Dubai", "Istanbul", "Barcelona", "Paris", "Rome"]
              ).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 active:scale-95 hover:scale-105 ${
                    selectedCity === city
                      ? "bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white border-transparent shadow-md shadow-orange-500/25"
                      : "text-stone-600 bg-stone-100 border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:bg-stone-200"
                  }`}
                >
                  {city}
                </button>
              ))}
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
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} border-2 border-stone-50 flex items-center justify-center text-xs font-bold shadow-lg`}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-stone-900">{t.matchesThisWeek}</div>
                <div className="text-xs text-stone-500">{t.reviewsLabel}</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: hero-bg.png with floating effect ──────────────── */}
          <div className="flex items-center justify-center relative py-8 lg:py-12">

            {/* Outer glow halo — Orange → Magenta → Deep Purple */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 lg:w-[460px] lg:h-[460px] rounded-full bg-gradient-to-br from-orange-400/20 via-fuchsia-500/15 to-violet-600/20 blur-3xl" />
            </div>
            {/* Subtle inner ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 lg:w-[340px] lg:h-[340px] rounded-full border border-fuchsia-300/20 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-violet-500/5" />
            </div>

            {/* Floating image wrapper — responsive width */}
            <div className="relative animate-float z-10 w-64 sm:w-80 lg:w-[500px]">

              {/* Colored drop-shadow beneath image */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-gradient-to-r from-orange-500/35 via-fuchsia-500/35 to-violet-600/35 blur-2xl rounded-full pointer-events-none" />

              <Image
                src="/images/hero-bg.png"
                alt="Sefira — find your perfect home and roommate"
                width={500}
                height={520}
                className="w-full h-auto rounded-3xl object-contain drop-shadow-2xl ring-1 ring-white/40"
                priority
              />

              {/* Floating badge — top-left: verified users */}
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

              {/* Floating badge — bottom-right: star rating */}
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
        <div className="relative flex justify-center pb-10">
          <div className="w-6 h-10 border-2 border-stone-400/40 rounded-full flex justify-center pt-2 animate-bounce">
            <div className="w-1 h-2 bg-stone-400/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* STATS */}
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

      {/* STORIES */}
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

      {/* AI MATCH */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-500/10 border border-orange-400/30 rounded-full px-4 py-2 mb-7 shadow-lg shadow-orange-500/10">
              {t.aiMatchBadge}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight text-stone-900 mb-6 tracking-tight">
              {t.aiMatchLine1}
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t.aiMatchLine2}
              </span>
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-9">
              {t.aiMatchP}
            </p>
            <div className="space-y-5 mb-9">
              {t.compatBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-stone-600 font-medium">{bar.label}</span>
                    <span className="text-stone-900 font-bold">{bar.value}%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-7 py-3.5 rounded-xl font-bold hover:opacity-95 transition-all duration-200 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 active:scale-95">
              {t.findMatchesBtn}
            </button>
          </div>
          <div className="flex justify-center lg:justify-end">
            <RoommateCards lang={lang} />
          </div>
        </div>
      </section>

      {/* INSTAGRAM CTA */}
      <InstagramCTA lang={lang} />

      {/* LISTINGS */}
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
                {/* Gradient fallback behind the photo */}
                <div className={`absolute inset-0 bg-gradient-to-br ${listing.gradient}`} />
                {/* Real photo */}
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  quality={80}
                />
                {/* Subtle top-to-bottom darkening so badges stay legible */}
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/25 via-transparent to-stone-900/30" />
                <div
                  className={`absolute top-3 left-3 bg-gradient-to-r ${listing.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}
                >
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
                <div className="absolute bottom-3 right-3 bg-stone-900/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
                  <span className="text-white font-black text-sm">
                    {listing.sym === "EUR" ? "€" : "$"}
                    {listing.price}
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

      {/* HOW IT WORKS */}
      <section className="bg-amber-50/80 border-y border-amber-100 py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">
              {t.howH2}
            </h2>
            <p className="text-stone-600 text-lg max-w-xl mx-auto">
              {t.howP}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {t.howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center group">
                {i < t.howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-stone-300 to-transparent -translate-x-1/2 z-0" />
                )}
                <div
                  className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-2xl mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-orange-500/20 transition-all duration-300`}
                >
                  {step.icon}
                </div>
                <div className="text-xs font-black text-stone-400 mb-2 tracking-widest group-hover:text-stone-600 transition-colors duration-300">
                  {step.step}
                </div>
                <h3 className="font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOMMATES */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
              {t.roommatesH2}
            </h2>
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
              <div
                className={`h-44 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center`}
              >
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
                    <h3 className="font-bold text-stone-900">
                      {p.name}, {p.age}
                    </h3>
                    <p className="text-xs text-stone-500">{p.occupation}</p>
                  </div>
                  <span className="text-xs text-stone-400">{p.nationality}</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">{p.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.lifestyle.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5 text-stone-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mb-5">
                  <span>{p.budget}/mo</span>
                  <span>{p.pets ? t.petsOkShort : t.noPetsShort}</span>
                  <span className="ml-auto text-stone-400">{p.city}</span>
                </div>
                <button
                  onClick={() => toggleProfile(p.id)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    likedProfiles.includes(p.id)
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-500 shadow-sm shadow-rose-500/10"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-95 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/35 active:scale-95 transition-all duration-200"
                  }`}
                >
                  {likedProfiles.includes(p.id) ? t.matchedBtn : t.connectBtn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR CITIES */}
      <PopularCities lang={lang} />

      {/* COMMUNITY FEED */}
      <section className="bg-orange-50/60 border-y border-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
              {t.communityBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">
              {t.communityH2}
            </h2>
            <p className="text-stone-600">{t.communityP}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-sm font-bold flex-shrink-0`}
                  >
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

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 tracking-tight">
            {t.testiH2}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-400 text-xl">★★★★★</span>
            <span className="text-stone-900 font-black text-xl">4.9</span>
            <span className="text-stone-500">{t.testiReviews}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="bg-white border border-stone-200 rounded-2xl p-7 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/5 hover:ring-1 hover:ring-stone-200 transition-all duration-200"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg`}
                >
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-500">
                    {item.role} · {item.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD APP */}
      <section className="relative overflow-hidden border-y border-amber-200 py-20 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-50">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-5 tracking-tight leading-tight">
              {t.appH2a}
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t.appH2b}
              </span>
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-9">
              {t.appP}
            </p>
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
                      <span className="text-sm font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                        Sefira
                      </span>
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
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center text-xs font-black flex-shrink-0`}
                        >
                          {c.init}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-medium">{c.name}</div>
                          <div className="text-xs text-white/40">{c.match}% {t.matchLabel.toLowerCase()}</div>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">
                          →
                        </div>
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

      {/* FOOTER */}
      <footer className="bg-stone-900 border-t border-stone-700">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/25">
                  S
                </div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Sefira
                </span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs mb-7">
                {t.footerDesc}
              </p>
              <div className="flex gap-2.5">
                {["X", "in", "yt"].map((icon) => (
                  <button
                    key={icon}
                    className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-xs text-stone-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 font-bold hover:scale-110 active:scale-90"
                  >
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
                      <a
                        href="#"
                        className="text-sm text-stone-400 hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500">
              {t.footerCopy}
            </p>
            <div className="flex items-center gap-6">
              {t.footerLegal.map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
