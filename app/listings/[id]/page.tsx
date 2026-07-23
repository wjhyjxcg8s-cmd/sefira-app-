"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/app/lib/LangContext";
import { getThumbUrl, getCardUrl } from "@/app/lib/imageVariants";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AuthModal from "@/app/components/AuthModal";
import { createClient } from "@supabase/supabase-js";
import { getListingSide, getCommercialBadgeLabel } from "@/app/lib/listingBadge";
import { COMMERCIAL_TYPE_BY_SLUG, COMMERCIAL_AMENITY_LABELS, COMMERCIAL_AMENITY_ICONS } from "@/app/lib/commercialTypes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

const labels: Record<Lang, Record<string, string>> = {
  tr: {
    contact: "Mesaj Gönder",
    ownListing: "Bu sizin ilanınız",
    loginPrompt: "Mesaj için giriş yap →",
    description: "Açıklama",
    preferences: "Tercihler",
    memberSince: "Üye",
    age: "yaşında",
    verified: "Onaylı",
    ownerBadge: "Ev Sahibi",
    tenantBadge: "Kiracı",
    perMonth: "/ ay",
    elevatorOwnerOn: "Asansör var", elevatorOwnerOff: "Asansör yok", elevatorSeekerOn: "Asansör istiyor",
    furnishedOwnerOn: "Eşyalı", furnishedOwnerOff: "Eşyasız", furnishedSeekerOn: "Eşyalı istiyor",
    parkingOwnerOn: "Otopark var", parkingOwnerOff: "Otopark yok", parkingSeekerOn: "Otopark istiyor",
    smokingOwnerOn: "Sigara serbest", smokingOwnerOff: "Sigara yasak",
    smokingSeekerOn: "Sigara içilebilir yer arıyor", smokingSeekerOff: "Sigara içilmeyen yer istiyor",
    budget: "Bütçe", ageLabel: "Yaş", gender: "Cinsiyet", occupation: "Meslek",
    wantsPrivateRoom: "Özel oda istiyor", maxPrefix: "Maks",
    seekerBadge: "Ev Arıyor", roomType: "Oda Tipi", privateRoomYes: "Özel Oda", privateRoomAny: "Fark Etmez",
    genderPref: "Ev Arkadaşı Tercihi", aboutTitle: "Kullanıcı kendini şöyle anlatıyor:",
    home: "Ana Sayfa", share: "Paylaş", linkCopied: "Link kopyalandı",
    linkToCopy: "Kopyalamak için bağlantı", close: "Kapat",
    spaceTypeCaption: "Alan Türü", sqmCaption: "Metrekare",
    houseTypeCaption: "Ev Tipi", roomsCaption: "Oda Sayısı", elevatorCaption: "Asansör",
    furnishedCaption: "Eşya Durumu", parkingCaption: "Otopark", smokingCaption: "Sigara",
    residentsCaption: "Mevcut Sakin", roomsSuffix: "oda", residentsSuffix: "kişi yaşıyor",
    houseTypeApartment: "Daire", houseTypeVilla: "Villa", houseTypeResidence: "Rezidans",
    houseTypeDormitory: "Yurt", houseTypeIndependent: "Müstakil Ev",
    genderMale: "Erkek", genderFemale: "Kadın", genderAny: "Farketmez",
    occWorking: "Çalışıyor", occStudent: "Öğrenci",
    occAdjWorking: "çalışan", occAdjStudent: "öğrenci",
    quietCaption: "Sessizlik", quietYes: "Sessiz ortam istiyor", quietAny: "Fark etmez",
    petsCaption: "Evcil Hayvan", petsOk: "Evcil hayvan olabilir", petsNo: "Evcil hayvan istemiyor",
    cleanlinessCaption: "Temizlik", cleanlinessYes: "Temizliğe önem veriyor", cleanlinessAny: "Fark etmez",
    summaryTitle: "Özet",
    summaryAgeOcc: "{age} yaşında, {occ} bir kişi.",
    summaryAgeOnly: "{age} yaşında.",
    summaryOccOnly: "{occ} bir kişi.",
    summaryLocationRoom: "{city}'da {room} arıyor.",
    summaryRoomOnly: "{room} arıyor.",
    roomPhrasePrivate: "özel oda", roomPhraseAny: "oda",
    summaryBudget: "Aylık bütçesi maksimum {budget}.",
    summaryRoommatePref: "Ev arkadaşı tercihi: {pref}.",
  },
  en: {
    contact: "Send Message",
    ownListing: "This is your listing",
    loginPrompt: "Login to message →",
    description: "Description",
    preferences: "Preferences",
    memberSince: "Member since",
    age: "years old",
    verified: "Verified",
    ownerBadge: "Host",
    tenantBadge: "Tenant",
    perMonth: "/ mo",
    elevatorOwnerOn: "Has elevator", elevatorOwnerOff: "No elevator", elevatorSeekerOn: "Wants elevator",
    furnishedOwnerOn: "Furnished", furnishedOwnerOff: "Unfurnished", furnishedSeekerOn: "Wants furnished",
    parkingOwnerOn: "Has parking", parkingOwnerOff: "No parking", parkingSeekerOn: "Wants parking",
    smokingOwnerOn: "Smoking allowed", smokingOwnerOff: "No smoking",
    smokingSeekerOn: "Ok with smoking", smokingSeekerOff: "Wants non-smoking place",
    budget: "Budget", ageLabel: "Age", gender: "Gender", occupation: "Occupation",
    wantsPrivateRoom: "Wants private room", maxPrefix: "Max",
    seekerBadge: "Seeker", roomType: "Room Type", privateRoomYes: "Private Room", privateRoomAny: "Doesn't matter",
    genderPref: "Roommate Preference", aboutTitle: "The user describes themselves as:",
    home: "Home", share: "Share", linkCopied: "Link copied",
    linkToCopy: "Link to copy", close: "Close",
    spaceTypeCaption: "Space Type", sqmCaption: "Square Meters",
    houseTypeCaption: "House Type", roomsCaption: "Rooms", elevatorCaption: "Elevator",
    furnishedCaption: "Furnishing", parkingCaption: "Parking", smokingCaption: "Smoking",
    residentsCaption: "Current Residents", roomsSuffix: "rooms", residentsSuffix: "residents",
    houseTypeApartment: "Apartment", houseTypeVilla: "Villa", houseTypeResidence: "Residence",
    houseTypeDormitory: "Dormitory", houseTypeIndependent: "Independent House",
    genderMale: "Male", genderFemale: "Female", genderAny: "No preference",
    occWorking: "Working", occStudent: "Student",
    occAdjWorking: "working", occAdjStudent: "a student",
    quietCaption: "Quiet", quietYes: "Wants a quiet place", quietAny: "No preference",
    petsCaption: "Pets", petsOk: "Pets welcome", petsNo: "No pets",
    cleanlinessCaption: "Cleanliness", cleanlinessYes: "Values cleanliness", cleanlinessAny: "No preference",
    summaryTitle: "Summary",
    summaryAgeOcc: "{age} years old, {occ}.",
    summaryAgeOnly: "{age} years old.",
    summaryOccOnly: "{occ}.",
    summaryLocationRoom: "Looking for {room} in {city}.",
    summaryRoomOnly: "Looking for {room}.",
    roomPhrasePrivate: "a private room", roomPhraseAny: "a room",
    summaryBudget: "Monthly budget up to {budget}.",
    summaryRoommatePref: "Roommate preference: {pref}.",
  },
  fa: {
    contact: "ارسال پیام",
    ownListing: "این آگهی شماست",
    loginPrompt: "برای پیام وارد شوید ←",
    description: "توضیحات",
    preferences: "ترجیحات",
    memberSince: "عضو از",
    age: "ساله",
    verified: "تأیید شده",
    ownerBadge: "صاحب‌خانه",
    tenantBadge: "مستأجر",
    perMonth: "/ ماه",
    elevatorOwnerOn: "دارای آسانسور", elevatorOwnerOff: "بدون آسانسور", elevatorSeekerOn: "آسانسور داشته باشد",
    furnishedOwnerOn: "مبله", furnishedOwnerOff: "بدون مبلمان", furnishedSeekerOn: "مبله باشد",
    parkingOwnerOn: "دارای پارکینگ", parkingOwnerOff: "بدون پارکینگ", parkingSeekerOn: "پارکینگ داشته باشد",
    smokingOwnerOn: "سیگار آزاد", smokingOwnerOff: "سیگار ممنوع",
    smokingSeekerOn: "با سیگار مشکلی ندارد", smokingSeekerOff: "محیط بدون سیگار می‌خواهد",
    budget: "بودجه", ageLabel: "سن", gender: "جنسیت", occupation: "شغل",
    wantsPrivateRoom: "اتاق خصوصی می‌خواهد", maxPrefix: "حداکثر",
    seekerBadge: "دنبال فضا", roomType: "نوع فضا", privateRoomYes: "اتاق خصوصی", privateRoomAny: "مهم نیست",
    genderPref: "ترجیح هم‌خانه", aboutTitle: "کاربر در مورد خودش اینطور توضیح می‌دهد:",
    home: "خانه", share: "اشتراک‌گذاری", linkCopied: "لینک کپی شد",
    linkToCopy: "لینک برای کپی کردن", close: "بستن",
    spaceTypeCaption: "نوع فضا", sqmCaption: "متراژ",
    houseTypeCaption: "نوع خانه", roomsCaption: "تعداد اتاق", elevatorCaption: "آسانسور",
    furnishedCaption: "وضعیت مبلمان", parkingCaption: "پارکینگ", smokingCaption: "سیگار",
    residentsCaption: "ساکنان فعلی", roomsSuffix: "اتاق", residentsSuffix: "نفر ساکن",
    houseTypeApartment: "آپارتمان", houseTypeVilla: "ویلا", houseTypeResidence: "رزیدانس",
    houseTypeDormitory: "خوابگاه", houseTypeIndependent: "خانه مستقل",
    genderMale: "مرد", genderFemale: "زن", genderAny: "مهم نیست",
    occWorking: "شاغل", occStudent: "دانشجو",
    occAdjWorking: "شاغل", occAdjStudent: "دانشجو",
    quietCaption: "آرامش", quietYes: "به دنبال محیط آرام است", quietAny: "مهم نیست",
    petsCaption: "حیوان خانگی", petsOk: "حیوان خانگی مشکلی ندارد", petsNo: "حیوان خانگی نمی‌خواهد",
    cleanlinessCaption: "نظافت", cleanlinessYes: "به نظافت اهمیت می‌دهد", cleanlinessAny: "مهم نیست",
    summaryTitle: "خلاصه",
    summaryAgeOcc: "{age} ساله و {occ}.",
    summaryAgeOnly: "{age} ساله.",
    summaryOccOnly: "{occ}.",
    summaryLocationRoom: "در {city} به دنبال {room} است.",
    summaryRoomOnly: "به دنبال {room} است.",
    roomPhrasePrivate: "اتاق خصوصی", roomPhraseAny: "اتاق",
    summaryBudget: "بودجه ماهانه حداکثر {budget}.",
    summaryRoommatePref: "ترجیح هم‌خانه: {pref}.",
  },
  ar: {
    contact: "إرسال رسالة",
    ownListing: "هذا إعلانك",
    loginPrompt: "سجل دخولك للرسائل ←",
    description: "الوصف",
    preferences: "التفضيلات",
    memberSince: "عضو منذ",
    age: "سنة",
    verified: "موثق",
    ownerBadge: "صاحب المنزل",
    tenantBadge: "مستأجر",
    perMonth: "/ شهر",
    elevatorOwnerOn: "يوجد مصعد", elevatorOwnerOff: "لا يوجد مصعد", elevatorSeekerOn: "يريد مصعداً",
    furnishedOwnerOn: "مفروش", furnishedOwnerOff: "غير مفروش", furnishedSeekerOn: "يريد مفروشاً",
    parkingOwnerOn: "يوجد موقف", parkingOwnerOff: "لا يوجد موقف", parkingSeekerOn: "يريد موقفاً",
    smokingOwnerOn: "التدخين مسموح", smokingOwnerOff: "ممنوع التدخين",
    smokingSeekerOn: "لا مانع من التدخين", smokingSeekerOff: "يريد مكاناً خالياً من التدخين",
    budget: "الميزانية", ageLabel: "العمر", gender: "الجنس", occupation: "المهنة",
    wantsPrivateRoom: "يريد غرفة خاصة", maxPrefix: "الحد الأقصى",
    seekerBadge: "يبحث عن سكن", roomType: "نوع الغرفة", privateRoomYes: "غرفة خاصة", privateRoomAny: "لا يهم",
    genderPref: "تفضيل شريك السكن", aboutTitle: "يصف المستخدم نفسه كالتالي:",
    home: "الرئيسية", share: "مشاركة", linkCopied: "تم نسخ الرابط",
    linkToCopy: "رابط للنسخ", close: "إغلاق",
    spaceTypeCaption: "نوع المساحة", sqmCaption: "المساحة (م²)",
    houseTypeCaption: "نوع المسكن", roomsCaption: "عدد الغرف", elevatorCaption: "المصعد",
    furnishedCaption: "التأثيث", parkingCaption: "موقف السيارات", smokingCaption: "التدخين",
    residentsCaption: "السكان الحاليون", roomsSuffix: "غرفة", residentsSuffix: "ساكن",
    houseTypeApartment: "شقة", houseTypeVilla: "فيلا", houseTypeResidence: "ريزيدنس",
    houseTypeDormitory: "سكن طلابي", houseTypeIndependent: "بيت مستقل",
    genderMale: "ذكر", genderFemale: "أنثى", genderAny: "لا يهم",
    occWorking: "يعمل", occStudent: "طالب",
    occAdjWorking: "يعمل", occAdjStudent: "طالب",
    quietCaption: "الهدوء", quietYes: "يبحث عن مكان هادئ", quietAny: "لا يهم",
    petsCaption: "الحيوانات الأليفة", petsOk: "الحيوانات الأليفة مقبولة", petsNo: "لا يريد حيوانات أليفة",
    cleanlinessCaption: "النظافة", cleanlinessYes: "يهتم بالنظافة", cleanlinessAny: "لا يهم",
    summaryTitle: "ملخص",
    summaryAgeOcc: "{age} سنة و{occ}.",
    summaryAgeOnly: "{age} سنة.",
    summaryOccOnly: "{occ}.",
    summaryLocationRoom: "يبحث عن {room} في {city}.",
    summaryRoomOnly: "يبحث عن {room}.",
    roomPhrasePrivate: "غرفة خاصة", roomPhraseAny: "غرفة",
    summaryBudget: "الميزانية الشهرية حتى {budget}.",
    summaryRoommatePref: "تفضيل شريك السكن: {pref}.",
  },
  de: {
    contact: "Nachricht senden",
    ownListing: "Das ist Ihre Anzeige",
    loginPrompt: "Einloggen zum Schreiben →",
    description: "Beschreibung",
    preferences: "Präferenzen",
    memberSince: "Mitglied seit",
    age: "Jahre alt",
    verified: "Verifiziert",
    ownerBadge: "Vermieter",
    tenantBadge: "Mieter",
    perMonth: "/ Mo.",
    elevatorOwnerOn: "Mit Aufzug", elevatorOwnerOff: "Kein Aufzug", elevatorSeekerOn: "Möchte Aufzug",
    furnishedOwnerOn: "Möbliert", furnishedOwnerOff: "Unmöbliert", furnishedSeekerOn: "Möchte möbliert",
    parkingOwnerOn: "Mit Parkplatz", parkingOwnerOff: "Kein Parkplatz", parkingSeekerOn: "Möchte Parkplatz",
    smokingOwnerOn: "Rauchen erlaubt", smokingOwnerOff: "Rauchen verboten",
    smokingSeekerOn: "Raucher ok", smokingSeekerOff: "Möchte Nichtraucher-Unterkunft",
    budget: "Budget", ageLabel: "Alter", gender: "Geschlecht", occupation: "Beruf",
    wantsPrivateRoom: "Möchte Privatzimmer", maxPrefix: "Max",
    seekerBadge: "Suchend", roomType: "Zimmerart", privateRoomYes: "Privatzimmer", privateRoomAny: "Egal",
    genderPref: "Mitbewohner-Präferenz", aboutTitle: "Der Nutzer beschreibt sich so:",
    home: "Startseite", share: "Teilen", linkCopied: "Link kopiert",
    linkToCopy: "Link zum Kopieren", close: "Schließen",
    spaceTypeCaption: "Flächentyp", sqmCaption: "Quadratmeter",
    houseTypeCaption: "Haustyp", roomsCaption: "Zimmer", elevatorCaption: "Aufzug",
    furnishedCaption: "Möblierung", parkingCaption: "Parkplatz", smokingCaption: "Rauchen",
    residentsCaption: "Aktuelle Bewohner", roomsSuffix: "Zimmer", residentsSuffix: "Bewohner",
    houseTypeApartment: "Wohnung", houseTypeVilla: "Villa", houseTypeResidence: "Residenz",
    houseTypeDormitory: "Wohnheim", houseTypeIndependent: "Einfamilienhaus",
    genderMale: "Männlich", genderFemale: "Weiblich", genderAny: "Egal",
    occWorking: "Berufstätig", occStudent: "Student",
    occAdjWorking: "berufstätig", occAdjStudent: "Student",
    quietCaption: "Ruhe", quietYes: "Wünscht ruhige Umgebung", quietAny: "Egal",
    petsCaption: "Haustiere", petsOk: "Haustiere willkommen", petsNo: "Keine Haustiere",
    cleanlinessCaption: "Sauberkeit", cleanlinessYes: "Legt Wert auf Sauberkeit", cleanlinessAny: "Egal",
    summaryTitle: "Zusammenfassung",
    summaryAgeOcc: "{age} Jahre alt und {occ}.",
    summaryAgeOnly: "{age} Jahre alt.",
    summaryOccOnly: "{occ}.",
    summaryLocationRoom: "Sucht {room} in {city}.",
    summaryRoomOnly: "Sucht {room}.",
    roomPhrasePrivate: "ein Privatzimmer", roomPhraseAny: "ein Zimmer",
    summaryBudget: "Monatliches Budget bis zu {budget}.",
    summaryRoommatePref: "Mitbewohner-Präferenz: {pref}.",
  },
  ru: {
    contact: "Отправить сообщение",
    ownListing: "Это ваше объявление",
    loginPrompt: "Войдите, чтобы написать →",
    description: "Описание",
    preferences: "Предпочтения",
    memberSince: "Участник с",
    age: "лет",
    verified: "Подтверждён",
    ownerBadge: "Арендодатель",
    tenantBadge: "Арендатор",
    perMonth: "/ мес.",
    elevatorOwnerOn: "Есть лифт", elevatorOwnerOff: "Без лифта", elevatorSeekerOn: "Хочет лифт",
    furnishedOwnerOn: "С мебелью", furnishedOwnerOff: "Без мебели", furnishedSeekerOn: "Хочет с мебелью",
    parkingOwnerOn: "Есть парковка", parkingOwnerOff: "Нет парковки", parkingSeekerOn: "Хочет парковку",
    smokingOwnerOn: "Курение разрешено", smokingOwnerOff: "Курение запрещено",
    smokingSeekerOn: "Курение допустимо", smokingSeekerOff: "Хочет место для некурящих",
    budget: "Бюджет", ageLabel: "Возраст", gender: "Пол", occupation: "Профессия",
    wantsPrivateRoom: "Хочет отдельную комнату", maxPrefix: "Макс",
    seekerBadge: "Ищет жильё", roomType: "Тип комнаты", privateRoomYes: "Отдельная комната", privateRoomAny: "Неважно",
    genderPref: "Предпочтение соседа", aboutTitle: "Пользователь описывает себя так:",
    home: "Главная", share: "Поделиться", linkCopied: "Ссылка скопирована",
    linkToCopy: "Ссылка для копирования", close: "Закрыть",
    spaceTypeCaption: "Тип помещения", sqmCaption: "Площадь (м²)",
    houseTypeCaption: "Тип жилья", roomsCaption: "Комнат", elevatorCaption: "Лифт",
    furnishedCaption: "Мебель", parkingCaption: "Парковка", smokingCaption: "Курение",
    residentsCaption: "Текущие жильцы", roomsSuffix: "комнат", residentsSuffix: "жильцов",
    houseTypeApartment: "Квартира", houseTypeVilla: "Вилла", houseTypeResidence: "Резиденция",
    houseTypeDormitory: "Общежитие", houseTypeIndependent: "Частный дом",
    genderMale: "Мужской", genderFemale: "Женский", genderAny: "Не важно",
    occWorking: "Работает", occStudent: "Студент",
    occAdjWorking: "работает", occAdjStudent: "студент",
    quietCaption: "Тишина", quietYes: "Хочет тихое место", quietAny: "Не важно",
    petsCaption: "Животные", petsOk: "Можно с животными", petsNo: "Без животных",
    cleanlinessCaption: "Чистота", cleanlinessYes: "Важна чистота", cleanlinessAny: "Не важно",
    summaryTitle: "Сводка",
    summaryAgeOcc: "{age} лет, {occ}.",
    summaryAgeOnly: "{age} лет.",
    summaryOccOnly: "{occ}.",
    summaryLocationRoom: "Ищет {room} в городе {city}.",
    summaryRoomOnly: "Ищет {room}.",
    roomPhrasePrivate: "отдельную комнату", roomPhraseAny: "комнату",
    summaryBudget: "Ежемесячный бюджет до {budget}.",
    summaryRoommatePref: "Предпочтение соседа: {pref}.",
  },
};

function codeToFlag(code: string): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
}

// The stored country string is whatever language the poster typed it in at creation time —
// always re-derive from country_code in the viewer's current language instead of trusting it.
function localizedCountryName(countryCode: string | null | undefined, fallback: string | null | undefined, lang: string): string | null {
  if (countryCode && /^[A-Za-z]{2}$/.test(countryCode)) {
    try {
      const name = new Intl.DisplayNames([lang], { type: "region" }).of(countryCode.toUpperCase());
      if (name) return name;
    } catch {
      // unsupported locale/code — fall back to stored value below
    }
  }
  return fallback ?? null;
}

function houseTypeLabel(t: Record<string, string>, houseType: string | null): string | null {
  if (!houseType) return null;
  const map: Record<string, string> = {
    apartment: t.houseTypeApartment,
    villa: t.houseTypeVilla,
    residence: t.houseTypeResidence,
    dormitory: t.houseTypeDormitory,
    independent: t.houseTypeIndependent,
  };
  return map[houseType] ?? houseType;
}

// seeker_gender / preferred_roommate_gender are stored as raw enum strings ("male"/"female"/"any") —
// always translate through this map instead of rendering them directly.
function genderLabel(t: Record<string, string>, value: string | null): string | null {
  if (!value) return null;
  const map: Record<string, string> = { male: t.genderMale, female: t.genderFemale, any: t.genderAny };
  return map[value] ?? value;
}

// occupation is a fixed dropdown ("working"/"student"), not free text — same rule applies.
function occupationLabel(t: Record<string, string>, value: string | null): string | null {
  if (!value) return null;
  const map: Record<string, string> = { working: t.occWorking, student: t.occStudent };
  return map[value] ?? value;
}

function occupationAdjective(t: Record<string, string>, value: string | null): string | null {
  if (!value) return null;
  const map: Record<string, string> = { working: t.occAdjWorking, student: t.occAdjStudent };
  return map[value] ?? value;
}

// Commercial listings store none of the residential fields (house_type/rooms/elevator/
// furnished/parking/smoking/current_residents) — create-commercial-listing's insert
// payload only ever writes commercial_type, square_meters, and an amenities string[].
// Renders as grid items so it drops into either hero's existing grid-cols-2 wrapper.
interface CommercialListingFields {
  commercial_type: string | null;
  square_meters: number | null;
  amenities: string[] | null;
}

function CommercialDetailFields({ listing, t, lang }: { listing: CommercialListingFields; t: Record<string, string>; lang: Lang }) {
  const type = listing.commercial_type ? COMMERCIAL_TYPE_BY_SLUG[listing.commercial_type] : null;
  const amenities: string[] = Array.isArray(listing.amenities) ? listing.amenities : [];

  return (
    <>
      {type && (
        <div className="flex flex-col items-center gap-1.5 p-3 text-center">
          <span className="text-2xl">{type.emoji}</span>
          <span className="text-xs text-gray-400">{t.spaceTypeCaption}</span>
          <span className="text-sm font-bold text-gray-800">{type.label[lang]}</span>
        </div>
      )}
      {listing.square_meters != null && (
        <div className="flex flex-col items-center gap-1.5 p-3 text-center">
          <span className="text-2xl">📐</span>
          <span className="text-xs text-gray-400">{t.sqmCaption}</span>
          <span className="text-sm font-bold text-gray-800">{listing.square_meters} m²</span>
        </div>
      )}
      {amenities.map((key) => (
        <div key={key} className="flex flex-col items-center gap-1.5 p-3 text-center">
          <span className="text-2xl">{COMMERCIAL_AMENITY_ICONS[key] ?? "✓"}</span>
          <span className="text-sm font-bold text-gray-800">{COMMERCIAL_AMENITY_LABELS[key]?.[lang] ?? key}</span>
        </div>
      ))}
    </>
  );
}

// Composes the seeker "Summary" sentence from whatever real fields are populated, skipping the rest.
function buildSeekerSummary(t: Record<string, string>, listing: any): string {
  const clauses: string[] = [];

  const occAdj = occupationAdjective(t, listing.occupation);
  if (listing.seeker_age && occAdj) {
    clauses.push(t.summaryAgeOcc.replace("{age}", String(listing.seeker_age)).replace("{occ}", occAdj));
  } else if (listing.seeker_age) {
    clauses.push(t.summaryAgeOnly.replace("{age}", String(listing.seeker_age)));
  } else if (occAdj) {
    clauses.push(t.summaryOccOnly.replace("{occ}", occAdj));
  }

  const room = listing.private_room_required ? t.roomPhrasePrivate : t.roomPhraseAny;
  if (listing.city) {
    clauses.push(t.summaryLocationRoom.replace("{city}", listing.city).replace("{room}", room));
  } else {
    clauses.push(t.summaryRoomOnly.replace("{room}", room));
  }

  if (listing.max_budget && listing.currency) {
    const budget = `${Number(listing.max_budget).toLocaleString()} ${listing.currency}`;
    clauses.push(t.summaryBudget.replace("{budget}", budget));
  }

  const pref = genderLabel(t, listing.preferred_roommate_gender);
  if (pref) {
    clauses.push(t.summaryRoommatePref.replace("{pref}", pref));
  }

  return clauses.join(" ");
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [listing, setListing] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [shareUrlModal, setShareUrlModal] = useState<string | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    async function load() {
      const id = String(params?.id ?? "");
      console.log("Loading listing id:", id);

      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Step 1: fetch listing alone — no JOIN so a missing profile can't break it
      const { data: listingData, error: listingErr } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      console.log("Listing data:", listingData);
      console.log("Listing error:", listingErr);

      if (listingData) {
        setListing(listingData);

        // Step 2: fetch profile separately — failure is non-fatal
        if (listingData.user_id) {
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles_public')
            .select('user_id, display_name, avatar_url, gender, country')
            .eq('user_id', listingData.user_id)
            .maybeSingle();

          if (profileErr) console.log("Profile fetch error:", profileErr);
          setProfile(profileData);
        }
      }

      setLoading(false);
    }

    load();
  }, [params]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null);
    });
  }, []);

  const t = labels[lang];
  const isRtl = lang === "fa" || lang === "ar";
  const isLoggedIn = !!currentUserId;
  const isOwner = isLoggedIn && listing && currentUserId === listing.user_id;
  const photos: string[] = listing?.photos ?? [];
  const isCommercial = listing?.listing_category === "commercial";
  // Residential listings store the side as a string in `type`; commercial listings
  // never populate `type` — they use has_place/needs_place booleans instead. Checking
  // `type` alone (the old code) always fell through to the owner branch for commercial.
  const isSeeker = listing ? getListingSide(listing) === "needs_place" : false;

  function handleSendMessage() {
    router.push(`/messages?userId=${listing.user_id}&listingId=${listing.id}`);
  }

  function showToast() {
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }

  async function handleShare() {
    const url = window.location.href;
    const title = listing?.city ?? "Sefira";
    const shareData = { title, text: `${title} - Sefira`, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to copy fallbacks
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        showToast();
        return;
      } catch {
        // fall through to legacy copy
      }
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast();
      return;
    } catch {
      setShareUrlModal(url);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-4xl mb-3">🏚️</p>
          <p className="text-gray-500">İlan bulunamadı</p>
          <button onClick={() => router.push("/")} className="mt-4 text-orange-600 underline text-sm">
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  const genderEmoji =
    profile?.gender === "male" || profile?.gender === "erkek" ? "👨"
    : profile?.gender === "female" || profile?.gender === "kadın" || profile?.gender === "kadin" ? "👩"
    : null;

  // buildSeekerSummary is phrased for residential ("looking for a room in X") — commercial
  // seekers have none of the fields it reads (seeker_age/occupation/private_room_required),
  // so it would only ever produce a nonsensical residential-flavored sentence for them.
  const seekerSummary = isSeeker && !isCommercial ? buildSeekerSummary(t, listing) : "";

  return (
    <div className="min-h-screen bg-gray-50 pb-56 md:pb-32" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (searchParams.get("from") === "admin") router.push("/admin-sefira-2026/listings");
              else if (window.history.length > 1) router.back();
              else router.push("/");
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-lg"
          >
            {isRtl ? "→" : "←"}
          </button>
          <Link
            href="/"
            aria-label={t.home}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-lg"
          >
            🏠
          </Link>
        </div>
        <button
          onClick={handleShare}
          aria-label={t.share}
          className="group w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-stone-700 transition-colors hover:bg-orange-50 hover:border-orange-300 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px] group-hover:text-orange-500 transition-colors"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          </svg>
        </button>
      </div>

      {showCopyToast && (
        <div className="fixed bottom-44 md:bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {t.linkCopied}
        </div>
      )}

      {shareUrlModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShareUrlModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-gray-700 mb-2">{t.linkToCopy}</p>
            <p
              className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 break-all select-all"
            >
              {shareUrlModal}
            </p>
            <button
              onClick={() => setShareUrlModal(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {isSeeker ? (
      <>
        {/* ── Seeker hero ─────────────────────────────────────────────────── */}
        <div className="relative min-h-[260px] overflow-hidden bg-gradient-to-b from-orange-100 via-amber-50 to-white">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 260"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* back layer — full-width skyline, grounds the illustration */}
            <g fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25">
              <path d="M0 260 L0 232 L22 232 L22 212 L46 212 L46 226 L70 226 L70 198 L96 198 L96 220 L122 220 L122 206 L146 206 L146 230 L172 230 L172 202 L198 202 L198 216 L222 216 L222 192 L248 192 L248 218 L272 218 L272 202 L298 202 L298 226 L322 226 L322 208 L348 208 L348 224 L372 224 L372 210 L400 210 L400 260" />
              <rect x="28" y="218" width="8" height="8" />
              <rect x="102" y="205" width="8" height="8" />
              <rect x="178" y="212" width="8" height="8" />
              <rect x="228" y="200" width="8" height="8" />
              <rect x="304" y="212" width="8" height="8" />
              <rect x="354" y="214" width="8" height="8" />
            </g>

            {/* mid layer — landmark towers + trees */}
            <g fill="none" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <rect x="52" y="150" width="34" height="80" rx="2" />
              <line x1="69" y1="150" x2="69" y2="136" />
              <rect x="61" y="164" width="8" height="8" />
              <rect x="61" y="184" width="8" height="8" />

              <rect x="308" y="158" width="34" height="72" rx="2" />
              <line x1="325" y1="158" x2="325" y2="144" />
              <rect x="317" y="172" width="8" height="8" />
              <rect x="317" y="192" width="8" height="8" />

              <circle cx="140" cy="214" r="13" />
              <line x1="140" y1="227" x2="140" y2="246" />
              <circle cx="256" cy="208" r="11" />
              <line x1="256" y1="219" x2="256" y2="240" />
            </g>

            {/* floating layer — pin, clouds, magnifier, route */}
            <g fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
              <path d="M200 26c-34 0-61 27-61 61 0 46 61 100 61 100s61-54 61-100c0-34-27-61-61-61z" />
              <circle cx="200" cy="87" r="20" />

              <circle cx="332" cy="52" r="19" />
              <line x1="345" y1="65" x2="367" y2="87" />

              <path d="M32 32a7 7 0 0 1 13-4 8 8 0 0 1 14 3 6 6 0 0 1-2 12H34a6 6 0 0 1-2-11z" />
              <path d="M100 16a6 6 0 0 1 11-3 7 7 0 0 1 12 2 5 5 0 0 1-1 10H98a5 5 0 0 1-2-9z" />
              <path d="M282 18a6 6 0 0 1 11-3 7 7 0 0 1 12 2 5 5 0 0 1-1 10h-19a5 5 0 0 1-3-9z" />
              <path d="M348 40a5 5 0 0 1 9-2 6 6 0 0 1 10 2 4 4 0 0 1-1 8h-15a4 4 0 0 1-3-8z" />

              <path d="M92 196c38-26 88-10 108 18s66 18 96-38" strokeDasharray="1 8" opacity="0.7" />
            </g>

            {/* sparkle accents */}
            <g fill="#fb923c" opacity="0.4">
              <circle cx="128" cy="58" r="2.5" />
              <circle cx="252" cy="42" r="2.5" />
              <circle cx="62" cy="80" r="2" />
              <circle cx="360" cy="110" r="2.5" />
              <circle cx="170" cy="188" r="2" />
            </g>
          </svg>
        </div>

        <div className="flex justify-center -mt-16 relative z-20">
          <div className="relative w-32 h-32">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? ""}
                className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
              />
            ) : (
              <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-5xl font-black text-white border-4 border-white shadow-2xl">
                {(profile?.display_name ?? "?")[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 -mt-12 relative z-10 space-y-4">
          {/* ── Info card ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm px-5 pb-5 pt-20 text-center">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {isCommercial ? getCommercialBadgeLabel("needs_place", lang) : t.seekerBadge}
            </span>

            <h1 className="text-xl font-black text-gray-900">
              {listing.city ?? ""}{listing.district ? ` / ${listing.district}` : ""}
            </h1>

            {listing.country && (
              <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1.5">
                <span>{codeToFlag(listing.country_code)}</span>
                <span>
                  {localizedCountryName(listing.country_code, listing.country, lang)}
                  {listing.country_code ? ` (${listing.country_code})` : ""}
                </span>
              </p>
            )}

            {listing.max_budget && listing.currency && (
              <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold px-4 py-2 rounded-full mt-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                  <path d="M19 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                  <path d="M16 13h2" />
                </svg>
                <span className="font-normal text-gray-400">{t.maxPrefix}</span>
                {Number(listing.max_budget).toLocaleString()} {listing.currency}
                <span className="font-normal text-gray-400">{t.perMonth}</span>
              </span>
            )}
          </div>

          {/* ── Detail cards ─────────────────────────────────────────────────── */}
          {isCommercial ? (
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                <CommercialDetailFields listing={listing} t={t} lang={lang} />
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex divide-x divide-gray-100">
              <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                  <path d="M3 10.5L12 3l9 7.5" />
                  <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
                </svg>
                <span className="text-xs text-gray-400">{t.roomType}</span>
                <span className="text-sm font-bold text-gray-800">
                  {listing.private_room_required ? t.privateRoomYes : t.privateRoomAny}
                </span>
              </div>
              {listing.seeker_gender && (
                <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-xs text-gray-400">{t.gender}</span>
                  <span className="text-sm font-bold text-gray-800">{genderLabel(t, listing.seeker_gender)}</span>
                </div>
              )}
              {listing.seeker_age && (
                <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-xs text-gray-400">{t.ageLabel}</span>
                  <span className="text-sm font-bold text-gray-800">{listing.seeker_age}</span>
                </div>
              )}
              {listing.occupation && (
                <div className="flex-1 flex flex-col items-center gap-1.5 px-2 text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className="text-xs text-gray-400">{t.occupation}</span>
                  <span className="text-sm font-bold text-gray-800">{occupationLabel(t, listing.occupation)}</span>
                </div>
              )}
            </div>
          </div>
          )}

          {/* ── Preferences card (residential seeker preferences only) ─────────── */}
          {!isCommercial && (listing.preferred_roommate_gender || listing.smoking != null || listing.quiet_important != null || listing.pets_ok != null || listing.cleanliness_important != null) && (
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">{t.preferences}</h3>
              <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                {listing.preferred_roommate_gender && (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-xs text-gray-400">{t.genderPref}</span>
                    <span className="text-sm font-bold text-gray-800">{genderLabel(t, listing.preferred_roommate_gender)}</span>
                  </div>
                )}
                {listing.smoking != null && (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                      <rect x="3" y="15" width="14" height="4" rx="1" />
                      <rect x="17" y="15" width="4" height="4" rx="1" />
                      <path d="M6 11c1-2-1-3 0-5" />
                      <path d="M10 11c1-2-1-3 0-5" />
                    </svg>
                    <span className="text-xs text-gray-400">{t.smokingCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.smoking ? t.smokingSeekerOn : t.smokingSeekerOff}</span>
                  </div>
                )}
                {listing.quiet_important != null && (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                      <path d="M11 5 6 9H3v6h3l5 4V5z" />
                      <line x1="16" y1="9" x2="21" y2="14" />
                      <line x1="21" y1="9" x2="16" y2="14" />
                    </svg>
                    <span className="text-xs text-gray-400">{t.quietCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.quiet_important ? t.quietYes : t.quietAny}</span>
                  </div>
                )}
                {listing.pets_ok != null && (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                      <circle cx="8" cy="8" r="2" />
                      <circle cx="14" cy="7" r="2" />
                      <circle cx="18" cy="11" r="2" />
                      <circle cx="5" cy="12" r="2" />
                      <path d="M12 21c-3 0-6-2-6-5 0-2 2-4 6-4s6 2 6 4c0 3-3 5-6 5z" />
                    </svg>
                    <span className="text-xs text-gray-400">{t.petsCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.pets_ok ? t.petsOk : t.petsNo}</span>
                  </div>
                )}
                {listing.cleanliness_important != null && (
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-stone-400">
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5L19 19M19 5l-2.5 2.5M7.5 16.5L5 19" />
                    </svg>
                    <span className="text-xs text-gray-400">{t.cleanlinessCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.cleanliness_important ? t.cleanlinessYes : t.cleanlinessAny}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Summary card — a natural-language recap composed from real fields only ── */}
          {seekerSummary && (
            <div className="bg-orange-50/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm flex-shrink-0">
                  📋
                </span>
                <h3 className="font-bold text-gray-800">{t.summaryTitle}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{seekerSummary}</p>
            </div>
          )}

          {/* ── About card (residential: about_text; commercial: description) ──── */}
          {(isCommercial ? listing.description : listing.about_text) && (
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm flex-shrink-0">
                  ℹ️
                </span>
                <h3 className="font-bold text-gray-800">{isCommercial ? t.description : t.aboutTitle}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{isCommercial ? listing.description : listing.about_text}</p>
            </div>
          )}

          {/* ── Profile card (real data only — no fake ratings/verification/dates) ── */}
          {profile && (
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <div className="flex items-center gap-3">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name ?? ""}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 flex-shrink-0">
                    {(profile.display_name ?? "?")[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{profile.display_name ?? "—"}</p>
                  {profile.country && (
                    <p className="text-sm text-gray-500 mt-0.5">{profile.country}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
      ) : (
      <>
        {/* ── Owner hero ───────────────────────────────────────────────────── */}
        {photos.length > 0 ? (
          <div className="bg-black">
            <div className="aspect-video w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCardUrl(photos[activePhoto])}
                alt={listing.city ?? ""}
                className="w-full h-full object-cover"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 p-2 overflow-x-auto bg-black">
                {photos.map((p: string, i: number) => (
                  <button key={i} onClick={() => setActivePhoto(i)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getThumbUrl(p)}
                      alt=""
                      className={`w-16 h-12 object-cover rounded-lg border-2 transition-all ${
                        i === activePhoto ? "border-emerald-400" : "border-transparent opacity-60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 180"
              preserveAspectRatio="xMidYMid slice"
              style={{ opacity: 0.15 }}
              aria-hidden="true"
            >
              <rect x="15" y="110" width="45" height="40" fill="#78716c" />
              <path d="M10 110 L37.5 85 L65 110 Z" fill="#78716c" />
              <rect x="330" y="90" width="50" height="60" fill="#78716c" />
              <path d="M324 90 L355 60 L386 90 Z" fill="#78716c" />
              <rect x="290" y="130" width="30" height="20" fill="#78716c" />
              <path d="M286 130 L305 115 L324 130 Z" fill="#78716c" />
              <rect x="160" y="70" width="80" height="80" fill="#78716c" />
              <path d="M150 70 L200 30 L250 70 Z" fill="#78716c" />
            </svg>
            <span className="relative text-6xl">🏠</span>
          </div>
        )}

        {/* ── Info card ────────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M3 10.5L12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
            </svg>
            {isCommercial ? getCommercialBadgeLabel("has_place", lang) : t.ownerBadge}
          </span>

          <h1 className="text-xl font-black text-gray-900">
            {listing.city ?? ""}{listing.district ? ` / ${listing.district}` : ""}
          </h1>

          {listing.country && (
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
              <span>{codeToFlag(listing.country_code)}</span>
              <span>{localizedCountryName(listing.country_code, listing.country, lang)}</span>
              {listing.country_code && (
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
                  {listing.country_code}
                </span>
              )}
            </p>
          )}

          {listing.rent && listing.currency && (
            <p className="text-3xl font-black text-orange-600 mt-4">
              {Number(listing.rent).toLocaleString()} {listing.currency}
              <span className="text-base font-normal text-gray-400 ml-1">{t.perMonth}</span>
            </p>
          )}
        </div>

        {/* ── Details grid ─────────────────────────────────────────────────── */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            {isCommercial ? (
              <CommercialDetailFields listing={listing} t={t} lang={lang} />
            ) : (
              <>
                {listing.house_type && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">🏠</span>
                    <span className="text-xs text-gray-400">{t.houseTypeCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{houseTypeLabel(t, listing.house_type)}</span>
                  </div>
                )}
                {listing.rooms && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">🛏️</span>
                    <span className="text-xs text-gray-400">{t.roomsCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.rooms} {t.roomsSuffix}</span>
                  </div>
                )}
                {listing.elevator != null && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">🛗</span>
                    <span className="text-xs text-gray-400">{t.elevatorCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.elevator ? t.elevatorOwnerOn : t.elevatorOwnerOff}</span>
                  </div>
                )}
                {listing.furnished != null && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">🪑</span>
                    <span className="text-xs text-gray-400">{t.furnishedCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.furnished ? t.furnishedOwnerOn : t.furnishedOwnerOff}</span>
                  </div>
                )}
                {listing.parking != null && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">🚗</span>
                    <span className="text-xs text-gray-400">{t.parkingCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.parking ? t.parkingOwnerOn : t.parkingOwnerOff}</span>
                  </div>
                )}
                {listing.smoking != null && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">🚬</span>
                    <span className="text-xs text-gray-400">{t.smokingCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.smoking ? t.smokingOwnerOn : t.smokingOwnerOff}</span>
                  </div>
                )}
                {listing.current_residents > 0 && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-2xl">👥</span>
                    <span className="text-xs text-gray-400">{t.residentsCaption}</span>
                    <span className="text-sm font-bold text-gray-800">{listing.current_residents} {t.residentsSuffix}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── About card ───────────────────────────────────────────────────── */}
        {listing.description && (
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm flex-shrink-0">
                📝
              </span>
              <h3 className="font-bold text-gray-800">{t.description}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* ── Profile card (real data only — no fake ratings/verification) ──── */}
        {profile && (
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? ""}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600 flex-shrink-0">
                  {(profile.display_name ?? "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{profile.display_name ?? "—"}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500 flex-wrap">
                  {genderEmoji && <span>{genderEmoji}</span>}
                  {profile.country && <span>{profile.country}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
      )}

      {/* Fixed contact button — sits above the mobile bottom nav bar (h-16 + safe area) */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg z-20">
        {listing.is_deleted ? (
          <button disabled className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-lg cursor-not-allowed">
            Bu ilan kaldırıldı
          </button>
        ) : isOwner ? (
          <button className="w-full py-4 rounded-2xl bg-gray-200 text-gray-500 font-bold text-lg">
            {t.ownListing}
          </button>
        ) : isLoggedIn ? (
          <button
            onClick={handleSendMessage}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            💬 {t.contact}
          </button>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-lg shadow-lg"
          >
            {t.loginPrompt}
          </button>
        )}
      </div>

      {showAuth && (
        <AuthModal lang={lang} initialTab="login" onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
