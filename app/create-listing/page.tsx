"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { useLang } from "@/app/lib/LangContext";
import ReactCrop, { centerCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// ── Countries ─────────────────────────────────────────────────────────────────
const TOP_COUNTRY_CODES = ["TR", "IR", "DE", "AE", "GB", "RU", "US", "FR", "ES"];
const OTHER_COUNTRY_CODES = [
  "AF","AL","DZ","AD","AO","AR","AM","AU","AT","AZ","BH","BD",
  "BY","BE","BO","BA","BR","BG","KH","CA","CL","CN","CO","HR",
  "CU","CY","CZ","DK","EG","EE","ET","FI","GE","GH","GR","HU",
  "IN","ID","IQ","IE","IL","IT","JP","JO","KZ","KE","KW","KG",
  "LV","LB","LY","LT","LU","MY","MX","MD","MN","MA","NL","NZ",
  "NG","MK","NO","OM","PK","PS","PE","PH","PL","PT","QA","RO",
  "SA","RS","SG","SK","SI","ZA","KR","SE","CH","SY","TJ","TH",
  "TN","TM","UA","UZ","VE","VN","YE",
];

const LANG_MAP: Record<string, string> = {
  tr: "tr", en: "en", fa: "fa", ar: "ar", de: "de", ru: "ru",
};

const getCountryName = (countryCode: string, lang: string): string => {
  try {
    const displayNames = new Intl.DisplayNames([LANG_MAP[lang] || "en"], { type: "region" });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const CURRENCY_OPTIONS = [
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "TRY", label: "₺ TRY" },
  { value: "AED", label: "د.إ AED" },
  { value: "TOMAN", label: "🇮🇷 ت تومان" },
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
    city: "Şehir",
    district: "İlçe",
    neighborhood: "Mahalle / Semt",
    il: "İl",
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
    cropSave: "Kırp ve Kaydet",
    cropCancel: "İptal",
    successTitle: "İlanınız Yayınlandı!",
    successSub: "İlanınız başarıyla oluşturuldu.",
    viewListings: "İlanlara Bak",
    createAnother: "Yeni İlan Ver",
    requiredField: "Bu alan zorunludur.",
    selectType: "Lütfen bir ilan türü seçin.",
    fillRequired: "Lütfen zorunlu alanları doldurun.",
    // Needs-place step 2
    step2SeekerTitle: "Profil Bilgileri",
    step2SeekerHeading: "Kendinizi Tanıtın",
    step2SeekerSub: "Ne kadar detay verirseniz, o kadar iyi eşleşme bulursunuz 🎯",
    seekerGenderLabel: "Cinsiyetiniz",
    preferredRoommateGenderLabel: "Tercih Ettiğiniz Ev Arkadaşı Cinsiyeti",
    seekerAgeLabel: "Yaşınız",
    seekerOccLabel: "Mesleğiniz",
    seekerOccWorking: "Çalışıyorum",
    seekerOccStudent: "Öğrenciyim",
    maxBudgetLabel: "Maksimum Aylık Bütçe",
    privateRoomLabel: "Özel Oda Tercihi",
    privateRoomRequired: "Özel oda şart",
    privateRoomAny: "Farketmez",
    seekerSmokingLabel: "Sigara",
    seekerSmokingYes: "Sigara içiyorum",
    seekerSmokingNo: "İçmiyorum",
    quietLabel: "Sessizlik Tercihi",
    quietYes: "Sessizlik benim için önemli",
    quietAny: "Farketmez",
    petsLabel: "Evcil Hayvan",
    petsOk: "Evcil hayvan olabilir",
    petsNo: "Olmasın",
    cleanlinessLabel: "Temizlik Tercihi",
    cleanlinessYes: "Temizlik benim için önemli",
    cleanlinessAny: "Farketmez",
    aboutTextLabel: "Kendinizi Tanıtın (İsteğe Bağlı)",
    aboutTextPlaceholder: "Kendinizi tanıtın, nasıl bir ev/ev arkadaşı arıyorsunuz...",
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
    city: "City",
    district: "District",
    neighborhood: "Neighborhood / Area",
    il: "City / Province",
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
    cropSave: "Crop & Save",
    cropCancel: "Cancel",
    successTitle: "Listing Published!",
    successSub: "Your listing has been created successfully.",
    viewListings: "Browse Listings",
    createAnother: "Create Another",
    requiredField: "This field is required.",
    selectType: "Please select a listing type.",
    fillRequired: "Please fill in all required fields.",
    // Needs-place step 2
    step2SeekerTitle: "Your Profile",
    step2SeekerHeading: "Tell Us About Yourself",
    step2SeekerSub: "The more details you share, the better your match 🎯",
    seekerGenderLabel: "Your Gender",
    preferredRoommateGenderLabel: "Preferred Housemate Gender",
    seekerAgeLabel: "Your Age",
    seekerOccLabel: "Your Occupation",
    seekerOccWorking: "Employed",
    seekerOccStudent: "Student",
    maxBudgetLabel: "Maximum Monthly Budget",
    privateRoomLabel: "Private Room Preference",
    privateRoomRequired: "Private room required",
    privateRoomAny: "No preference",
    seekerSmokingLabel: "Smoking",
    seekerSmokingYes: "I smoke",
    seekerSmokingNo: "I don't smoke",
    quietLabel: "Quietness Preference",
    quietYes: "Quiet environment is important to me",
    quietAny: "No preference",
    petsLabel: "Pets",
    petsOk: "Pets are OK",
    petsNo: "No pets please",
    cleanlinessLabel: "Cleanliness Preference",
    cleanlinessYes: "Cleanliness is important to me",
    cleanlinessAny: "No preference",
    aboutTextLabel: "About You (Optional)",
    aboutTextPlaceholder: "Introduce yourself, what kind of home / housemate are you looking for...",
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
    city: "شهر",
    district: "منطقه",
    neighborhood: "محله",
    il: "استان / شهر",
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
    cropSave: "برش و ذخیره",
    cropCancel: "لغو",
    successTitle: "آگهی ثبت شد!",
    successSub: "آگهی شما با موفقیت ایجاد شد.",
    viewListings: "مرور آگهی‌ها",
    createAnother: "ثبت آگهی جدید",
    requiredField: "این فیلد الزامی است.",
    selectType: "لطفاً نوع آگهی را انتخاب کنید.",
    fillRequired: "لطفاً همه فیلدهای الزامی را پر کنید.",
    // Needs-place step 2
    step2SeekerTitle: "پروفایل شما",
    step2SeekerHeading: "درباره خودتان بگویید",
    step2SeekerSub: "هرچه جزئیات بیشتری بدید، بهتر هم‌خانه پیدا می‌کنید 🎯",
    seekerGenderLabel: "جنسیت شما",
    preferredRoommateGenderLabel: "جنسیت هم‌خانه مورد نظر",
    seekerAgeLabel: "سن شما",
    seekerOccLabel: "شغل شما",
    seekerOccWorking: "شاغلم",
    seekerOccStudent: "دانشجوام",
    maxBudgetLabel: "حداکثر بودجه ماهانه",
    privateRoomLabel: "ترجیح اتاق خصوصی",
    privateRoomRequired: "اتاق خصوصی لازم دارم",
    privateRoomAny: "فرقی نمیکنه",
    seekerSmokingLabel: "سیگار",
    seekerSmokingYes: "سیگار می‌کشم",
    seekerSmokingNo: "سیگار نمی‌کشم",
    quietLabel: "ترجیح آرامش",
    quietYes: "آرامش برام مهمه",
    quietAny: "فرقی نمیکنه",
    petsLabel: "حیوان خانگی",
    petsOk: "حیوان خانگی مشکلی نیست",
    petsNo: "نباشه",
    cleanlinessLabel: "ترجیح تمیزی",
    cleanlinessYes: "تمیزی برام مهمه",
    cleanlinessAny: "فرقی نمیکنه",
    aboutTextLabel: "درباره خودتون (اختیاری)",
    aboutTextPlaceholder: "خودتون رو معرفی کنید، دنبال چه خانه / هم‌خانه‌ای می‌گردید...",
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
    city: "Stadt",
    district: "Bezirk",
    neighborhood: "Stadtteil / Viertel",
    il: "Stadt / Provinz",
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
    cropSave: "Zuschneiden & Speichern",
    cropCancel: "Abbrechen",
    successTitle: "Inserat veröffentlicht!",
    successSub: "Ihr Inserat wurde erfolgreich erstellt.",
    viewListings: "Inserate durchsuchen",
    createAnother: "Weiteres Inserat aufgeben",
    requiredField: "Dieses Feld ist erforderlich.",
    selectType: "Bitte wählen Sie einen Inseratstyp.",
    fillRequired: "Bitte füllen Sie alle Pflichtfelder aus.",
    // Needs-place step 2
    step2SeekerTitle: "Ihr Profil",
    step2SeekerHeading: "Erzählen Sie uns über sich",
    step2SeekerSub: "Je mehr Details Sie angeben, desto besser finden wir einen passenden Mitbewohner 🎯",
    seekerGenderLabel: "Ihr Geschlecht",
    preferredRoommateGenderLabel: "Bevorzugtes Geschlecht des Mitbewohners",
    seekerAgeLabel: "Ihr Alter",
    seekerOccLabel: "Ihr Beruf",
    seekerOccWorking: "Berufstätig",
    seekerOccStudent: "Student/in",
    maxBudgetLabel: "Maximales Monatsbudget",
    privateRoomLabel: "Zimmer-Präferenz",
    privateRoomRequired: "Eigenes Zimmer erforderlich",
    privateRoomAny: "Egal",
    seekerSmokingLabel: "Rauchen",
    seekerSmokingYes: "Ich rauche",
    seekerSmokingNo: "Ich rauche nicht",
    quietLabel: "Ruhe-Präferenz",
    quietYes: "Ruhe ist mir wichtig",
    quietAny: "Egal",
    petsLabel: "Haustiere",
    petsOk: "Haustiere OK",
    petsNo: "Keine Haustiere",
    cleanlinessLabel: "Sauberkeits-Präferenz",
    cleanlinessYes: "Sauberkeit ist mir wichtig",
    cleanlinessAny: "Egal",
    aboutTextLabel: "Über Sie (Optional)",
    aboutTextPlaceholder: "Stellen Sie sich vor, welche Art von Wohnung / Mitbewohner suchen Sie...",
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
    city: "المدينة",
    district: "الحي",
    neighborhood: "الحارة / المنطقة",
    il: "المحافظة / المدينة",
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
    cropSave: "قص وحفظ",
    cropCancel: "إلغاء",
    successTitle: "تم نشر الإعلان!",
    successSub: "تم إنشاء إعلانك بنجاح.",
    viewListings: "تصفّح الإعلانات",
    createAnother: "نشر إعلان آخر",
    requiredField: "هذا الحقل مطلوب.",
    selectType: "يرجى اختيار نوع الإعلان.",
    fillRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
    // Needs-place step 2
    step2SeekerTitle: "ملفك الشخصي",
    step2SeekerHeading: "أخبرنا عن نفسك",
    step2SeekerSub: "كلما أعطيت تفاصيل أكثر، وجدنا تطابقاً أفضل 🎯",
    seekerGenderLabel: "جنسك",
    preferredRoommateGenderLabel: "الجنس المفضل لشريك السكن",
    seekerAgeLabel: "عمرك",
    seekerOccLabel: "مهنتك",
    seekerOccWorking: "موظف",
    seekerOccStudent: "طالب",
    maxBudgetLabel: "الحد الأقصى للميزانية الشهرية",
    privateRoomLabel: "تفضيل الغرفة الخاصة",
    privateRoomRequired: "غرفة خاصة ضرورية",
    privateRoomAny: "لا يهم",
    seekerSmokingLabel: "التدخين",
    seekerSmokingYes: "أدخن",
    seekerSmokingNo: "لا أدخن",
    quietLabel: "تفضيل الهدوء",
    quietYes: "الهدوء مهم بالنسبة لي",
    quietAny: "لا يهم",
    petsLabel: "الحيوانات الأليفة",
    petsOk: "الحيوانات الأليفة مقبولة",
    petsNo: "لا أريد حيوانات أليفة",
    cleanlinessLabel: "تفضيل النظافة",
    cleanlinessYes: "النظافة مهمة بالنسبة لي",
    cleanlinessAny: "لا يهم",
    aboutTextLabel: "عن نفسك (اختياري)",
    aboutTextPlaceholder: "عرّف بنفسك، ماذا تبحث في المسكن أو في شريك السكن...",
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
    city: "Город",
    district: "Район",
    neighborhood: "Микрорайон / Квартал",
    il: "Город / Провинция",
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
    cropSave: "Обрезать и сохранить",
    cropCancel: "Отмена",
    successTitle: "Объявление опубликовано!",
    successSub: "Ваше объявление успешно создано.",
    viewListings: "Просмотреть объявления",
    createAnother: "Разместить ещё",
    requiredField: "Это поле обязательно.",
    selectType: "Пожалуйста, выберите тип объявления.",
    fillRequired: "Пожалуйста, заполните все обязательные поля.",
    // Needs-place step 2
    step2SeekerTitle: "Ваш профиль",
    step2SeekerHeading: "Расскажите о себе",
    step2SeekerSub: "Чем больше деталей вы укажете, тем лучше подберём соседа 🎯",
    seekerGenderLabel: "Ваш пол",
    preferredRoommateGenderLabel: "Предпочтительный пол соседа",
    seekerAgeLabel: "Ваш возраст",
    seekerOccLabel: "Ваша профессия",
    seekerOccWorking: "Работаю",
    seekerOccStudent: "Студент/ка",
    maxBudgetLabel: "Максимальный месячный бюджет",
    privateRoomLabel: "Предпочтение по комнате",
    privateRoomRequired: "Отдельная комната обязательна",
    privateRoomAny: "Не важно",
    seekerSmokingLabel: "Курение",
    seekerSmokingYes: "Курю",
    seekerSmokingNo: "Не курю",
    quietLabel: "Предпочтение тишины",
    quietYes: "Тишина для меня важна",
    quietAny: "Не важно",
    petsLabel: "Домашние животные",
    petsOk: "Домашние животные — ОК",
    petsNo: "Без животных",
    cleanlinessLabel: "Предпочтение чистоты",
    cleanlinessYes: "Чистота для меня важна",
    cleanlinessAny: "Не важно",
    aboutTextLabel: "О себе (необязательно)",
    aboutTextPlaceholder: "Расскажите о себе, какое жильё / каких соседей вы ищете...",
  },
};

type ListingType = "has_place" | "needs_place";
type Currency = "USD" | "EUR" | "TRY" | "AED" | "TOMAN" | "RUB";
type GenderPref = "male" | "female" | "any";
type OccupationPref = "student" | "working" | "any";

interface ListingForm {
  type: ListingType | null;
  // House details (step 2)
  houseType: string | null;
  floor: number;
  elevator: boolean | null;
  parking: boolean | null;
  furnished: boolean | null;
  countryCode: string;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  price: string;
  currency: Currency;
  // Housemate prefs (step 3)
  smoking: boolean | null;
  current_residents: number;
  needed_roommates: number;
  rooms: number;
  rent: string;
  photos: string[];
  address: string;
  gender_preference: GenderPref | null;
  occupation_preference: OccupationPref | null;
  description: string;
  // Needs-place seeker fields
  seeker_gender: string | null;
  preferred_roommate_gender: string | null;
  seeker_age: string;
  occupation: string | null;
  max_budget: string;
  private_room_required: boolean | null;
  quiet_important: boolean | null;
  pets_ok: boolean | null;
  cleanliness_important: boolean | null;
  about_text: string;
}

const initialForm: ListingForm = {
  type: null,
  houseType: null,
  floor: 1,
  elevator: null,
  parking: null,
  furnished: null,
  countryCode: "",
  country: "",
  city: "",
  district: "",
  neighborhood: "",
  price: "",
  currency: "USD",
  smoking: null,
  current_residents: 1,
  needed_roommates: 1,
  rooms: 2,
  rent: "",
  photos: [],
  address: "",
  gender_preference: null,
  occupation_preference: null,
  description: "",
  seeker_gender: null,
  preferred_roommate_gender: null,
  seeker_age: "",
  occupation: null,
  max_budget: "",
  private_room_required: null,
  quiet_important: null,
  pets_ok: null,
  cleanliness_important: null,
  about_text: "",
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  TRY: "₺",
  AED: "د.إ",
  TOMAN: "ت",
  RUB: "₽",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({
  value,
  labelOn,
  labelOff,
  onChange,
  hasError,
}: {
  value: boolean | null;
  labelOn: string;
  labelOff: string;
  onChange: (v: boolean) => void;
  hasError?: boolean;
}) {
  const wrapClass = hasError && value === null ? "border-2 border-red-300 rounded-2xl p-2" : "";
  return (
    <div className={wrapClass}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 transition-all duration-200 text-sm ${
            value === true
              ? "border-2 border-orange-500 text-white bg-orange-500 rounded-xl py-3 px-4 font-bold"
              : "border-2 border-gray-200 text-gray-400 bg-white rounded-xl py-3 px-4"
          }`}
        >
          {labelOn}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 transition-all duration-200 text-sm ${
            value === false
              ? "border-2 border-orange-500 text-white bg-orange-500 rounded-xl py-3 px-4 font-bold"
              : "border-2 border-gray-200 text-gray-400 bg-white rounded-xl py-3 px-4"
          }`}
        >
          {labelOff}
        </button>
      </div>
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
  hasError,
}: {
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <div className={`flex rounded-xl border overflow-hidden text-sm font-semibold ${hasError ? "border-red-400 border-2" : "border-stone-200"}`}>
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
  hasError,
}: {
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${hasError ? "rounded-xl ring-2 ring-red-400 p-2" : ""}`}>
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
  countryCode,
  lang,
  onSelect,
  label,
  placeholder,
  hasError,
  required,
}: {
  countryCode: string;
  lang: string;
  onSelect: (code: string, name: string) => void;
  label: string;
  placeholder: string;
  hasError?: boolean;
  required?: boolean;
}) {
  const [inputVal, setInputVal] = useState(() => countryCode ? getCountryName(countryCode, lang) : "");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(countryCode ? getCountryName(countryCode, lang) : "");
  }, [countryCode, lang]);

  const sortedOthers = useMemo(() =>
    [...OTHER_COUNTRY_CODES].sort((a, b) =>
      getCountryName(a, lang).localeCompare(getCountryName(b, lang))
    ),
    [lang]
  );

  const allCodes = useMemo(() => [...TOP_COUNTRY_CODES, ...sortedOthers], [sortedOthers]);

  const filtered = useMemo(() => {
    if (!inputVal.trim()) return allCodes;
    const q = inputVal.toLowerCase();
    return allCodes.filter((code) => getCountryName(code, lang).toLowerCase().includes(q));
  }, [inputVal, allCodes, lang]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputVal(countryCode ? getCountryName(countryCode, lang) : "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [countryCode, lang]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-stone-700 mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => { setInputVal(e.target.value); setIsOpen(true); }}
        className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${hasError ? "border-red-400 border-2" : "border-gray-200"}`}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((code) => {
            const name = getCountryName(code, lang);
            return (
              <button
                key={code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(code, name); setInputVal(name); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${
                  countryCode === code ? "text-orange-500 font-semibold" : "text-stone-700"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Normalize helper ──────────────────────────────────────────────────────────
const normalize = (str: string): string =>
  str
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

const ARAB_COUNTRIES = new Set(['SA','AE','EG','IQ','SY','JO','LB','KW','QA','BH','OM','YE','LY','TN','DZ','MA','SD','MR','SO','DJ','KM','PS'])

const countryCityExamples: Record<string, string> = {
  'TR': 'İstanbul, Ankara, İzmir...',
  'IR': 'Tehran, Mashhad, Shiraz...',
  'US': 'New York, Los Angeles, Chicago...',
  'DE': 'Berlin, Munich, Hamburg...',
  'GB': 'London, Manchester, Birmingham...',
  'FR': 'Paris, Lyon, Marseille...',
  'AE': 'Dubai, Abu Dhabi, Sharjah...',
  'SA': 'Riyadh, Jeddah, Mecca...',
  'RU': 'Moscow, Saint Petersburg, Kazan...',
  'CN': 'Beijing, Shanghai, Guangzhou...',
  'IN': 'Mumbai, Delhi, Bangalore...',
  'PK': 'Karachi, Lahore, Islamabad...',
  'AF': 'Kabul, Herat, Mazar-i-Sharif...',
  'IQ': 'Baghdad, Basra, Erbil...',
  'SY': 'Damascus, Aleppo, Homs...',
  'EG': 'Cairo, Alexandria, Giza...',
  'MA': 'Casablanca, Rabat, Marrakech...',
  'TN': 'Tunis, Sfax, Sousse...',
  'NL': 'Amsterdam, Rotterdam, The Hague...',
  'IT': 'Rome, Milan, Naples...',
  'ES': 'Madrid, Barcelona, Valencia...',
  'CA': 'Toronto, Vancouver, Montreal...',
  'AU': 'Sydney, Melbourne, Brisbane...',
  'JP': 'Tokyo, Osaka, Kyoto...',
  'KR': 'Seoul, Busan, Incheon...',
  'BR': 'São Paulo, Rio de Janeiro, Brasília...',
  'MX': 'Mexico City, Guadalajara, Monterrey...',
  'AZ': 'Baku, Ganja, Sumqayit...',
  'UZ': 'Tashkent, Samarkand, Bukhara...',
}

// ── Validation messages (all 6 languages) ─────────────────────────────────────
const validationMessages = {
  tr: { header: "Lütfen tüm zorunlu alanları doldurun", country: "Ülke seçiniz", city: "Şehir seçiniz", district: "İlçe seçiniz", rent: "Kira miktarı giriniz", houseType: "Konut tipi seçiniz", gender: "Cinsiyet tercihi seçiniz", occupation: "Meslek tercihi seçiniz", furnished: "Eşyalı durumu seçiniz", elevator: "Asansör durumu seçiniz", parking: "Otopark durumu seçiniz", smoking: "Sigara tercihi seçiniz", bio: "Kendinizi en az 20 karakter ile tanıtın", photo: "En az 1 ev fotoğrafı yükleyiniz", seekerGender: "Cinsiyetinizi seçiniz", preferredRoommateGender: "Tercih ettiğiniz ev arkadaşı cinsiyetini seçiniz", seekerAge: "Yaşınızı giriniz (16-99)", seekerOccupation: "Mesleğinizi seçiniz", maxBudget: "Maksimum bütçenizi giriniz", privateRoom: "Özel oda tercihini seçiniz", seekerSmoking: "Sigara durumunuzu seçiniz", quiet: "Sessizlik tercihini seçiniz", pets: "Evcil hayvan tercihini seçiniz", cleanliness: "Temizlik tercihini seçiniz" },
  en: { header: "Please fill in all required fields", country: "Select a country", city: "Select a city", district: "Select a district", rent: "Enter rent amount", houseType: "Select house type", gender: "Select gender preference", occupation: "Select occupation preference", furnished: "Select furnished status", elevator: "Select elevator status", parking: "Select parking status", smoking: "Select smoking preference", bio: "Introduce yourself with at least 20 characters", photo: "Upload at least 1 photo", seekerGender: "Select your gender", preferredRoommateGender: "Select preferred housemate gender", seekerAge: "Enter your age (16-99)", seekerOccupation: "Select your occupation", maxBudget: "Enter your maximum budget", privateRoom: "Select private room preference", seekerSmoking: "Select your smoking status", quiet: "Select quietness preference", pets: "Select pet preference", cleanliness: "Select cleanliness preference" },
  fa: { header: "لطفاً همه فیلدهای اجباری را پر کنید", country: "کشور را انتخاب کنید", city: "شهر را انتخاب کنید", district: "منطقه را انتخاب کنید", rent: "مبلغ اجاره را وارد کنید", houseType: "نوع مسکن را انتخاب کنید", gender: "جنسیت مورد نظر را انتخاب کنید", occupation: "شغل مورد نظر را انتخاب کنید", furnished: "وضعیت مبله را انتخاب کنید", elevator: "وضعیت آسانسور را انتخاب کنید", parking: "وضعیت پارکینگ را انتخاب کنید", smoking: "وضعیت سیگار را انتخاب کنید", bio: "خود را با حداقل ۲۰ کاراکتر معرفی کنید", photo: "حداقل ۱ عکس آپلود کنید", seekerGender: "جنسیت خود را انتخاب کنید", preferredRoommateGender: "جنسیت هم‌خانه مورد نظر را انتخاب کنید", seekerAge: "سن خود را وارد کنید (۱۶-۹۹)", seekerOccupation: "شغل خود را انتخاب کنید", maxBudget: "حداکثر بودجه را وارد کنید", privateRoom: "ترجیح اتاق خصوصی را انتخاب کنید", seekerSmoking: "وضعیت سیگار خود را انتخاب کنید", quiet: "ترجیح آرامش را انتخاب کنید", pets: "ترجیح حیوان خانگی را انتخاب کنید", cleanliness: "ترجیح تمیزی را انتخاب کنید" },
  ar: { header: "يرجى ملء جميع الحقول المطلوبة", country: "اختر الدولة", city: "اختر المدينة", district: "اختر المنطقة", rent: "أدخل مبلغ الإيجار", houseType: "اختر نوع المسكن", gender: "اختر تفضيل الجنس", occupation: "اختر تفضيل المهنة", furnished: "اختر حالة الأثاث", elevator: "اختر حالة المصعد", parking: "اختر حالة الموقف", smoking: "اختر تفضيل التدخين", bio: "عرّف بنفسك بـ 20 حرفاً على الأقل", photo: "ارفع صورة واحدة على الأقل", seekerGender: "اختر جنسك", preferredRoommateGender: "اختر الجنس المفضل لشريك السكن", seekerAge: "أدخل عمرك (16-99)", seekerOccupation: "اختر مهنتك", maxBudget: "أدخل الحد الأقصى للميزانية", privateRoom: "اختر تفضيل الغرفة الخاصة", seekerSmoking: "اختر وضع التدخين", quiet: "اختر تفضيل الهدوء", pets: "اختر تفضيل الحيوانات الأليفة", cleanliness: "اختر تفضيل النظافة" },
  de: { header: "Bitte alle Pflichtfelder ausfüllen", country: "Land auswählen", city: "Stadt auswählen", district: "Bezirk auswählen", rent: "Mietbetrag eingeben", houseType: "Haustyp auswählen", gender: "Geschlechtspräferenz wählen", occupation: "Berufspräferenz wählen", furnished: "Möblierungsstatus wählen", elevator: "Aufzugsstatus wählen", parking: "Parkplatzstatus wählen", smoking: "Raucherpräferenz wählen", bio: "Stellen Sie sich mit mindestens 20 Zeichen vor", photo: "Mindestens 1 Foto hochladen", seekerGender: "Geschlecht auswählen", preferredRoommateGender: "Bevorzugtes Geschlecht des Mitbewohners wählen", seekerAge: "Alter eingeben (16-99)", seekerOccupation: "Beruf auswählen", maxBudget: "Maximales Budget eingeben", privateRoom: "Zimmer-Präferenz wählen", seekerSmoking: "Raucherstatus wählen", quiet: "Ruhe-Präferenz wählen", pets: "Haustierpräferenz wählen", cleanliness: "Sauberkeits-Präferenz wählen" },
  ru: { header: "Пожалуйста, заполните все обязательные поля", country: "Выберите страну", city: "Выберите город", district: "Выберите район", rent: "Введите сумму аренды", houseType: "Выберите тип жилья", gender: "Выберите предпочтение по полу", occupation: "Выберите предпочтение по профессии", furnished: "Выберите статус меблировки", elevator: "Выберите статус лифта", parking: "Выберите статус парковки", smoking: "Выберите предпочтение по курению", bio: "Представьтесь минимум 20 символами", photo: "Загрузите минимум 1 фото", seekerGender: "Выберите ваш пол", preferredRoommateGender: "Выберите предпочтительный пол соседа", seekerAge: "Введите ваш возраст (16-99)", seekerOccupation: "Выберите вашу профессию", maxBudget: "Введите максимальный бюджет", privateRoom: "Выберите предпочтение по комнате", seekerSmoking: "Выберите статус курения", quiet: "Выберите предпочтение тишины", pets: "Выберите отношение к животным", cleanliness: "Выберите предпочтение чистоты" }
};

// ── Main component ────────────────────────────────────────────────────────────
function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
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
  const vm = validationMessages[lang] || validationMessages['tr'];

  const searchParams = useSearchParams();
  const _typeParam = searchParams.get('type') as ListingType | null;
  const _preselectedType = (_typeParam === 'has_place' || _typeParam === 'needs_place') ? _typeParam : null;

  const [step, setStep] = useState(() => _preselectedType ? 2 : 1);
  const [form, setForm] = useState<ListingForm>(() => _preselectedType ? { ...initialForm, type: _preselectedType } : initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [countryIso, setCountryIso] = useState('TR')
  const [turkiyeData, setTurkiyeData] = useState<Record<string, Record<string, string[]>>>({})
  const [selectedIl, setSelectedIl] = useState('')
  const [selectedIlce, setSelectedIlce] = useState('')

  const [sehirQ, setSehirQ] = useState('')
  const [sehirSug, setSehirSug] = useState<string[]>([])
  const [sehirOpen, setSehirOpen] = useState(false)
  const [selectedStateIso, setSelectedStateIso] = useState('')
  const [citiesOfState, setCitiesOfState] = useState<string[]>([])
  useEffect(() => {
    if (!countryIso || !selectedStateIso) { setCitiesOfState([]); return; }
    fetch(`/api/cities-of-state?country=${encodeURIComponent(countryIso)}&state=${encodeURIComponent(selectedStateIso)}`)
      .then(r => r.json())
      .then((data: string[]) => setCitiesOfState(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [countryIso, selectedStateIso])

  const [ilceQ, setIlceQ] = useState('')
  const [ilceSug, setIlceSug] = useState<string[]>([])
  const [ilceOpen, setIlceOpen] = useState(false)

  const [mahalleQ, setMahalleQ] = useState('')
  const [mahalleSug, setMahalleSug] = useState<string[]>([])
  const [mahalleOpen, setMahalleOpen] = useState(false)

  const [isFloor20Plus, setIsFloor20Plus] = useState(false)

  const [iranCities, setIranCities] = useState<string[]>([])
  const [russiaCitiesRU, setRussiaCitiesRU] = useState<string[]>([])
  const [statesOfCountry, setStatesOfCountry] = useState<{name: string, isoCode: string}[]>([])
  useEffect(() => {
    if (!countryIso || countryIso === 'TR' || countryIso === 'IR' || countryIso === 'RU') {
      setStatesOfCountry([])
      return
    }
    fetch(`/api/states?country=${encodeURIComponent(countryIso)}`)
      .then(r => r.json())
      .then(data => setStatesOfCountry(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [countryIso])

  const [worldCitiesForCountry, setWorldCitiesForCountry] = useState<string[]>([])
  useEffect(() => {
    if (!countryIso) { setWorldCitiesForCountry([]); return; }
    const countryName = getCountryName(countryIso, 'en')
    if (!countryName) return;
    fetch(`/api/cities?country=${encodeURIComponent(countryName)}`)
      .then(r => r.json())
      .then((data: string[]) => setWorldCitiesForCountry(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [countryIso])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step])

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state for listing photos
  const [showPhotoCropModal, setShowPhotoCropModal] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState("");
  const [photoCrop, setPhotoCrop] = useState<Crop>();
  const [photoCompletedCrop, setPhotoCompletedCrop] = useState<PixelCrop>();
  const [cropSaving, setCropSaving] = useState(false);
  const [cropRotation, setCropRotation] = useState(0);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const pendingCropFilesRef = useRef<File[]>([]);
  const photosUploadedDuringCropRef = useRef(0);

  const set = <K extends keyof ListingForm>(key: K, val: ListingForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const loadImageCorrected = async (file: File): Promise<string> => {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      return canvas.toDataURL("image/jpeg", 0.95);
    } catch {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const rotateImage = (srcDataUrl: string, degrees: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const swap = degrees % 180 !== 0;
        canvas.width = swap ? img.height : img.width;
        canvas.height = swap ? img.width : img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = srcDataUrl;
    });
  };

  const handleCropRotate = async (delta: number) => {
    setCropRotation((r) => r + delta);
    const rotated = await rotateImage(cropImgSrc, delta);
    setCropImgSrc(rotated);
    setPhotoCrop(undefined);
    setPhotoCompletedCrop(undefined);
  };

  const openCropForFile = (file: File) => {
    loadImageCorrected(file).then((dataUrl) => {
      setCropImgSrc(dataUrl);
      setCropRotation(0);
      setPhotoCrop(undefined);
      setPhotoCompletedCrop(undefined);
      setShowPhotoCropModal(true);
    });
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!user || files.length === 0) return;
    const available = 3 - form.photos.length - uploadingCount;
    const newFiles = files.slice(0, Math.max(0, available));
    if (newFiles.length === 0) return;
    setPhotoError(null);
    pendingCropFilesRef.current = newFiles;
    photosUploadedDuringCropRef.current = form.photos.length;
    openCropForFile(newFiles[0]);
  };

  const onPhotoCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      { unit: "%", x: 5, y: 5, width: 90, height: 90 },
      width,
      height
    );
    setPhotoCrop(crop);
    setPhotoCompletedCrop({
      unit: "px",
      x: (crop.x / 100) * width,
      y: (crop.y / 100) * height,
      width: (crop.width / 100) * width,
      height: (crop.height / 100) * height,
    });
  };

  const handlePhotoCropSave = () => {
    if (!photoCompletedCrop || !cropImgRef.current || !user) return;
    const image = cropImgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.round(photoCompletedCrop.width * scaleX);
    canvas.height = Math.round(photoCompletedCrop.height * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      photoCompletedCrop.x * scaleX,
      photoCompletedCrop.y * scaleY,
      photoCompletedCrop.width * scaleX,
      photoCompletedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    setCropSaving(true);
    canvas.toBlob(async (blob) => {
      if (!blob) { setCropSaving(false); return; }
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("userId", user.id);
      setUploadingCount((c) => c + 1);
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      setUploadingCount((c) => c - 1);
      if (!res.ok) {
        setPhotoError(t.errorPhoto);
      } else {
        const { url } = await res.json();
        setForm((f) => ({ ...f, photos: [...f.photos, url] }));
        photosUploadedDuringCropRef.current += 1;
      }
      const remaining = pendingCropFilesRef.current.slice(1);
      pendingCropFilesRef.current = remaining;
      if (remaining.length > 0 && photosUploadedDuringCropRef.current < 3) {
        openCropForFile(remaining[0]);
      } else {
        setShowPhotoCropModal(false);
        setCropImgSrc("");
      }
      setCropSaving(false);
    }, "image/jpeg", 0.92);
  };

  const handlePhotoCropCancel = () => {
    setShowPhotoCropModal(false);
    setCropImgSrc("");
    pendingCropFilesRef.current = [];
  };

  const removePhoto = (idx: number) => {
    set("photos", form.photos.filter((_, i) => i !== idx));
  };

  const handleCountryChange = (code: string, name: string) => {
    set("countryCode", code)
    setCountryIso(code)
    setSehirQ('')
    setIlceQ('')
    setSelectedStateIso('')
    setSelectedIl('')
    setSelectedIlce('')
    setMahalleQ('')
    setForm(f => ({ ...f, country: name, city: '', district: '', neighborhood: '' }))
    if (code === 'TR' && Object.keys(turkiyeData).length === 0) {
      fetch('/turkiye-data.json').then(r => r.json()).then(setTurkiyeData).catch(() => {})
    }
    if (code === 'IR' && iranCities.length === 0) {
      fetch('/iran-cities.json')
        .then(r => r.json())
        .then((data: {name: string}[]) => setIranCities(data.map(c => c.name).sort()))
        .catch(() => {})
    }
    if (code === 'RU' && russiaCitiesRU.length === 0) {
      fetch('/russia-cities.json')
        .then(r => r.json())
        .then((data: {name: string}[]) => setRussiaCitiesRU(data.map(c => c.name).sort()))
        .catch(() => {})
    }
  }

  // Navigation — 4 steps total for has_place, 2 for needs_place
  const goNext = () => {
    setStepErrors([]);
    setInvalidFields([]);

    if (step === 1) {
      if (!form.type) {
        setStepErrors(["İlan türü seçiniz"]);
        setInvalidFields(["type"]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (countryIso === 'TR' && Object.keys(turkiyeData).length === 0) {
        fetch('/turkiye-data.json').then(r => r.json()).then(setTurkiyeData).catch(() => {})
      }
      setStep(2);
      return;
    }

    if (step === 2 && form.type === "has_place") {
      const errors: string[] = [];
      const invalid: string[] = [];
      if (!form.countryCode) { errors.push(vm.country); invalid.push("country"); }
      if (!form.city) { errors.push(vm.city); invalid.push("city"); }
      if (countryIso === "TR" && !form.district) { errors.push(vm.district); invalid.push("district"); }
      if (!form.price || parseFloat(form.price) <= 0) { errors.push(vm.rent); invalid.push("price"); }
      if (!form.rooms || form.rooms <= 0) { errors.push("Oda sayısı giriniz"); invalid.push("rooms"); }
      if (!form.houseType) { errors.push(vm.houseType); invalid.push("houseType"); }
      if (errors.length > 0) {
        setStepErrors(errors);
        setInvalidFields(invalid);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setStep(3);
      return;
    }

    if (step === 2 && form.type === "needs_place") {
      const errors: string[] = [];
      const invalid: string[] = [];
      if (!form.seeker_gender) { errors.push(vm.seekerGender); invalid.push("seeker_gender"); }
      if (!form.preferred_roommate_gender) { errors.push(vm.preferredRoommateGender); invalid.push("preferred_roommate_gender"); }
      const age = parseInt(form.seeker_age);
      if (!form.seeker_age || isNaN(age) || age < 16 || age > 99) { errors.push(vm.seekerAge); invalid.push("seeker_age"); }
      if (!form.occupation) { errors.push(vm.seekerOccupation); invalid.push("occupation"); }
      if (!form.max_budget || parseFloat(form.max_budget) <= 0) { errors.push(vm.maxBudget); invalid.push("max_budget"); }
      if (!form.countryCode) { errors.push(vm.country); invalid.push("country"); }
      if (!form.city) { errors.push(vm.city); invalid.push("city"); }
      if (countryIso === "TR" && !form.district) { errors.push(vm.district); invalid.push("district"); }
      if (form.private_room_required === null) { errors.push(vm.privateRoom); invalid.push("private_room_required"); }
      if (form.smoking === null) { errors.push(vm.seekerSmoking); invalid.push("smoking"); }
      if (form.quiet_important === null) { errors.push(vm.quiet); invalid.push("quiet_important"); }
      if (form.pets_ok === null) { errors.push(vm.pets); invalid.push("pets_ok"); }
      if (form.cleanliness_important === null) { errors.push(vm.cleanliness); invalid.push("cleanliness_important"); }
      if (errors.length > 0) {
        setStepErrors(errors);
        setInvalidFields(invalid);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setStep(4);
      return;
    }

    if (step === 3) {
      const errors: string[] = [];
      const invalid: string[] = [];
      if (form.gender_preference === null) { errors.push(vm.gender); invalid.push("gender"); }
      if (form.occupation_preference === null) { errors.push(vm.occupation); invalid.push("occupation"); }
      if (form.furnished === null) { errors.push(vm.furnished); invalid.push("furnished"); }
      if (form.elevator === null) { errors.push(vm.elevator); invalid.push("elevator"); }
      if (form.parking === null) { errors.push(vm.parking); invalid.push("parking"); }
      if (form.smoking === null) { errors.push(vm.smoking); invalid.push("smoking"); }

      if (!form.photos || form.photos.length === 0) {
        errors.push(vm.photo);
        invalid.push("photos");
      }
      if (errors.length > 0) {
        setStepErrors(errors);
        setInvalidFields(invalid);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setStep(4);
    }
  };

  const goBack = () => {
    setStepErrors([]);
    setInvalidFields([]);
    if (step === 4 && form.type === "needs_place") { setStep(2); return; }
    if (step === 4) { setStep(3); return; }
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); }
  };

  // Submit
  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const photoUrls: string[] = form.photos.filter(Boolean);

    const payload: Record<string, unknown> = {
      user_id:      user.id,
      type:         form.type,
      city:         form.city || null,
      district:     form.district || null,
      neighborhood: form.neighborhood || null,
      country_code: form.countryCode || null,
      country:      form.country || null,
      ...(form.type === "has_place" ? {
        house_type:        form.houseType || null,
        floor:             form.floor || null,
        elevator:          form.elevator,
        parking:           form.parking,
        furnished:         form.furnished,
        rent:              parseFloat(form.price) || null,
        currency:          form.currency,
        smoking:           form.smoking,
        current_residents: form.current_residents,
        needed_roommates:  form.needed_roommates,
        rooms:             form.rooms,
        photos:            photoUrls,
        address:           form.address || null,
        gender_preference:     form.gender_preference,
        occupation_preference: form.occupation_preference,
        description:           form.description || null,
      } : {
        seeker_gender:            form.seeker_gender,
        preferred_roommate_gender: form.preferred_roommate_gender,
        seeker_age:               parseInt(form.seeker_age) || null,
        occupation:               form.occupation,
        max_budget:               parseFloat(form.max_budget) || null,
        currency:                 form.currency,
        private_room_required:    form.private_room_required,
        smoking:                  form.smoking,
        quiet_important:          form.quiet_important,
        pets_ok:                  form.pets_ok,
        cleanliness_important:    form.cleanliness_important,
        about_text:               form.about_text || null,
      }),
    };

    console.log('Insert payload:', JSON.stringify(payload, null, 2));
    console.log('Form data:', JSON.stringify(form, null, 2));

    const { error: dbErr } = await supabase.from("listings").insert(payload);

    if (dbErr) {
      console.log('Submit error:', JSON.stringify(dbErr));
      setSubmitError(dbErr.message || JSON.stringify(dbErr));
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
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
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
    const displayTotal = form.type === "needs_place" ? 3 : 4;
    const displayStep = form.type === "needs_place" ? (step === 4 ? 3 : step) : step;
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
          <div className="inline-block mb-5">
            <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t.home}</span>
            </Link>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-2 text-sm">{t.step1Title}</p>
          <label className="block text-sm font-semibold text-stone-700 mb-4">{t.typeLabel}<span className="text-red-500 ml-1">*</span></label>

          {stepErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
              <p className="text-red-600 font-bold text-sm mb-2">⚠️ {vm.header}:</p>
              <ul className="text-red-500 text-sm list-disc list-inside">
                {stepErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

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
                      : invalidFields.includes("type")
                      ? "border-red-400 bg-white"
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
                    <p className={`font-bold text-base leading-snug ${isSelected ? "text-orange-700" : "text-stone-900"}`}>
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
            <button
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </button>
            <div className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-4 text-sm">{t.step2HouseTitle}</p>

          {stepErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
              <p className="text-red-600 font-bold text-sm mb-2">⚠️ {vm.header}:</p>
              <ul className="text-red-500 text-sm list-disc list-inside">
                {stepErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

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
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.houseTypeLabel}<span className="text-red-500 ml-1">*</span></label>
              <PillGroup
                options={houseTypeOptions}
                value={form.houseType}
                onChange={(v) => set("houseType", v)}
                hasError={invalidFields.includes("houseType") && !form.houseType}
              />
            </div>

            {/* 2. Rooms */}
            <div className="p-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-700">{t.rooms}<span className="text-red-500 ml-1">*</span></label>
              <NumberStepper
                value={form.rooms}
                onChange={(v) => set("rooms", v)}
                min={1}
                max={20}
              />
            </div>

            {/* 3. Floor */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-stone-700">{t.floorLabel}</label>
                  <span className="text-xs text-stone-400 ml-2">{t.floorNote}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("floor", Math.max(0, form.floor - 1))}
                    disabled={isFloor20Plus}
                    className={`w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:border-orange-400 hover:text-orange-500 transition-all active:scale-90 font-bold text-lg ${isFloor20Plus ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-lg font-black text-stone-900">
                    {isFloor20Plus ? '20+' : form.floor}
                  </span>
                  <button
                    type="button"
                    onClick={() => set("floor", Math.min(20, form.floor + 1))}
                    disabled={isFloor20Plus}
                    className={`w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:border-orange-400 hover:text-orange-500 transition-all active:scale-90 font-bold text-lg ${isFloor20Plus ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFloor20Plus(prev => {
                        const next = !prev
                        if (next) setForm(f => ({...f, floor: 21}))
                        else setForm(f => ({...f, floor: 0}))
                        return next
                      })
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${isFloor20Plus ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    20+
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Location */}
            <div className="p-5 flex flex-col gap-4">
              <CountrySelect
                countryCode={form.countryCode}
                lang={lang}
                onSelect={handleCountryChange}
                label={t.countryLabel}
                placeholder={t.countryPlaceholder}
                hasError={invalidFields.includes("country") && !form.countryCode}
                required
              />
              {/* Şehir / İl */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {countryIso === 'TR' ? t.il : t.city}<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sehirQ}
                    onChange={e => {
                      const v = e.target.value
                      setSehirQ(v)
                      setForm(f => ({...f, city: v}))
                      const q = normalize(v)
                      if (countryIso === 'TR') {
                        const all = Object.keys(turkiyeData)
                        if (v.length === 0) {
                          setSehirSug(all.slice(0, 6))
                          setSehirOpen(true)
                        } else {
                          const starts = all.filter(name => normalize(name).startsWith(q))
                          const includes = all.filter(name =>
                            !normalize(name).startsWith(q) && normalize(name).includes(q)
                          )
                          setSehirSug([...starts, ...includes].slice(0, 6))
                          setSehirOpen(starts.length + includes.length > 0)
                        }
                      } else if (!(lang === 'ar' && ARAB_COUNTRIES.has(countryIso))) {
                        const cityList = countryIso === 'IR' && lang === 'fa'
                          ? iranCities
                          : countryIso === 'RU' && lang === 'ru'
                          ? russiaCitiesRU
                          : (() => {
                              return worldCitiesForCountry.length
                                ? worldCitiesForCountry
                                : statesOfCountry.map(s => s.name)
                            })()
                        if (v.length === 0) {
                          setSehirSug(cityList.slice(0, 8))
                          setSehirOpen(true)
                        } else {
                          const starts = cityList.filter(name => normalize(name).startsWith(q))
                          const includes = cityList.filter(name =>
                            !normalize(name).startsWith(q) && normalize(name).includes(q)
                          )
                          setSehirSug([...starts, ...includes].slice(0, 8))
                          setSehirOpen(starts.length + includes.length > 0)
                        }
                      }
                    }}
                    onFocus={() => {
                      if (countryIso === 'TR') {
                        const all = Object.keys(turkiyeData)
                        setSehirSug(all.slice(0, 6))
                        setSehirOpen(all.length > 0)
                      } else if (!(lang === 'ar' && ARAB_COUNTRIES.has(countryIso))) {
                        const cityList = countryIso === 'IR' && lang === 'fa'
                          ? iranCities
                          : countryIso === 'RU' && lang === 'ru'
                          ? russiaCitiesRU
                          : (() => {
                              return worldCitiesForCountry.length
                                ? worldCitiesForCountry
                                : statesOfCountry.map(s => s.name)
                            })()
                        setSehirSug(cityList.slice(0, 8))
                        setSehirOpen(cityList.length > 0)
                      }
                    }}
                    onBlur={() => setTimeout(() => setSehirOpen(false), 150)}
                    placeholder={lang === 'ar' && ARAB_COUNTRIES.has(countryIso) ? 'اكتب اسم مدينتك...' : (countryCityExamples[countryIso] || 'City...')}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors ${invalidFields.includes("city") && !form.city ? "border-red-400" : "border-gray-200"}`}
                  />
                  {sehirOpen && sehirSug.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                      {sehirSug.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setSehirQ(s)
                            setSelectedIl(s)
                            setForm(f => ({...f, city: s}))
                            setSehirOpen(false)
                            setIlceQ('')
                            setSelectedIlce('')
                            setMahalleQ('')
                            setForm(f => ({...f, district: '', neighborhood: ''}))
                            if (countryIso !== 'TR') {
                              const stateObj = statesOfCountry.find(st => st.name === s)
                              if (stateObj) setSelectedStateIso(stateObj.isoCode)
                            }
                          }}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* İlçe — Turkey only */}
              {countryIso === 'TR' && <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.district}<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ilceQ}
                    disabled={!sehirQ}
                    onChange={e => {
                      const v = e.target.value
                      setIlceQ(v)
                      setForm(f => ({...f, district: v}))
                      const q = normalize(v)
                      if (countryIso === 'TR') {
                        const ilceler = Object.keys(turkiyeData[selectedIl] || {})
                        if (v.length === 0) {
                          setIlceSug(ilceler.slice(0, 6))
                          setIlceOpen(true)
                        } else {
                          const starts = ilceler.filter(name => normalize(name).startsWith(q))
                          const includes = ilceler.filter(name =>
                            !normalize(name).startsWith(q) && normalize(name).includes(q)
                          )
                          setIlceSug([...starts, ...includes].slice(0, 6))
                          setIlceOpen(starts.length + includes.length > 0)
                        }
                      } else {
                        if (v.length === 0) {
                          setIlceSug(citiesOfState.slice(0, 6))
                          setIlceOpen(true)
                        } else {
                          const starts = citiesOfState.filter(c => normalize(c).startsWith(q))
                          const includes = citiesOfState.filter(c =>
                            !normalize(c).startsWith(q) && normalize(c).includes(q)
                          )
                          setIlceSug([...starts, ...includes].slice(0, 6))
                          setIlceOpen(starts.length + includes.length > 0)
                        }
                      }
                    }}
                    onFocus={() => {
                      if (countryIso === 'TR') {
                        const ilceler = Object.keys(turkiyeData[selectedIl] || {})
                        setIlceSug(ilceler.slice(0, 6))
                        setIlceOpen(ilceler.length > 0)
                      } else {
                        setIlceSug(citiesOfState.slice(0, 6))
                        setIlceOpen(citiesOfState.length > 0)
                      }
                    }}
                    onBlur={() => setTimeout(() => setIlceOpen(false), 150)}
                    placeholder="Esenyurt, Kadıköy, Beşiktaş..."
                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${invalidFields.includes("district") && !form.district ? "border-red-400" : "border-gray-200"}`}
                  />
                  {ilceOpen && ilceSug.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                      {ilceSug.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setIlceQ(c)
                            setSelectedIlce(c)
                            setForm(f => ({...f, district: c}))
                            setIlceOpen(false)
                            if (countryIso === 'TR') {
                              setMahalleQ('')
                              setForm(f => ({...f, neighborhood: ''}))
                            }
                          }}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>}

              {/* Mahalle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.neighborhood}
                </label>
                {countryIso === 'TR' && selectedIl && selectedIlce ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={mahalleQ}
                      onChange={e => {
                        const v = e.target.value
                        setMahalleQ(v)
                        setForm(f => ({...f, neighborhood: v}))
                        const mahalleler = turkiyeData[selectedIl]?.[selectedIlce] || []
                        const q = normalize(v)
                        if (v.length === 0) {
                          setMahalleSug(mahalleler.slice(0, 6))
                          setMahalleOpen(true)
                        } else {
                          const starts = mahalleler.filter(m => normalize(m).startsWith(q))
                          const includes = mahalleler.filter(m =>
                            !normalize(m).startsWith(q) && normalize(m).includes(q)
                          )
                          setMahalleSug([...starts, ...includes].slice(0, 6))
                          setMahalleOpen(starts.length + includes.length > 0)
                        }
                      }}
                      onFocus={() => {
                        const mahalleler = turkiyeData[selectedIl]?.[selectedIlce] || []
                        setMahalleSug(mahalleler.slice(0, 6))
                        setMahalleOpen(mahalleler.length > 0)
                      }}
                      onBlur={() => setTimeout(() => setMahalleOpen(false), 150)}
                      placeholder="Zafer Mh., Cumhuriyet Mh..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 bg-white text-sm"
                    />
                    {mahalleOpen && mahalleSug.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                        {mahalleSug.map((m, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => {
                              setMahalleQ(m)
                              setForm(f => ({...f, neighborhood: m}))
                              setMahalleOpen(false)
                            }}
                            className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.neighborhood || ''}
                    onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    placeholder={countryIso === 'TR' ? "Zafer Mh., Cumhuriyet Mh..." : ""}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 bg-white text-sm"
                  />
                )}
              </div>
            </div>

            {/* 5. Monthly cost */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-1">{t.pricingLabel}<span className="text-red-500 ml-1">*</span></label>
              <p className="text-xs text-stone-400 mb-3">{t.pricingSub}</p>
              {/* Currency pills */}
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t.currency}<span className="text-red-500 ml-1">*</span></label>
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
                className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${invalidFields.includes("price") && (!form.price || parseFloat(form.price) <= 0) ? "border-red-400 border-2" : "border-gray-200"}`}
              />
            </div>
          </div>

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

  // ── STEP 2: Seeker profile (needs_place only) ────────────────────────────
  if (step === 2 && form.type === "needs_place") {
    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </button>
            <div className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-4 text-sm">{t.step2SeekerTitle}</p>

          {stepErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
              <p className="text-red-600 font-bold text-sm mb-2">⚠️ {vm.header}:</p>
              <ul className="text-red-500 text-sm list-disc list-inside">
                {stepErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <p className="font-black text-gray-900 text-base">{t.step2SeekerHeading}</p>
                <p className="text-gray-500 text-sm mt-1">{t.step2SeekerSub}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">

            {/* 1. Seeker gender */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.seekerGenderLabel}<span className="text-red-500 ml-1">*</span></label>
              <OptionGroup
                value={form.seeker_gender}
                onChange={(v) => set("seeker_gender", v)}
                options={[
                  { label: t.genderMale, value: "male" },
                  { label: t.genderFemale, value: "female" },
                ]}
                hasError={invalidFields.includes("seeker_gender") && !form.seeker_gender}
              />
            </div>

            {/* 2. Preferred roommate gender */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.preferredRoommateGenderLabel}<span className="text-red-500 ml-1">*</span></label>
              <OptionGroup
                value={form.preferred_roommate_gender}
                onChange={(v) => set("preferred_roommate_gender", v)}
                options={[
                  { label: t.genderMale, value: "male" },
                  { label: t.genderFemale, value: "female" },
                  { label: t.genderAny, value: "any" },
                ]}
                hasError={invalidFields.includes("preferred_roommate_gender") && !form.preferred_roommate_gender}
              />
            </div>

            {/* 3. Seeker age */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.seekerAgeLabel}<span className="text-red-500 ml-1">*</span></label>
              <input
                type="number"
                min={16}
                max={99}
                value={form.seeker_age}
                onChange={(e) => set("seeker_age", e.target.value)}
                placeholder="25"
                className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${invalidFields.includes("seeker_age") ? "border-red-400 border-2" : "border-gray-200"}`}
              />
            </div>

            {/* 4. Occupation */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.seekerOccLabel}<span className="text-red-500 ml-1">*</span></label>
              <OptionGroup
                value={form.occupation}
                onChange={(v) => set("occupation", v)}
                options={[
                  { label: t.seekerOccWorking, value: "working" },
                  { label: t.seekerOccStudent, value: "student" },
                ]}
                hasError={invalidFields.includes("occupation") && !form.occupation}
              />
            </div>

            {/* 5. Max budget */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-1">{t.maxBudgetLabel}<span className="text-red-500 ml-1">*</span></label>
              <label className="block text-sm font-semibold text-stone-700 mb-2 mt-3">{t.currency}</label>
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
                value={form.max_budget}
                onChange={(e) => set("max_budget", e.target.value)}
                placeholder="0"
                className={`w-full border rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${invalidFields.includes("max_budget") && (!form.max_budget || parseFloat(form.max_budget) <= 0) ? "border-red-400 border-2" : "border-gray-200"}`}
              />
            </div>

            {/* 6. Location */}
            <div className="p-5 flex flex-col gap-4">
              <CountrySelect
                countryCode={form.countryCode}
                lang={lang}
                onSelect={handleCountryChange}
                label={t.countryLabel}
                placeholder={t.countryPlaceholder}
                hasError={invalidFields.includes("country") && !form.countryCode}
                required
              />
              {/* Şehir / İl */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {countryIso === 'TR' ? t.il : t.city}<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sehirQ}
                    onChange={e => {
                      const v = e.target.value
                      setSehirQ(v)
                      setForm(f => ({...f, city: v}))
                      const q = normalize(v)
                      if (countryIso === 'TR') {
                        const all = Object.keys(turkiyeData)
                        if (v.length === 0) {
                          setSehirSug(all.slice(0, 6))
                          setSehirOpen(true)
                        } else {
                          const starts = all.filter(name => normalize(name).startsWith(q))
                          const includes = all.filter(name =>
                            !normalize(name).startsWith(q) && normalize(name).includes(q)
                          )
                          setSehirSug([...starts, ...includes].slice(0, 6))
                          setSehirOpen(starts.length + includes.length > 0)
                        }
                      } else if (!(lang === 'ar' && ARAB_COUNTRIES.has(countryIso))) {
                        const cityList = countryIso === 'IR' && lang === 'fa'
                          ? iranCities
                          : countryIso === 'RU' && lang === 'ru'
                          ? russiaCitiesRU
                          : (() => {
                              return worldCitiesForCountry.length
                                ? worldCitiesForCountry
                                : statesOfCountry.map(s => s.name)
                            })()
                        if (v.length === 0) {
                          setSehirSug(cityList.slice(0, 8))
                          setSehirOpen(true)
                        } else {
                          const starts = cityList.filter(name => normalize(name).startsWith(q))
                          const includes = cityList.filter(name =>
                            !normalize(name).startsWith(q) && normalize(name).includes(q)
                          )
                          setSehirSug([...starts, ...includes].slice(0, 8))
                          setSehirOpen(starts.length + includes.length > 0)
                        }
                      }
                    }}
                    onFocus={() => {
                      if (countryIso === 'TR') {
                        const all = Object.keys(turkiyeData)
                        setSehirSug(all.slice(0, 6))
                        setSehirOpen(all.length > 0)
                      } else if (!(lang === 'ar' && ARAB_COUNTRIES.has(countryIso))) {
                        const cityList = countryIso === 'IR' && lang === 'fa'
                          ? iranCities
                          : countryIso === 'RU' && lang === 'ru'
                          ? russiaCitiesRU
                          : (() => {
                              return worldCitiesForCountry.length
                                ? worldCitiesForCountry
                                : statesOfCountry.map(s => s.name)
                            })()
                        setSehirSug(cityList.slice(0, 8))
                        setSehirOpen(cityList.length > 0)
                      }
                    }}
                    onBlur={() => setTimeout(() => setSehirOpen(false), 150)}
                    placeholder={lang === 'ar' && ARAB_COUNTRIES.has(countryIso) ? 'اكتب اسم مدينتك...' : (countryCityExamples[countryIso] || 'City...')}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors ${invalidFields.includes("city") && !form.city ? "border-red-400" : "border-gray-200"}`}
                  />
                  {sehirOpen && sehirSug.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                      {sehirSug.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setSehirQ(s)
                            setSelectedIl(s)
                            setForm(f => ({...f, city: s}))
                            setSehirOpen(false)
                            setIlceQ('')
                            setSelectedIlce('')
                            setMahalleQ('')
                            setForm(f => ({...f, district: '', neighborhood: ''}))
                            if (countryIso !== 'TR') {
                              const stateObj = statesOfCountry.find(st => st.name === s)
                              if (stateObj) setSelectedStateIso(stateObj.isoCode)
                            }
                          }}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* İlçe — Turkey only */}
              {countryIso === 'TR' && <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.district}<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ilceQ}
                    disabled={!sehirQ}
                    onChange={e => {
                      const v = e.target.value
                      setIlceQ(v)
                      setForm(f => ({...f, district: v}))
                      const q = normalize(v)
                      if (countryIso === 'TR') {
                        const ilceler = Object.keys(turkiyeData[selectedIl] || {})
                        if (v.length === 0) {
                          setIlceSug(ilceler.slice(0, 6))
                          setIlceOpen(true)
                        } else {
                          const starts = ilceler.filter(name => normalize(name).startsWith(q))
                          const includes = ilceler.filter(name =>
                            !normalize(name).startsWith(q) && normalize(name).includes(q)
                          )
                          setIlceSug([...starts, ...includes].slice(0, 6))
                          setIlceOpen(starts.length + includes.length > 0)
                        }
                      } else {
                        if (v.length === 0) {
                          setIlceSug(citiesOfState.slice(0, 6))
                          setIlceOpen(true)
                        } else {
                          const starts = citiesOfState.filter(c => normalize(c).startsWith(q))
                          const includes = citiesOfState.filter(c =>
                            !normalize(c).startsWith(q) && normalize(c).includes(q)
                          )
                          setIlceSug([...starts, ...includes].slice(0, 6))
                          setIlceOpen(starts.length + includes.length > 0)
                        }
                      }
                    }}
                    onFocus={() => {
                      if (countryIso === 'TR') {
                        const ilceler = Object.keys(turkiyeData[selectedIl] || {})
                        setIlceSug(ilceler.slice(0, 6))
                        setIlceOpen(ilceler.length > 0)
                      } else {
                        setIlceSug(citiesOfState.slice(0, 6))
                        setIlceOpen(citiesOfState.length > 0)
                      }
                    }}
                    onBlur={() => setTimeout(() => setIlceOpen(false), 150)}
                    placeholder="Esenyurt, Kadıköy, Beşiktaş..."
                    className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${invalidFields.includes("district") && !form.district ? "border-red-400" : "border-gray-200"}`}
                  />
                  {ilceOpen && ilceSug.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                      {ilceSug.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setIlceQ(c)
                            setSelectedIlce(c)
                            setForm(f => ({...f, district: c}))
                            setIlceOpen(false)
                            if (countryIso === 'TR') {
                              setMahalleQ('')
                              setForm(f => ({...f, neighborhood: ''}))
                            }
                          }}
                          className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>}

              {/* Mahalle — optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.neighborhood}
                </label>
                {countryIso === 'TR' && selectedIl && selectedIlce ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={mahalleQ}
                      onChange={e => {
                        const v = e.target.value
                        setMahalleQ(v)
                        setForm(f => ({...f, neighborhood: v}))
                        const mahalleler = turkiyeData[selectedIl]?.[selectedIlce] || []
                        const q = normalize(v)
                        if (v.length === 0) {
                          setMahalleSug(mahalleler.slice(0, 6))
                          setMahalleOpen(true)
                        } else {
                          const starts = mahalleler.filter(m => normalize(m).startsWith(q))
                          const includes = mahalleler.filter(m =>
                            !normalize(m).startsWith(q) && normalize(m).includes(q)
                          )
                          setMahalleSug([...starts, ...includes].slice(0, 6))
                          setMahalleOpen(starts.length + includes.length > 0)
                        }
                      }}
                      onFocus={() => {
                        const mahalleler = turkiyeData[selectedIl]?.[selectedIlce] || []
                        setMahalleSug(mahalleler.slice(0, 6))
                        setMahalleOpen(mahalleler.length > 0)
                      }}
                      onBlur={() => setTimeout(() => setMahalleOpen(false), 150)}
                      placeholder="Zafer Mh., Cumhuriyet Mh..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 bg-white text-sm"
                    />
                    {mahalleOpen && mahalleSug.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-48">
                        {mahalleSug.map((m, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => {
                              setMahalleQ(m)
                              setForm(f => ({...f, neighborhood: m}))
                              setMahalleOpen(false)
                            }}
                            className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-orange-50 hover:text-orange-700 border-b border-gray-100 last:border-0 transition-colors"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.neighborhood || ''}
                    onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    placeholder={countryIso === 'TR' ? "Zafer Mh., Cumhuriyet Mh..." : ""}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 bg-white text-sm"
                  />
                )}
              </div>
            </div>

            {/* 7. Private room required */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.privateRoomLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.private_room_required}
                labelOn={t.privateRoomRequired}
                labelOff={t.privateRoomAny}
                onChange={(v) => set("private_room_required", v)}
                hasError={invalidFields.includes("private_room_required") && form.private_room_required === null}
              />
            </div>

            {/* 8. Smoking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.seekerSmokingLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.smoking}
                labelOn={t.seekerSmokingYes}
                labelOff={t.seekerSmokingNo}
                onChange={(v) => set("smoking", v)}
                hasError={invalidFields.includes("smoking") && form.smoking === null}
              />
            </div>

            {/* 9. Quiet important */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.quietLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.quiet_important}
                labelOn={t.quietYes}
                labelOff={t.quietAny}
                onChange={(v) => set("quiet_important", v)}
                hasError={invalidFields.includes("quiet_important") && form.quiet_important === null}
              />
            </div>

            {/* 10. Pets OK */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.petsLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.pets_ok}
                labelOn={t.petsOk}
                labelOff={t.petsNo}
                onChange={(v) => set("pets_ok", v)}
                hasError={invalidFields.includes("pets_ok") && form.pets_ok === null}
              />
            </div>

            {/* 11. Cleanliness important */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.cleanlinessLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.cleanliness_important}
                labelOn={t.cleanlinessYes}
                labelOff={t.cleanlinessAny}
                onChange={(v) => set("cleanliness_important", v)}
                hasError={invalidFields.includes("cleanliness_important") && form.cleanliness_important === null}
              />
            </div>

            {/* 12. About text (optional) */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.aboutTextLabel}</label>
              <textarea
                rows={4}
                maxLength={500}
                value={form.about_text}
                onChange={(e) => set("about_text", e.target.value)}
                placeholder={t.aboutTextPlaceholder}
                className="w-full border border-gray-200 rounded-2xl p-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm resize-none"
              />
              <p className="text-xs text-stone-400 text-right mt-1">{form.about_text.length}/500</p>
            </div>
          </div>

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
            <button
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </button>
            <div className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-4 text-sm">{t.step2Title}</p>

          {stepErrors.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-4">
              <p className="text-red-600 font-bold text-sm mb-2">⚠️ {vm.header}:</p>
              <ul className="text-red-500 text-sm list-disc list-inside">
                {stepErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

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
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.genderPref}<span className="text-red-500 ml-1">*</span></label>
              <OptionGroup
                value={form.gender_preference}
                onChange={(v) => set("gender_preference", v as GenderPref)}
                options={[
                  { label: t.genderMale, value: "male" },
                  { label: t.genderFemale, value: "female" },
                  { label: t.genderAny, value: "any" },
                ]}
                hasError={invalidFields.includes("gender") && form.gender_preference === null}
              />
            </div>

            {/* 2. Occupation preference */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.occupationPref}<span className="text-red-500 ml-1">*</span></label>
              <OptionGroup
                value={form.occupation_preference}
                onChange={(v) => set("occupation_preference", v as OccupationPref)}
                options={[
                  { label: t.occStudent, value: "student" },
                  { label: t.occWorking, value: "working" },
                  { label: t.occAny, value: "any" },
                ]}
                hasError={invalidFields.includes("occupation") && form.occupation_preference === null}
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

            {/* 4. Furnished */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.furnishedLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.furnished}
                labelOn={t.furnishedYes}
                labelOff={t.furnishedNo}
                onChange={(v) => set("furnished", v)}
                hasError={invalidFields.includes("furnished") && form.furnished === null}
              />
            </div>

            {/* 5. Elevator */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.elevatorLabel}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.elevator}
                labelOn={t.elevatorYes}
                labelOff={t.elevatorNo}
                onChange={(v) => set("elevator", v)}
                hasError={invalidFields.includes("elevator") && form.elevator === null}
              />
            </div>

            {/* 6. Parking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.parking}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.parking}
                labelOn={t.parkingYes}
                labelOff={t.parkingNo}
                onChange={(v) => set("parking", v)}
                hasError={invalidFields.includes("parking") && form.parking === null}
              />
            </div>

            {/* 7. Smoking */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.smoking}<span className="text-red-500 ml-1">*</span></label>
              <Toggle
                value={form.smoking}
                labelOn={t.smokingYes}
                labelOff={t.smokingNo}
                onChange={(v) => set("smoking", v)}
                hasError={invalidFields.includes("smoking") && form.smoking === null}
              />
            </div>

            {/* 8. Description */}
            <div className="p-5">
              <label className="block text-sm font-semibold text-stone-700 mb-3">{t.descLabel}</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t.descPlaceholder}
                className={`w-full border rounded-2xl p-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm resize-none ${invalidFields.includes("description") && (!form.description || form.description.trim().length < 20) ? "border-red-400 border-2" : "border-gray-200"}`}
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className={`bg-white rounded-2xl shadow-sm p-5 mt-4 ${invalidFields.includes("photos") && form.photos.length === 0 ? "border-2 border-red-400" : "border border-stone-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-stone-700">{t.photos}<span className="text-red-500 ml-1">*</span></label>
              <span className="text-xs text-stone-400">
                {form.photos.length + uploadingCount}/3
              </span>
            </div>

            {/* Preview grid */}
            {(form.photos.length > 0 || uploadingCount > 0) && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {Array.from({ length: uploadingCount }).map((_, i) => (
                  <div key={`uploading-${i}`} className="aspect-square rounded-xl bg-stone-100 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                  </div>
                ))}
              </div>
            )}

            {/* Upload area — hidden when 3 slots filled */}
            {form.photos.length + uploadingCount < 3 && (
              <div
                onClick={() => photoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer active:bg-orange-100 transition-colors ${invalidFields.includes("photos") && form.photos.length === 0 ? "border-red-400 bg-red-50" : "border-orange-300 bg-orange-50"}`}
              >
                <span className="text-3xl">📷</span>
                <p className="text-sm font-medium text-orange-700">{t.uploadPhotos}</p>
                <p className="text-xs text-gray-400">PNG, JPG • Maks. 3 fotoğraf</p>
              </div>
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              className="hidden"
            />

            {photoError && (
              <p className="mt-3 text-xs text-rose-500">{photoError}</p>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={goBack}
              className="flex-1 py-3.5 rounded-xl font-bold text-stone-700 border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 transition-all duration-200 text-sm"
            >
              {t.back}
            </button>
            <button
              onClick={goNext}
              disabled={uploadingCount > 0}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:opacity-90 active:scale-95 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t.next}
            </button>
          </div>
        </div>

      {/* Photo crop modal */}
      {showPhotoCropModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-100">
              <p className="text-stone-800 font-bold text-sm text-center">
                {t.photos}
              </p>
            </div>
            <div className="p-4 flex items-center justify-center bg-stone-50 overflow-auto max-h-[65vh]">
              {cropImgSrc && (
                <ReactCrop
                  crop={photoCrop}
                  onChange={(_, pct) => setPhotoCrop(pct)}
                  onComplete={(c) => setPhotoCompletedCrop(c)}
                  minWidth={30}
                  minHeight={30}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={cropImgRef}
                    src={cropImgSrc}
                    alt="Crop"
                    onLoad={onPhotoCropImageLoad}
                    style={{ maxHeight: "60vh", maxWidth: "100%", display: "block" }}
                  />
                </ReactCrop>
              )}
            </div>
            <div className="py-3 flex items-center justify-center gap-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleCropRotate(-90)}
                disabled={cropSaving}
                className="w-10 h-10 rounded-full bg-white border-2 border-orange-400 text-orange-500 text-lg flex items-center justify-center hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-60"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={() => handleCropRotate(90)}
                disabled={cropSaving}
                className="w-10 h-10 rounded-full bg-white border-2 border-orange-400 text-orange-500 text-lg flex items-center justify-center hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-60"
              >
                ↻
              </button>
            </div>
            <div className="p-4 flex gap-3">
              <button
                type="button"
                onClick={handlePhotoCropCancel}
                disabled={cropSaving}
                className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-60"
              >
                {t.cropCancel}
              </button>
              <button
                type="button"
                onClick={handlePhotoCropSave}
                disabled={cropSaving || !photoCompletedCrop}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
              >
                {cropSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  </span>
                ) : t.cropSave}
              </button>
            </div>
          </div>
        </div>
      )}
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

    const perLabel = lang === "tr" ? "ay" : lang === "fa" ? "ماه" : lang === "ar" ? "شهر" : lang === "de" ? "Mo." : lang === "ru" ? "мес." : "mo";
    const formatBudget = (amount: string) =>
      !amount ? "—" : form.currency === "TOMAN"
        ? `${amount} تومان / ${perLabel}`
        : `${CURRENCY_SYMBOLS[form.currency]}${amount} / ${perLabel}`;

    const rows: { label: string; value: string }[] = [
      { label: t.typeLabel, value: isHasPlace ? t.hasPlaceLabel : t.needsPlaceLabel },
      ...(isHasPlace
        ? [
            { label: t.houseTypeReviewLabel, value: (form.houseType ? houseTypeLabels[form.houseType] : null) || "—" },
            { label: t.floorReviewLabel, value: form.floor === 21 ? '20+' : `${form.floor}` },
            { label: t.elevatorReviewLabel, value: form.elevator === true ? t.yes : form.elevator === false ? t.no : '—' },
            { label: t.parkingLabel, value: form.parking === true ? t.yes : form.parking === false ? t.no : '—' },
            { label: t.furnishedReviewLabel, value: form.furnished === true ? t.furnishedYes : form.furnished === false ? t.furnishedNo : '—' },
            { label: t.locationReviewLabel, value: locationStr },
            { label: t.priceReviewLabel, value: formatBudget(form.price) },
            { label: t.smokingLabel, value: form.smoking === true ? t.smokingYes : form.smoking === false ? t.smokingNo : '—' },
            { label: t.residentsLabel, value: `${form.current_residents} ${t.person}` },
          ]
        : [
            { label: t.seekerGenderLabel, value: form.seeker_gender === "male" ? t.genderMale : form.seeker_gender === "female" ? t.genderFemale : "—" },
            { label: t.preferredRoommateGenderLabel, value: form.preferred_roommate_gender === "male" ? t.genderMale : form.preferred_roommate_gender === "female" ? t.genderFemale : form.preferred_roommate_gender === "any" ? t.genderAny : "—" },
            { label: t.seekerAgeLabel, value: form.seeker_age || "—" },
            { label: t.seekerOccLabel, value: form.occupation === "working" ? t.seekerOccWorking : form.occupation === "student" ? t.seekerOccStudent : "—" },
            { label: t.maxBudgetLabel, value: formatBudget(form.max_budget) },
            { label: t.locationReviewLabel, value: locationStr },
            { label: t.privateRoomLabel, value: form.private_room_required === true ? t.privateRoomRequired : form.private_room_required === false ? t.privateRoomAny : "—" },
            { label: t.seekerSmokingLabel, value: form.smoking === true ? t.seekerSmokingYes : form.smoking === false ? t.seekerSmokingNo : "—" },
            { label: t.quietLabel, value: form.quiet_important === true ? t.quietYes : form.quiet_important === false ? t.quietAny : "—" },
            { label: t.petsLabel, value: form.pets_ok === true ? t.petsOk : form.pets_ok === false ? t.petsNo : "—" },
            { label: t.cleanlinessLabel, value: form.cleanliness_important === true ? t.cleanlinessYes : form.cleanliness_important === false ? t.cleanlinessAny : "—" },
            ...(form.about_text ? [{ label: t.aboutTextLabel, value: form.about_text }] : []),
          ]),
    ];

    return (
      <div dir={dir} className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-24 pb-16 px-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.back}
            </button>
            <div className="inline-block">
              <Link href="/" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t.home}</span>
              </Link>
            </div>
          </div>

          <ProgressBar />
          <h1 className="text-2xl font-black text-stone-900 mb-2">{t.pageTitle}</h1>
          <p className="text-stone-500 mb-8 text-sm">{t.step3Title}</p>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {form.photos.length > 0 && (
              <div className="flex gap-1">
                {form.photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="flex-1 h-40 object-cover"
                    style={{ maxWidth: `${100 / form.photos.length}%` }}
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

export default function CreateListingPageRoot() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <CreateListingPage />
    </Suspense>
  );
}
