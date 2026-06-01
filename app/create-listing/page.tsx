"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

// ── Countries ─────────────────────────────────────────────────────────────────
const TOP_COUNTRIES = [
  "Turkey", "Iran", "Germany", "United Arab Emirates", "United Kingdom",
  "Russia", "United States", "France", "Spain",
];
const OTHER_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh",
  "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil",
  "Bulgaria", "Cambodia", "Canada", "Chile", "China", "Colombia",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Egypt",
  "Estonia", "Ethiopia", "Finland", "Georgia", "Ghana", "Greece",
  "Hungary", "India", "Indonesia", "Iraq", "Ireland", "Israel", "Italy",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan",
  "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Malaysia",
  "Mexico", "Moldova", "Mongolia", "Morocco", "Netherlands", "New Zealand",
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia",
  "South Africa", "South Korea", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Thailand", "Tunisia", "Turkmenistan", "Ukraine",
  "Uzbekistan", "Venezuela", "Vietnam", "Yemen",
];
const COUNTRIES = [...TOP_COUNTRIES, ...OTHER_COUNTRIES.slice().sort()];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "TRY", label: "₺ TRY" },
  { value: "AED", label: "د.إ AED" },
  { value: "IRR", label: "﷼ IRR" },
  { value: "RUB", label: "₽ RUB" },
];

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  tr: {
    pageTitle: "İlan Ver",
    stepOf: (current: number, total: number) => `Adım ${current} / ${total}`,
    // Step 1
    step1Title: "Ne tür bir ilan vermek istiyorsunuz?",
    hasPlace: "Evim veya odam var, paylaşmak istiyorum",
    hasPlaceSub: "İyi bir ev arkadaşı arıyorum",
    needsPlace: "Evim yok, birlikte yaşayacak biri arıyorum",
    needsPlaceSub: "Uygun bir ev bulmak için eşleşin",
    next: "İleri",
    back: "Geri",
    home: "Ana Sayfa",
    submit: "İlanı Yayınla",
    submitting: "Yayınlanıyor...",
    edit: "Düzenle",
    // Step 2 – House Details (NEW)
    step2HouseTitle: "Konut Detayları",
    step2HouseHeading: "Evinizin Özelliklerini Belirtin",
    step2HouseSub: "Ne kadar detay verirseniz, o kadar doğru eşleşme bulursunuz 🏡",
    houseTypeLabel: "Konut Tipi",
    houseTypeApartment: "Daire",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Rezidans",
    houseTypeDormitory: "Yurt",
    houseTypeIndependent: "Müstakil Ev",
    floorLabel: "Kat",
    floorNote: "(0 = Giriş Katı)",
    elevatorLabel: "Asansör",
    elevatorYes: "Var",
    elevatorNo: "Yok",
    furnishedLabel: "Eşyalı mı?",
    furnishedYes: "Eşyalı",
    furnishedNo: "Eşyasız",
    countryLabel: "Ülke",
    countryPlaceholder: "Ülke ara...",
    cityLabel: "Şehir / İlçe",
    cityPlaceholder: "İstanbul, Berlin...",
    neighborhoodLabel: "Mahalle / Semt",
    neighborhoodPlaceholder: "Kadıköy, Beşiktaş...",
    pricingLabel: "Aylık Beklenen Paylaşım Ücreti",
    pricingSub: "Her bir ev arkadaşı için beklediğiniz ücret",
    // Step 3 – Housemate Prefs
    step2Title: "Evinizin detayları",
    smoking: "Evde Sigara İçilebilir mi?",
    smokingYes: "İzin Var",
    smokingNo: "İzin Yok",
    parking: "Otopark",
    parkingYes: "Mevcut",
    parkingNo: "Yok",
    currentResidents: "Şu An Kaç Kişisiniz?",
    genderPref: "Tercih Ettiğiniz Ev Arkadaşı Cinsiyeti",
    genderMale: "Erkek",
    genderFemale: "Kadın",
    genderAny: "Fark Etmez",
    occupationPref: "Ev Arkadaşının Mesleği",
    occStudent: "Öğrenci",
    occWorking: "Çalışan",
    occAny: "Fark Etmez",
    descLabel: "Kendinizi ve Aradığınız Ev Arkadaşını Tanıtın",
    descPlaceholder: "Örn: Düzenli ve saygılı biriyim. Sessiz, temiz ve çalışkan bir ev arkadaşı arıyorum...",
    step2Heading: "Aradığınız Ev Arkadaşını Tanımlayın",
    step2Sub: "Bize istediklerinizi söyleyin, size en uygun eşleşmeyi bulalım 🎯",
    neededRoommates: "Aranan Ev Arkadaşı Sayısı",
    rooms: "Oda Sayısı",
    rent: "Aylık Paylaşım Ücreti",
    currency: "Para Birimi",
    photos: "Ev Fotoğrafları (Maks. 3)",
    uploadPhotos: "Fotoğraf Yükle",
    addMorePhotos: "Daha Fazla Ekle",
    address: "Adres",
    addressPlaceholder: "Mahalle, sokak, şehir, ülke",
    // Step 4 – Review
    step3Title: "İlanınızı Onaylayın",
    typeLabel: "İlan Türü",
    hasPlaceLabel: "Ev sahibi — ev arkadaşı arıyor",
    needsPlaceLabel: "Ev arıyor — birlikte yaşayacak biri arıyor",
    smokingLabel: "Sigara",
    parkingLabel: "Otopark",
    residentsLabel: "Mevcut Ev Arkadaşı",
    roommatesLabel: "Aranan Ev Arkadaşı",
    roomsLabel: "Oda Sayısı",
    rentLabel: "Aylık Paylaşım Ücreti",
    addressLabel: "Adres",
    photosLabel: "Fotoğraflar",
    houseTypeReviewLabel: "Konut Tipi",
    floorReviewLabel: "Kat",
    elevatorReviewLabel: "Asansör",
    furnishedReviewLabel: "Eşyalı",
    locationReviewLabel: "Konum",
    priceReviewLabel: "Aylık Ücret",
    yes: "Var",
    no: "Yok",
    person: "kişi",
    // Auth
    notLoggedIn: "İlan verebilmek için giriş yapınız.",
    goHome: "Ana Sayfaya Dön",
    // Errors
    errorSubmit: "İlan yayınlanırken hata oluştu. Lütfen tekrar deneyin.",
    errorPhoto: "Fotoğraf yüklenirken hata oluştu.",
    successTitle: "İlanınız Yayınlandı!",
    successSub: "İlanınız başarıyla oluşturuldu.",
    viewListings: "İlanlara Bak",
    createAnother: "Yeni İlan Ver",
    requiredField: "Bu alan zorunludur.",
    selectType: "Lütfen bir ilan türü seçin.",
    fillRequired: "Lütfen zorunlu alanları doldurun.",
  },
  en: {
    pageTitle: "Create Listing",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    // Step 1
    step1Title: "What type of listing would you like to create?",
    hasPlace: "I have a home or room and want to share it",
    hasPlaceSub: "Looking for a good roommate",
    needsPlace: "I don't have a place and looking to share with someone",
    needsPlaceSub: "Match with others to find a home together",
    next: "Next",
    back: "Back",
    home: "Home",
    submit: "Publish Listing",
    submitting: "Publishing...",
    edit: "Edit",
    // Step 2 – House Details (NEW)
    step2HouseTitle: "House Details",
    step2HouseHeading: "Tell Us About Your Home",
    step2HouseSub: "The more details you provide, the better match we find 🏡",
    houseTypeLabel: "Property Type",
    houseTypeApartment: "Apartment",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Residence",
    houseTypeDormitory: "Dormitory",
    houseTypeIndependent: "Independent House",
    floorLabel: "Floor",
    floorNote: "(0 = Ground Floor)",
    elevatorLabel: "Elevator",
    elevatorYes: "Yes",
    elevatorNo: "No",
    furnishedLabel: "Furnished?",
    furnishedYes: "Furnished",
    furnishedNo: "Unfurnished",
    countryLabel: "Country",
    countryPlaceholder: "Search country...",
    cityLabel: "City / District",
    cityPlaceholder: "Istanbul, Berlin...",
    neighborhoodLabel: "Neighborhood",
    neighborhoodPlaceholder: "Kadıköy, Beşiktaş...",
    pricingLabel: "Expected Monthly Cost",
    pricingSub: "Expected cost per housemate",
    // Step 3 – Housemate Prefs
    step2Title: "Details about your place",
    smoking: "Is Smoking Allowed at Home?",
    smokingYes: "Allowed",
    smokingNo: "Not Allowed",
    parking: "Parking",
    parkingYes: "Available",
    parkingNo: "Not Available",
    currentResidents: "How Many People Currently Live There?",
    genderPref: "Preferred Housemate Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderAny: "No Preference",
    occupationPref: "Housemate Occupation",
    occStudent: "Student",
    occWorking: "Working",
    occAny: "No Preference",
    descLabel: "Introduce Yourself and Describe Your Ideal Housemate",
    descPlaceholder: "E.g: I'm tidy and respectful. Looking for a quiet, clean and hardworking housemate...",
    step2Heading: "Describe Your Ideal Housemate",
    step2Sub: "Tell us what you're looking for and we'll find the perfect match for you 🎯",
    neededRoommates: "Number of Roommates Needed",
    rooms: "Number of Rooms",
    rent: "Monthly Sharing Cost",
    currency: "Currency",
    photos: "Photos of the Place (Max 3)",
    uploadPhotos: "Upload Photos",
    addMorePhotos: "Add More",
    address: "Address",
    addressPlaceholder: "Street, neighbourhood, city, country",
    // Step 4 – Review
    step3Title: "Confirm Your Listing",
    typeLabel: "Listing Type",
    hasPlaceLabel: "Has a place — looking for roommate(s)",
    needsPlaceLabel: "No place — looking to share with someone",
    smokingLabel: "Smoking",
    parkingLabel: "Parking",
    residentsLabel: "Current Residents",
    roommatesLabel: "Roommates Needed",
    roomsLabel: "Number of Rooms",
    rentLabel: "Monthly Sharing Cost",
    addressLabel: "Address",
    photosLabel: "Photos",
    houseTypeReviewLabel: "Property Type",
    floorReviewLabel: "Floor",
    elevatorReviewLabel: "Elevator",
    furnishedReviewLabel: "Furnished",
    locationReviewLabel: "Location",
    priceReviewLabel: "Monthly Cost",
    yes: "Yes",
    no: "No",
    person: "person",
    // Auth
    notLoggedIn: "Please sign in to create a listing.",
    goHome: "Go to Home",
    // Errors
    errorSubmit: "Error publishing listing. Please try again.",
    errorPhoto: "Error uploading photo.",
    successTitle: "Listing Published!",
    successSub: "Your listing has been created successfully.",
    viewListings: "Browse Listings",
    createAnother: "Create Another",
    requiredField: "This field is required.",
    selectType: "Please select a listing type.",
    fillRequired: "Please fill in all required fields.",
  },
  fa: {
    pageTitle: "ثبت آگهی",
    stepOf: (current: number, total: number) => `مرحله ${current} از ${total}`,
    // Step 1
    step1Title: "چه نوع آگهی می‌خواهید ثبت کنید؟",
    hasPlace: "خونه یا اتاق دارم و می‌خوام با دیگران به اشتراک بگذارم",
    hasPlaceSub: "دنبال هم‌خونه خوب می‌گردم",
    needsPlace: "خانه ندارم و دنبال هم‌خانه می‌گردم",
    needsPlaceSub: "با دیگران برای پیدا کردن خانه همکاری کنید",
    next: "بعدی",
    back: "برگشت",
    home: "صفحه اصلی",
    submit: "ثبت آگهی",
    submitting: "در حال ثبت...",
    edit: "ویرایش",
    // Step 2 – House Details (NEW)
    step2HouseTitle: "مشخصات خانه",
    step2HouseHeading: "ویژگی‌های خونه‌تون رو بگید",
    step2HouseSub: "هر چقدر جزئیات بیشتری بدید، هم‌خانه بهتری پیدا می‌کنیم 🏡",
    houseTypeLabel: "نوع خانه",
    houseTypeApartment: "آپارتمان",
    houseTypeVilla: "ویلا",
    houseTypeResidence: "رزیدانس",
    houseTypeDormitory: "خوابگاه",
    houseTypeIndependent: "خانه مستقل",
    floorLabel: "طبقه",
    floorNote: "(۰ = همکف)",
    elevatorLabel: "آسانسور",
    elevatorYes: "هست",
    elevatorNo: "نیست",
    furnishedLabel: "با امکانات؟",
    furnishedYes: "با امکانات",
    furnishedNo: "خالی",
    countryLabel: "کشور",
    countryPlaceholder: "جستجوی کشور...",
    cityLabel: "شهر / منطقه",
    cityPlaceholder: "تهران، برلین...",
    neighborhoodLabel: "محله",
    neighborhoodPlaceholder: "ونک، نیاوران...",
    pricingLabel: "هزینه ماهانه مورد انتظار",
    pricingSub: "هزینه مورد انتظار برای هر هم‌خانه",
    // Step 3 – Housemate Prefs
    step2Title: "جزئیات خانه شما",
    smoking: "در خانه سیگار کشیدن مجاز است؟",
    smokingYes: "بله",
    smokingNo: "خیر",
    parking: "پارکینگ دارد؟",
    parkingYes: "بله",
    parkingNo: "خیر",
    currentResidents: "الان چند نفر هستید؟",
    genderPref: "جنسیت هم‌خانه مورد نظر",
    genderMale: "مرد",
    genderFemale: "زن",
    genderAny: "فرقی نمیکنه",
    occupationPref: "شغل هم‌خانه",
    occStudent: "دانشجو",
    occWorking: "شاغل",
    occAny: "فرقی نمیکنه",
    descLabel: "خودتون رو معرفی کنید و بگید دنبال چه هم‌خانه‌ای می‌گردید",
    descPlaceholder: "مثلاً: من آدم منظم و محترمی هستم. دنبال هم‌خانه‌ای آرام، تمیز و پرتلاش می‌گردم...",
    step2Heading: "مشخصات هم‌خانه مورد نظرتون رو بدید",
    step2Sub: "مشخصات بدید، ما بهترین هم‌خانه رو براتون پیدا می‌کنیم 🎯",
    neededRoommates: "تعداد هم‌خانه مورد نیاز",
    rooms: "تعداد اتاق‌ها",
    rent: "هزینه مشترک",
    currency: "واحد پول",
    photos: "عکس‌های خانه (حداکثر ۳)",
    uploadPhotos: "آپلود عکس",
    addMorePhotos: "افزودن بیشتر",
    address: "آدرس",
    addressPlaceholder: "خیابان، محله، شهر، کشور",
    // Step 4 – Review
    step3Title: "تأیید نهایی",
    typeLabel: "نوع آگهی",
    hasPlaceLabel: "خانه دارد — دنبال هم‌خانه",
    needsPlaceLabel: "خانه ندارد — دنبال هم‌خانه",
    smokingLabel: "سیگار",
    parkingLabel: "پارکینگ",
    residentsLabel: "ساکنان فعلی",
    roommatesLabel: "هم‌خانه مورد نیاز",
    roomsLabel: "تعداد اتاق‌ها",
    rentLabel: "هزینه مشترک ماهانه",
    addressLabel: "آدرس",
    photosLabel: "عکس‌ها",
    houseTypeReviewLabel: "نوع خانه",
    floorReviewLabel: "طبقه",
    elevatorReviewLabel: "آسانسور",
    furnishedReviewLabel: "با امکانات",
    locationReviewLabel: "موقعیت",
    priceReviewLabel: "هزینه ماهانه",
    yes: "بله",
    no: "خیر",
    person: "نفر",
    // Auth
    notLoggedIn: "برای ثبت آگهی لطفاً وارد شوید.",
    goHome: "برو به صفحه اصلی",
    // Errors
    errorSubmit: "خطا در ثبت آگهی. لطفاً دوباره امتحان کنید.",
    errorPhoto: "خطا در آپلود عکس.",
    successTitle: "آگهی ثبت شد!",
    successSub: "آگهی شما با موفقیت ایجاد شد.",
    viewListings: "مرور آگهی‌ها",
    createAnother: "ثبت آگهی جدید",
    requiredField: "این فیلد الزامی است.",
    selectType: "لطفاً نوع آگهی را انتخاب کنید.",
    fillRequired: "لطفاً همه فیلدهای الزامی را پر کنید.",
  },
  de: {
    pageTitle: "Inserat aufgeben",
    stepOf: (current: number, total: number) => `Schritt ${current} von ${total}`,
    step1Title: "Welche Art von Inserat möchten Sie aufgeben?",
    hasPlace: "Ich habe eine Wohnung oder ein Zimmer und möchte es teilen",
    hasPlaceSub: "Suche einen guten Mitbewohner",
    needsPlace: "Ich habe keine Wohnung und suche jemanden zum Miteinanderwohnen",
    needsPlaceSub: "Gemeinsam mit anderen eine Wohnung finden",
    next: "Weiter",
    back: "Zurück",
    home: "Startseite",
    submit: "Inserat veröffentlichen",
    submitting: "Wird veröffentlicht...",
    edit: "Bearbeiten",
    // Step 2 – House Details (NEW)
    step2HouseTitle: "Wohnungsdetails",
    step2HouseHeading: "Beschreiben Sie Ihr Zuhause",
    step2HouseSub: "Je mehr Details Sie angeben, desto besser finden wir einen passenden Mitbewohner 🏡",
    houseTypeLabel: "Immobilientyp",
    houseTypeApartment: "Wohnung",
    houseTypeVilla: "Villa",
    houseTypeResidence: "Residenz",
    houseTypeDormitory: "Wohnheim",
    houseTypeIndependent: "Einfamilienhaus",
    floorLabel: "Stockwerk",
    floorNote: "(0 = Erdgeschoss)",
    elevatorLabel: "Aufzug",
    elevatorYes: "Vorhanden",
    elevatorNo: "Nicht vorhanden",
    furnishedLabel: "Möbliert?",
    furnishedYes: "Möbliert",
    furnishedNo: "Unmöbliert",
    countryLabel: "Land",
    countryPlaceholder: "Land suchen...",
    cityLabel: "Stadt / Bezirk",
    cityPlaceholder: "Istanbul, Berlin...",
    neighborhoodLabel: "Stadtteil",
    neighborhoodPlaceholder: "Kadıköy, Beşiktaş...",
    pricingLabel: "Erwartete monatliche Kosten",
    pricingSub: "Erwartete Kosten pro Mitbewohner",
    // Step 3 – Housemate Prefs
    step2Title: "Details zu Ihrer Wohnung",
    smoking: "Ist Rauchen zu Hause erlaubt?",
    smokingYes: "Erlaubt",
    smokingNo: "Nicht erlaubt",
    parking: "Parkplatz vorhanden?",
    parkingYes: "Vorhanden",
    parkingNo: "Nicht vorhanden",
    currentResidents: "Wie viele Personen wohnen aktuell dort?",
    genderPref: "Bevorzugtes Geschlecht des Mitbewohners",
    genderMale: "Mann",
    genderFemale: "Frau",
    genderAny: "Egal",
    occupationPref: "Beruf des Mitbewohners",
    occStudent: "Student",
    occWorking: "Berufstätig",
    occAny: "Egal",
    descLabel: "Stellen Sie sich vor und beschreiben Sie Ihren idealen Mitbewohner",
    descPlaceholder: "Z.B: Ich bin ordentlich und respektvoll. Suche einen ruhigen, sauberen und fleißigen Mitbewohner...",
    step2Heading: "Beschreiben Sie Ihren idealen Mitbewohner",
    step2Sub: "Sagen Sie uns, was Sie suchen, und wir finden den perfekten Match für Sie 🎯",
    neededRoommates: "Benötigte Anzahl Mitbewohner",
    rooms: "Anzahl der Zimmer",
    rent: "Monatliche WG-Kosten",
    currency: "Währung",
    photos: "Fotos der Wohnung (max. 3)",
    uploadPhotos: "Fotos hochladen",
    addMorePhotos: "Weitere hinzufügen",
    address: "Adresse",
    addressPlaceholder: "Straße, Stadtteil, Stadt, Land",
    // Step 4 – Review
    step3Title: "Inserat bestätigen",
    typeLabel: "Inseratstyp",
    hasPlaceLabel: "Hat Wohnung — sucht Mitbewohner",
    needsPlaceLabel: "Keine Wohnung — sucht Mitbewohner",
    smokingLabel: "Rauchen",
    parkingLabel: "Parkplatz",
    residentsLabel: "Aktuelle Bewohner",
    roommatesLabel: "Benötigte Mitbewohner",
    roomsLabel: "Anzahl der Zimmer",
    rentLabel: "Monatliche WG-Kosten",
    addressLabel: "Adresse",
    photosLabel: "Fotos",
    houseTypeReviewLabel: "Immobilientyp",
    floorReviewLabel: "Stockwerk",
    elevatorReviewLabel: "Aufzug",
    furnishedReviewLabel: "Möbliert",
    locationReviewLabel: "Standort",
    priceReviewLabel: "Monatliche Kosten",
    yes: "Ja",
    no: "Nein",
    person: "Person",
    notLoggedIn: "Bitte melden Sie sich an, um ein Inserat aufzugeben.",
    goHome: "Zur Startseite",
    errorSubmit: "Fehler beim Veröffentlichen des Inserats. Bitte versuchen Sie es erneut.",
    errorPhoto: "Fehler beim Hochladen des Fotos.",
    successTitle: "Inserat veröffentlicht!",
    successSub: "Ihr Inserat wurde erfolgreich erstellt.",
    viewListings: "Inserate durchsuchen",
    createAnother: "Weiteres Inserat aufgeben",
    requiredField: "Dieses Feld ist erforderlich.",
    selectType: "Bitte wählen Sie einen Inseratstyp.",
    fillRequired: "Bitte füllen Sie alle Pflichtfelder aus.",
  },
  ar: {
    pageTitle: "نشر إعلان",
    stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
    // Step 1
    step1Title: "ما نوع الإعلان الذي تريد نشره؟",
    hasPlace: "لدي منزل أو غرفة وأريد مشاركتها",
    hasPlaceSub: "أبحث عن شريك سكن جيد",
    needsPlace: "ليس لديَّ مكان وأبحث عن شريك سكن",
    needsPlaceSub: "تعاون مع الآخرين لإيجاد منزل معاً",
    next: "التالي",
    back: "رجوع",
    home: "الصفحة الرئيسية",
    submit: "نشر الإعلان",
    submitting: "جارٍ النشر...",
    edit: "تعديل",
    // Step 2 – House Details (NEW)
    step2HouseTitle: "تفاصيل المنزل",
    step2HouseHeading: "أخبرنا عن منزلك",
    step2HouseSub: "كلما أعطيت تفاصيل أكثر، وجدنا تطابقاً أفضل 🏡",
    houseTypeLabel: "نوع العقار",
    houseTypeApartment: "شقة",
    houseTypeVilla: "فيلا",
    houseTypeResidence: "ريزيدانس",
    houseTypeDormitory: "سكن طلابي",
    houseTypeIndependent: "بيت مستقل",
    floorLabel: "الطابق",
    floorNote: "(0 = الطابق الأرضي)",
    elevatorLabel: "مصعد",
    elevatorYes: "يوجد",
    elevatorNo: "لا يوجد",
    furnishedLabel: "مفروش؟",
    furnishedYes: "مفروش",
    furnishedNo: "غير مفروش",
    countryLabel: "البلد",
    countryPlaceholder: "ابحث عن البلد...",
    cityLabel: "المدينة / المنطقة",
    cityPlaceholder: "إسطنبول، برلين...",
    neighborhoodLabel: "الحي",
    neighborhoodPlaceholder: "كاديكوي، بيشيكتاش...",
    pricingLabel: "التكلفة الشهرية المتوقعة",
    pricingSub: "التكلفة المتوقعة لكل شريك سكن",
    // Step 3 – Housemate Prefs
    step2Title: "تفاصيل المكان",
    smoking: "هل التدخين مسموح به في المنزل؟",
    smokingYes: "مسموح",
    smokingNo: "غير مسموح",
    parking: "مواقف سيارات؟",
    parkingYes: "متوفر",
    parkingNo: "غير متوفر",
    currentResidents: "كم عدد الساكنين حالياً؟",
    genderPref: "الجنس المفضل لشريك السكن",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    genderAny: "لا يهم",
    occupationPref: "مهنة شريك السكن",
    occStudent: "طالب",
    occWorking: "موظف",
    occAny: "لا يهم",
    descLabel: "عرّف بنفسك واشرح شريك السكن المثالي لك",
    descPlaceholder: "مثلاً: أنا شخص منظم ومحترم. أبحث عن شريك سكن هادئ ونظيف ومجتهد...",
    step2Heading: "حدد مواصفات شريك السكن المطلوب",
    step2Sub: "أخبرنا بما تريد وسنجد لك أفضل شريك سكن 🎯",
    neededRoommates: "عدد شركاء السكن المطلوبين",
    rooms: "عدد الغرف",
    rent: "تكلفة المشاركة الشهرية",
    currency: "العملة",
    photos: "صور المكان (حد أقصى ٣)",
    uploadPhotos: "رفع الصور",
    addMorePhotos: "إضافة المزيد",
    address: "العنوان",
    addressPlaceholder: "الشارع، الحي، المدينة، البلد",
    // Step 4 – Review
    step3Title: "تأكيد الإعلان",
    typeLabel: "نوع الإعلان",
    hasPlaceLabel: "لديه مكان — يبحث عن شريك سكن",
    needsPlaceLabel: "ليس لديه مكان — يبحث عن المشاركة",
    smokingLabel: "التدخين",
    parkingLabel: "مواقف السيارات",
    residentsLabel: "السكان الحاليون",
    roommatesLabel: "شركاء السكن المطلوبون",
    roomsLabel: "عدد الغرف",
    rentLabel: "تكلفة المشاركة الشهرية",
    addressLabel: "العنوان",
    photosLabel: "الصور",
    houseTypeReviewLabel: "نوع العقار",
    floorReviewLabel: "الطابق",
    elevatorReviewLabel: "مصعد",
    furnishedReviewLabel: "مفروش",
    locationReviewLabel: "الموقع",
    priceReviewLabel: "التكلفة الشهرية",
    yes: "نعم",
    no: "لا",
    person: "شخص",
    // Auth
    notLoggedIn: "يرجى تسجيل الدخول لنشر إعلان.",
    goHome: "الذهاب إلى الرئيسية",
    // Errors
    errorSubmit: "خطأ في نشر الإعلان. يرجى المحاولة مرة أخرى.",
    errorPhoto: "خطأ في رفع الصورة.",
    successTitle: "تم نشر الإعلان!",
    successSub: "تم إنشاء إعلانك بنجاح.",
    viewListings: "تصفّح الإعلانات",
    createAnother: "نشر إعلان آخر",
    requiredField: "هذا الحقل مطلوب.",
    selectType: "يرجى اختيار نوع الإعلان.",
    fillRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
  },
  ru: {
    pageTitle: "Разместить объявление",
    stepOf: (current: number, total: number) => `Шаг ${current} из ${total}`,
    // Step 1
    step1Title: "Какой тип объявления вы хотите разместить?",
    hasPlace: "У меня есть жильё или комната, хочу поделиться",
    hasPlaceSub: "Ищу хорошего соседа",
    needsPlace: "У меня нет жилья, ищу совместное проживание",
    needsPlaceSub: "Найдите жильё вместе с другими",
    next: "Далее",
    back: "Назад",
    home: "Главная",
    submit: "Опубликовать",
    submitting: "Публикация...",
    edit: "Редактировать",
    // Step 2 – House Details (NEW)
    step2HouseTitle: "Детали жилья",
    step2HouseHeading: "Расскажите о вашем жилье",
    step2HouseSub: "Чем больше деталей вы укажете, тем лучше мы найдём соседа 🏡",
    houseTypeLabel: "Тип жилья",
    houseTypeApartment: "Квартира",
    houseTypeVilla: "Вилла",
    houseTypeResidence: "Резиденция",
    houseTypeDormitory: "Общежитие",
    houseTypeIndependent: "Частный дом",
    floorLabel: "Этаж",
    floorNote: "(0 = Первый этаж)",
    elevatorLabel: "Лифт",
    elevatorYes: "Есть",
    elevatorNo: "Нет",
    furnishedLabel: "Меблированная?",
    furnishedYes: "Меблированная",
    furnishedNo: "Без мебели",
    countryLabel: "Страна",
    countryPlaceholder: "Поиск страны...",
    cityLabel: "Город / Район",
    cityPlaceholder: "Стамбул, Берлин...",
    neighborhoodLabel: "Район",
    neighborhoodPlaceholder: "Кадыкёй, Бешикташ...",
    pricingLabel: "Ожидаемые ежемесячные расходы",
    pricingSub: "Ожидаемые расходы на каждого соседа",
    // Step 3 – Housemate Prefs
    step2Title: "Детали вашего жилья",
    smoking: "Разрешено ли курение дома?",
    smokingYes: "Разрешено",
    smokingNo: "Не разрешено",
    parking: "Есть парковка?",
    parkingYes: "Есть",
    parkingNo: "Нет",
    currentResidents: "Сколько человек сейчас проживает?",
    genderPref: "Предпочтительный пол соседа",
    genderMale: "Мужчина",
    genderFemale: "Женщина",
    genderAny: "Не важно",
    occupationPref: "Профессия соседа",
    occStudent: "Студент",
    occWorking: "Работающий",
    occAny: "Не важно",
    descLabel: "Расскажите о себе и опишите идеального соседа",
    descPlaceholder: "Напр: Я аккуратный и уважительный человек. Ищу тихого, чистоплотного и трудолюбивого соседа...",
    step2Heading: "Опишите желаемого соседа",
    step2Sub: "Расскажите нам, что вы ищете, и мы найдём идеального соседа для вас 🎯",
    neededRoommates: "Нужное количество соседей",
    rooms: "Количество комнат",
    rent: "Стоимость совместного проживания в месяц",
    currency: "Валюта",
    photos: "Фото жилья (макс. 3)",
    uploadPhotos: "Загрузить фото",
    addMorePhotos: "Добавить ещё",
    address: "Адрес",
    addressPlaceholder: "Улица, район, город, страна",
    // Step 4 – Review
    step3Title: "Подтвердите объявление",
    typeLabel: "Тип объявления",
    hasPlaceLabel: "Есть жильё — ищет соседа",
    needsPlaceLabel: "Нет жилья — ищет совместное проживание",
    smokingLabel: "Курение",
    parkingLabel: "Парковка",
    residentsLabel: "Текущие жильцы",
    roommatesLabel: "Нужные соседи",
    roomsLabel: "Количество комнат",
    rentLabel: "Стоимость совместного проживания в месяц",
    addressLabel: "Адрес",
    photosLabel: "Фото",
    houseTypeReviewLabel: "Тип жилья",
    floorReviewLabel: "Этаж",
    elevatorReviewLabel: "Лифт",
    furnishedReviewLabel: "Меблированность",
    locationReviewLabel: "Расположение",
    priceReviewLabel: "Ежемесячные расходы",
    yes: "Да",
    no: "Нет",
    person: "чел.",
    // Auth
    notLoggedIn: "Войдите, чтобы разместить объявление.",
    goHome: "Перейти на главную",
    // Errors
    errorSubmit: "Ошибка при публикации объявления. Попробуйте снова.",
    errorPhoto: "Ошибка загрузки фото.",
    successTitle: "Объявление опубликовано!",
    successSub: "Ваше объявление успешно создано.",
    viewListings: "Просмотреть объявления",
    createAnother: "Разместить ещё",
    requiredField: "Это поле обязательно.",
    selectType: "Пожалуйста, выберите тип объявления.",
    fillRequired: "Пожалуйста, заполните все обязательные поля.",
  },
};

type ListingType = "has_place" | "needs_place";
type Currency = "USD" | "EUR" | "TRY" | "AED" | "IRR" | "RUB";
type GenderPref = "male" | "female" | "any";
type OccupationPref = "student" | "working" | "any";

interface ListingForm {
  type: ListingType | null;
  // House details (step 2)
  houseType: string;
  floor: number;
  elevator: boolean;
  parking: boolean;
  furnished: boolean;
  country: string;
  city: string;
  neighborhood: string;
  price: string;
  currency: Currency;
  // Housemate prefs (step 3)
  smoking: boolean;
  current_residents: number;
  needed_roommates: number;
  rooms: number;
  rent: string;
  photos: File[];
  photoPreviews: string[];
  address: string;
  gender_preference: GenderPref;
  occupation_preference: OccupationPref;
  description: string;
}

const initialForm: ListingForm = {
  type: null,
  houseType: "",
  floor: 1,
  elevator: false,
  parking: false,
  furnished: false,
  country: "",
  city: "",
  neighborhood: "",
  price: "",
  currency: "USD",
  smoking: false,
  current_residents: 1,
  needed_roommates: 1,
  rooms: 2,
  rent: "",
  photos: [],
  photoPreviews: [],
  address: "",
  gender_preference: "any",
  occupation_preference: "any",
  description: "",
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  TRY: "₺",
  AED: "د.إ",
  IRR: "﷼",
  RUB: "₽",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({
  value,
  labelOn,
  labelOff,
  onChange,
}: {
  value: boolean;
  labelOn: string;
  labelOff: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm font-semibold">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-2.5 transition-all duration-200 ${
          value
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-inner"
            : "bg-white text-stone-500 hover:bg-stone-50"
        }`}
      >
        {labelOn}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-2.5 transition-all duration-200 ${
          !value
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-inner"
            : "bg-white text-stone-500 hover:bg-stone-50"
        }`}
      >
        {labelOff}
      </button>
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:border-orange-400 hover:text-orange-500 transition-all active:scale-90 font-bold text-lg"
      >
        −
      </button>
      <span className="w-10 text-center text-lg font-black text-stone-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:border-orange-400 hover:text-orange-500 transition-all active:scale-90 font-bold text-lg"
      >
        +
      </button>
    </div>
  );
}

function OptionGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm font-semibold">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 transition-all duration-200 ${
            value === opt.value
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-inner"
              : "bg-white text-stone-500 hover:bg-stone-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            value === opt.value
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
              : "bg-gray-100 text-stone-600 hover:bg-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CountrySelect({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
}) {
  const [inputVal, setInputVal] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputVal(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (!COUNTRIES.includes(inputVal)) setInputVal(value);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputVal, value]);

  const filtered = inputVal.trim() === ""
    ? COUNTRIES
    : COUNTRIES.filter((c) => c.toLowerCase().includes(inputVal.toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-stone-700 mb-2">{label}</label>
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => { setInputVal(e.target.value); setIsOpen(true); }}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((country) => (
            <button
              key={country}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(country); setInputVal(country); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${
                value === country ? "text-orange-500 font-semibold" : "text-stone-700"
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en" | "fa" | "ar" | "de" | "ru">("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem("sefira-lang");
    if (saved === "tr" || saved === "en" || saved === "fa" || saved === "ar" || saved === "de" || saved === "ru") setLang(saved);
  }, []);
  useEffect(() => { localStorage.setItem("sefira-lang", lang); }, [lang]);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ListingForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ListingForm>(key: K, val: ListingForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Photo handling
  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - form.photos.length;
    const newFiles = files.slice(0, remaining);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    set("photos", [...form.photos, ...newFiles]);
    set("photoPreviews", [...form.photoPreviews, ...previews]);
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(form.photoPreviews[idx]);
    set("photos", form.photos.filter((_, i) => i !== idx));
    set("photoPreviews", form.photoPreviews.filter((_, i) => i !== idx));
  };

  // Navigation — 4 steps total for has_place, 2 for needs_place
  const goNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!form.type) { setValidationError(t.selectType); return; }
      setStep(form.type === "needs_place" ? 4 : 2);
      return;
    }
    if (step === 2) { setStep(3); return; }
    if (step === 3) { setStep(4); }
  };

  const goBack = () => {
    setValidationError(null);
    if (step === 4 && form.type === "needs_place") { setStep(1); return; }
    if (step === 4) { setStep(3); return; }
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); }
  };

  // Submit
  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const photoUrls: string[] = [];
    for (const file of form.photos) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { upsert: false });
      if (upErr) {
        setSubmitError(t.errorPhoto);
        setSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("listing-photos").getPublicUrl(path);
      photoUrls.push(publicUrl);
    }

    const payload: Record<string, unknown> = {
      user_id: user.id,
      type: form.type,
    };

    if (form.type === "has_place") {
      // House details (step 2)
      payload.house_type = form.houseType || null;
      payload.floor = form.floor;
      payload.elevator = form.elevator;
      payload.parking = form.parking;
      payload.furnished = form.furnished;
      payload.country = form.country || null;
      payload.city = form.city || null;
      payload.neighborhood = form.neighborhood || null;
      payload.rent = parseFloat(form.price) || null;
      payload.currency = form.currency;
      // Housemate prefs (step 3)
      payload.smoking = form.smoking;
      payload.current_residents = form.current_residents;
      payload.needed_roommates = form.needed_roommates;
      payload.rooms = form.rooms;
      payload.photos = photoUrls;
      payload.address = form.address;
      payload.gender_preference = form.gender_preference;
      payload.occupation_preference = form.occupation_preference;
      payload.description = form.description;
    }

    const { error: dbErr } = await supabase.from("listings").insert(payload);

    if (dbErr) {
      setSubmitError(t.errorSubmit);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const dir = lang === "fa" || lang === "ar" ? "rtl" : "ltr";

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <p className="text-stone-600 text-center font-medium">{t.notLoggedIn}</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
        >
          {t.goHome}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-stone-900">{t.successTitle}</h2>
          <p className="text-stone-500 mt-1">{t.successSub}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 transition-all text-center text-sm"
          >
            {t.viewListings}
          </Link>
          <button
            onClick={() => { setForm(initialForm); setStep(1); setSubmitted(false); }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all text-sm"
          >
            {t.createAnother}
          </button>
        </div>
      </div>
    );
  }

  // ── Shared mini-navbar ────────────────────────────────────────────────────
  const Navbar = () => (
    <nav dir="ltr" style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform" }} className="fixed top-0 left-0 right-0 w-full z-[9999] bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-all duration-300">
            S
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Sefira
          </span>
        </Link>
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangMenuOpen((o) => !o)}
            className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] font-black transition-all duration-200 hover:bg-stone-200 whitespace-nowrap"
          >
            <span className="text-sm leading-none">
              {lang === "tr" ? "🇹🇷" : lang === "en" ? "🇬🇧" : lang === "fa" ? "🇮🇷" : lang === "ar" ? "🇸🇦" : lang === "ru" ? "🇷🇺" : "🇩🇪"}
            </span>
            <span className="text-stone-700">
              {lang === "tr" ? "TR" : lang === "en" ? "EN" : lang === "fa" ? "FA" : lang === "ar" ? "AR" : lang === "ru" ? "RU" : "DE"}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {langMenuOpen && (
            <div className="absolute top-full mt-1 right-0 z-[100] bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden min-w-[90px]">
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
      </div>
    </nav>
  );

  // ── Progress bar ──────────────────────────────────────────────────────────
  const ProgressBar = () => {
    const displayTotal = form.type === "needs_place" ? 2 : 4;
    const displayStep = form.type === "needs_place" && step === 4 ? 2 : step;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-stone-500">{t.stepOf(displayStep, displayTotal)}</p>
          <p className="text-xs font-bold text-orange-500">{Math.round((displayStep / displayTotal) * 100)}%</p>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(displayStep / displayTotal) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // ── STEP 1: Type selection ────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mb-5">
            <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t.home}</span>
            </Link>
          </motion.div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step1Title}</p>

          <div className="flex flex-col gap-4">
            {(["has_place", "needs_place"] as ListingType[]).map((type) => {
              const isSelected = form.type === type;
              const label = type === "has_place" ? t.hasPlace : t.needsPlace;
              const sub = type === "has_place" ? t.hasPlaceSub : t.needsPlaceSub;
              const icon =
                type === "has_place" ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                );
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("type", type)}
                  className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-500/10"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-base leading-snug ${isSelected ? "text-orange-600" : "text-stone-900"}`}>
                      {label}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">{sub}</p>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                    isSelected ? "border-orange-500 bg-orange-500" : "border-stone-300"
                  }`}>
                    {isSelected && (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white p-0.5">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {validationError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {validationError}
            </p>
          )}

          <button
            onClick={goNext}
            className="mt-8 w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
          >
            {t.next}
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 2: House details (NEW, only for has_place) ───────────────────────
  if (step === 2 && form.type === "has_place") {
    const houseTypeOptions = [
      { label: t.houseTypeApartment, value: "apartment" },
      { label: t.houseTypeVilla, value: "villa" },
      { label: t.houseTypeResidence, value: "residence" },
      { label: t.houseTypeDormitory, value: "dormitory" },
      { label: t.houseTypeIndependent, value: "independent" },
    ];

    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </motion.div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step2HouseTitle}</p>

          {/* Header banner */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏡</div>
              <div>
                <p className="font-black text-gray-900 text-base">{t.step2HouseHeading}</p>
                <p className="text-gray-500 text-sm mt-1">{t.step2HouseSub}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">

            {/* 1. House type */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.houseTypeLabel}</label>
              <PillGroup
                options={houseTypeOptions}
                value={form.houseType}
                onChange={(v) => set("houseType", v)}
              />
            </div>

            {/* 2. Floor */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-stone-700">{t.floorLabel}</label>
                  <span className="text-xs text-stone-400 ml-2">{t.floorNote}</span>
                </div>
                <NumberStepper
                  value={form.floor}
                  onChange={(v) => set("floor", v)}
                  min={0}
                  max={40}
                />
              </div>
            </div>

            {/* 3. Elevator */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.elevatorLabel}</label>
              <Toggle
                value={form.elevator}
                labelOn={t.elevatorYes}
                labelOff={t.elevatorNo}
                onChange={(v) => set("elevator", v)}
              />
            </div>

            {/* 4. Parking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.parking}</label>
              <Toggle
                value={form.parking}
                labelOn={t.parkingYes}
                labelOff={t.parkingNo}
                onChange={(v) => set("parking", v)}
              />
            </div>

            {/* 5. Furnished */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.furnishedLabel}</label>
              <Toggle
                value={form.furnished}
                labelOn={t.furnishedYes}
                labelOff={t.furnishedNo}
                onChange={(v) => set("furnished", v)}
              />
            </div>

            {/* 6. Location */}
            <div className="p-5 flex flex-col gap-4">
              <CountrySelect
                value={form.country}
                onChange={(v) => set("country", v)}
                label={t.countryLabel}
                placeholder={t.countryPlaceholder}
              />
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t.cityLabel}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder={t.cityPlaceholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t.neighborhoodLabel}</label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                  placeholder={t.neighborhoodPlaceholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                />
              </div>
            </div>

            {/* 7. Monthly cost */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-1">{t.pricingLabel}</label>
              <p className="text-xs text-stone-400 mb-3">{t.pricingSub}</p>
              {/* Currency pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                {CURRENCY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set("currency", c.value as Currency)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                      form.currency === c.value
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                        : "bg-gray-100 text-stone-600 hover:bg-gray-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
              />
            </div>
          </div>

          {validationError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {validationError}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.back}
            </button>
            <button
              onClick={goNext}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: Housemate preferences (was step 2) ────────────────────────────
  if (step === 3 && form.type === "has_place") {
    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </motion.div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step2Title}</p>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <p className="font-black text-gray-900 text-base">{t.step2Heading}</p>
                <p className="text-gray-500 text-sm mt-1">{t.step2Sub}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
            {/* 1. Gender preference */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.genderPref}</label>
              <OptionGroup
                value={form.gender_preference}
                onChange={(v) => set("gender_preference", v as GenderPref)}
                options={[
                  { label: t.genderMale, value: "male" },
                  { label: t.genderFemale, value: "female" },
                  { label: t.genderAny, value: "any" },
                ]}
              />
            </div>

            {/* 2. Occupation preference */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.occupationPref}</label>
              <OptionGroup
                value={form.occupation_preference}
                onChange={(v) => set("occupation_preference", v as OccupationPref)}
                options={[
                  { label: t.occStudent, value: "student" },
                  { label: t.occWorking, value: "working" },
                  { label: t.occAny, value: "any" },
                ]}
              />
            </div>

            {/* 3. Current residents */}
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.currentResidents}</label>
              <NumberStepper
                value={form.current_residents}
                onChange={(v) => set("current_residents", v)}
                min={1}
                max={10}
              />
            </div>

            {/* 4. Smoking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.smoking}</label>
              <Toggle
                value={form.smoking}
                labelOn={t.smokingYes}
                labelOff={t.smokingNo}
                onChange={(v) => set("smoking", v)}
              />
            </div>

            {/* 5. Description */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.descLabel}</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t.descPlaceholder}
                className="w-full border border-gray-200 rounded-2xl p-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm resize-none"
              />
            </div>
          </div>

          {validationError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {validationError}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.back}
            </button>
            <button
              onClick={goNext}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 4: Confirmation (was step 3) ─────────────────────────────────────
  if (step === 4) {
    const isHasPlace = form.type === "has_place";

    const locationParts = [form.neighborhood, form.city, form.country].filter(Boolean);
    const locationStr = locationParts.join(", ") || "—";

    const houseTypeLabels: Record<string, string> = {
      apartment: t.houseTypeApartment,
      villa: t.houseTypeVilla,
      residence: t.houseTypeResidence,
      dormitory: t.houseTypeDormitory,
      independent: t.houseTypeIndependent,
    };

    const rows: { label: string; value: string }[] = [
      { label: t.typeLabel, value: isHasPlace ? t.hasPlaceLabel : t.needsPlaceLabel },
      ...(isHasPlace
        ? [
            { label: t.houseTypeReviewLabel, value: houseTypeLabels[form.houseType] || "—" },
            { label: t.floorReviewLabel, value: `${form.floor}` },
            { label: t.elevatorReviewLabel, value: form.elevator ? t.yes : t.no },
            { label: t.parkingLabel, value: form.parking ? t.yes : t.no },
            { label: t.furnishedReviewLabel, value: form.furnished ? t.furnishedYes : t.furnishedNo },
            { label: t.locationReviewLabel, value: locationStr },
            {
              label: t.priceReviewLabel,
              value: form.price
                ? `${CURRENCY_SYMBOLS[form.currency]}${form.price} / ${lang === "tr" ? "ay" : lang === "fa" ? "ماه" : lang === "ar" ? "شهر" : lang === "de" ? "Mo." : lang === "ru" ? "мес." : "mo"}`
                : "—",
            },
            { label: t.smokingLabel, value: form.smoking ? t.smokingYes : t.smokingNo },
            { label: t.residentsLabel, value: `${form.current_residents} ${t.person}` },
          ]
        : []),
    ];

    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </motion.div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step3Title}</p>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {form.photoPreviews.length > 0 && (
              <div className="flex gap-1">
                {form.photoPreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="flex-1 h-40 object-cover"
                    style={{ maxWidth: `${100 / form.photoPreviews.length}%` }}
                  />
                ))}
              </div>
            )}

            <div className="divide-y divide-stone-100">
              {rows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between px-5 py-4 gap-4">
                  <span className="text-sm text-stone-500 font-medium flex-shrink-0">{label}</span>
                  <span className="text-sm font-semibold text-stone-900 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.edit}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t.submitting}
                </span>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
