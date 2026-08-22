"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { MapPin, PackageOpen } from "lucide-react";
import CountryFlag from "@/app/components/CountryFlag";
import { getListingSide, getCommercialBadgeLabel, getBadgeClass } from "@/app/lib/listingBadge";
import { getThumbUrl } from "@/app/lib/imageVariants";
import SeekerCardVisual from "@/app/components/SeekerCardVisual";
import AvatarImage from "@/app/components/AvatarImage";
import { cityMatches } from "@/app/lib/cityMatch";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Lang = "tr" | "en" | "fa" | "ar" | "de" | "ru";

function normalizeTR(str: string): string {
  return str
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

const turkishCities = [
  "istanbul", "ankara", "izmir", "bursa", "adana", "antalya",
  "konya", "gaziantep", "mersin", "diyarbakir", "kayseri",
  "eskisehir", "trabzon", "agri", "ceyhan", "diyadin",
  "samsun", "denizli", "adapazari", "sakarya", "malatya",
  "kahramanmaras", "erzurum", "van", "batman", "sanliurfa",
  "urfa", "hatay", "antakya", "iskenderun", "bodrum",
  "mugla", "aydin", "manisa", "balikesir", "canakkale",
  "tekirdag", "edirne", "kirklareli", "kocaeli", "izmit",
  "gebze", "pendik", "umraniye", "kadikoy", "besiktas",
  "sisli", "beyoglu", "fatih", "uskudar", "maltepe",
];
const germanCities = ["berlin", "munich", "hamburg", "frankfurt", "cologne", "stuttgart", "dusseldorf", "dortmund", "munchen"];
const usCities = ["new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia", "san antonio", "san diego", "dallas"];
const russianCities = ["moscow", "saint petersburg", "novosibirsk", "yekaterinburg", "nizhny novgorod", "kazan", "moskva"];
const uaeCities = ["dubai", "abu dhabi", "sharjah", "ajman"];
const iranianCities = ["tehran", "mashhad", "isfahan", "ahvaz", "tabriz", "shiraz", "qom", "karaj"];

const cityMap: Record<string, string[]> = {
  TR: turkishCities,
  DE: germanCities,
  US: usCities,
  RU: russianCities,
  AE: uaeCities,
  IR: iranianCities,
};

function detectCountry(city: string, district: string) {
  const loc = normalizeTR((city || "") + " " + (district || ""));

  const turkishPlates: Record<string, string> = {
    istanbul: "34", ankara: "06", izmir: "35",
    bursa: "16", adana: "01", antalya: "07",
    konya: "42", gaziantep: "27", mersin: "33",
    diyarbakir: "21", kayseri: "38", eskisehir: "26",
    trabzon: "61", agri: "04", ceyhan: "01",
    diyadin: "04", samsun: "55", denizli: "20",
    van: "65", malatya: "44", sanliurfa: "63",
    hatay: "31", mugla: "48", manisa: "45",
    balikesir: "10", kocaeli: "41", sakarya: "54",
    erzurum: "25", batman: "72", kahramanmaras: "46",
  };

  for (const [c, plate] of Object.entries(turkishPlates)) {
    if (loc.includes(c)) return { flag: "🇹🇷", country: "TR", plate };
  }
  if (["ahvaz", "tehran", "mashhad", "isfahan", "tabriz", "shiraz"].some((c) => loc.includes(c)))
    return { flag: "🇮🇷", country: "IR", plate: null };
  if (["berlin", "munich", "hamburg", "frankfurt", "cologne", "munchen"].some((c) => loc.includes(c)))
    return { flag: "🇩🇪", country: "DE", plate: null };
  if (["moscow", "saint petersburg", "novosibirsk", "moskva"].some((c) => loc.includes(c)))
    return { flag: "🇷🇺", country: "RU", plate: null };
  if (["dubai", "abu dhabi", "sharjah"].some((c) => loc.includes(c)))
    return { flag: "🇦🇪", country: "AE", plate: null };
  if (["new york", "los angeles", "chicago", "houston"].some((c) => loc.includes(c)))
    return { flag: "🇺🇸", country: "US", plate: null };

  return { flag: "🌍", country: null, plate: null };
}

function GenderBadge({ gender }: { gender: string | null }) {
  if (!gender) return null;
  const isMale = gender === "male" || gender === "erkek" || gender === "man";
  const isFemale = gender === "female" || gender === "kadın" || gender === "kadin" || gender === "woman";
  if (isMale) return <span className="text-lg" title="Erkek">👨</span>;
  if (isFemale) return <span className="text-lg" title="Kadın">👩</span>;
  return null;
}


const countries = [
  { code: "all", flag: "🌍", name: { tr: "Tümü", en: "All", fa: "همه", ar: "الكل", de: "Alle", ru: "Все" } },
  { code: "US", flag: "🇺🇸", name: { tr: "Amerika", en: "USA", fa: "آمریکا", ar: "أمريكا", de: "USA", ru: "США" } },
  { code: "TR", flag: "🇹🇷", name: { tr: "Türkiye", en: "Turkey", fa: "ترکیه", ar: "تركيا", de: "Türkei", ru: "Турция" } },
  { code: "RU", flag: "🇷🇺", name: { tr: "Rusya", en: "Russia", fa: "روسیه", ar: "روسيا", de: "Russland", ru: "Россия" } },
  { code: "IR", flag: "🇮🇷", name: { tr: "İran", en: "Iran", fa: "ایران", ar: "إيران", de: "Iran", ru: "Иран" } },
  { code: "DE", flag: "🇩🇪", name: { tr: "Almanya", en: "Germany", fa: "آلمان", ar: "ألمانيا", de: "Deutschland", ru: "Германия" } },
  { code: "AE", flag: "🇦🇪", name: { tr: "BAE", en: "UAE", fa: "امارات", ar: "الإمارات", de: "VAE", ru: "ОАЭ" } },
  { code: "SA", flag: "🇸🇦", name: { tr: "Suudi Arabistan", en: "Saudi Arabia", fa: "عربستان سعودی", ar: "المملكة العربية السعودية", de: "Saudi-Arabien", ru: "Саудовская Аравия" } },
  { code: "GB", flag: "🇬🇧", name: { tr: "İngiltere", en: "UK", fa: "انگلیس", ar: "بريطانيا", de: "UK", ru: "Великобритания" } },
  { code: "FR", flag: "🇫🇷", name: { tr: "Fransa", en: "France", fa: "فرانسه", ar: "فرنسا", de: "Frankreich", ru: "Франция" } },
  { code: "CA", flag: "🇨🇦", name: { tr: "Kanada", en: "Canada", fa: "کانادا", ar: "كندا", de: "Kanada", ru: "Канада" } },
  { code: "NL", flag: "🇳🇱", name: { tr: "Hollanda", en: "Netherlands", fa: "هلند", ar: "هولندا", de: "Niederlande", ru: "Нидерланды" } },
  { code: "SE", flag: "🇸🇪", name: { tr: "İsveç", en: "Sweden", fa: "سوئد", ar: "السويد", de: "Schweden", ru: "Швеция" } },
  { code: "IQ", flag: "🇮🇶", name: { tr: "Irak", en: "Iraq", fa: "عراق", ar: "العراق", de: "Irak", ru: "Ирак" } },
  { code: "ES", flag: "🇪🇸", name: { tr: "İspanya", en: "Spain", fa: "اسپانیا", ar: "إسبانيا", de: "Spanien", ru: "Испания" } },
  { code: "JP", flag: "🇯🇵", name: { tr: "Japonya", en: "Japan", fa: "ژاپن", ar: "اليابان", de: "Japan", ru: "Япония" } },
  { code: "KR", flag: "🇰🇷", name: { tr: "Güney Kore", en: "South Korea", fa: "کره جنوبی", ar: "كوريا الجنوبية", de: "Südkorea", ru: "Южная Корея" } },
  { code: "BE", flag: "🇧🇪", name: { tr: "Belçika", en: "Belgium", fa: "بلژیک", ar: "بلجيكا", de: "Belgien", ru: "Бельгия" } },
  { code: "SY", flag: "🇸🇾", name: { tr: "Suriye", en: "Syria", fa: "سوریه", ar: "سوريا", de: "Syrien", ru: "Сирия" } },
  { code: "IN", flag: "🇮🇳", name: { tr: "Hindistan", en: "India", fa: "هند", ar: "الهند", de: "Indien", ru: "Индия" } },
  { code: "PK", flag: "🇵🇰", name: { tr: "Pakistan", en: "Pakistan", fa: "پاکستان", ar: "باكستان", de: "Pakistan", ru: "Пакистан" } },
  { code: "IT", flag: "🇮🇹", name: { tr: "İtalya", en: "Italy", fa: "ایتالیا", ar: "إيطاليا", de: "Italien", ru: "Италия" } },
  { code: "EG", flag: "🇪🇬", name: { tr: "Mısır", en: "Egypt", fa: "مصر", ar: "مصر", de: "Ägypten", ru: "Египет" } },
  { code: "AT", flag: "🇦🇹", name: { tr: "Avusturya", en: "Austria", fa: "اتریش", ar: "النمسا", de: "Österreich", ru: "Австрия" } },
  { code: "NO", flag: "🇳🇴", name: { tr: "Norveç", en: "Norway", fa: "نروژ", ar: "النرويج", de: "Norwegen", ru: "Норвегия" } },
  { code: "AZ", flag: "🇦🇿", name: { tr: "Azerbaycan", en: "Azerbaijan", fa: "آذربایجان", ar: "أذربيجان", de: "Aserbaidschan", ru: "Азербайджан" } },
  { code: "MY", flag: "🇲🇾", name: { tr: "Malezya", en: "Malaysia", fa: "مالزی", ar: "ماليزيا", de: "Malaysia", ru: "Малайзия" } },
  { code: "BR", flag: "🇧🇷", name: { tr: "Brezilya", en: "Brazil", fa: "برزیل", ar: "البرازيل", de: "Brasilien", ru: "Бразилия" } },
  { code: "AU", flag: "🇦🇺", name: { tr: "Avustralya", en: "Australia", fa: "استرالیا", ar: "أستراليا", de: "Australien", ru: "Австралия" } },
  { code: "QA", flag: "🇶🇦", name: { tr: "Katar", en: "Qatar", fa: "قطر", ar: "قطر", de: "Katar", ru: "Катар" } },
  { code: "AR", flag: "🇦🇷", name: { tr: "Arjantin", en: "Argentina", fa: "آرژانتین", ar: "الأرجنتين", de: "Argentinien", ru: "Аргентина" } },
  { code: "CL", flag: "🇨🇱", name: { tr: "Şili", en: "Chile", fa: "شیلی", ar: "شيلي", de: "Chile", ru: "Чили" } },
  { code: "CO", flag: "🇨🇴", name: { tr: "Kolombiya", en: "Colombia", fa: "کلمبیا", ar: "كولومبيا", de: "Kolumbien", ru: "Колумбия" } },
  { code: "HU", flag: "🇭🇺", name: { tr: "Macaristan", en: "Hungary", fa: "مجارستان", ar: "المجر", de: "Ungarn", ru: "Венгрия" } },
  // AF is here so that fa's second language-priority entry actually resolves. It was
  // listed in langPriorityCountries from the start but never present in this array,
  // so `.filter(c => c !== undefined)` dropped it silently and Persian readers only
  // ever got IR promoted.
  { code: "AF", flag: "🇦🇫", name: { tr: "Afganistan", en: "Afghanistan", fa: "افغانستان", ar: "أفغانستان", de: "Afghanistan", ru: "Афганистан" } },
];

const allCountries = [
  {code:'AF',flag:'🇦🇫',name:'Afganistan'},
  {code:'AL',flag:'🇦🇱',name:'Arnavutluk'},
  {code:'DZ',flag:'🇩🇿',name:'Cezayir'},
  {code:'AD',flag:'🇦🇩',name:'Andorra'},
  {code:'AO',flag:'🇦🇴',name:'Angola'},
  {code:'AG',flag:'🇦🇬',name:'Antigua ve Barbuda'},
  {code:'AR',flag:'🇦🇷',name:'Arjantin'},
  {code:'AM',flag:'🇦🇲',name:'Ermenistan'},
  {code:'AU',flag:'🇦🇺',name:'Avustralya'},
  {code:'AT',flag:'🇦🇹',name:'Avusturya'},
  {code:'AZ',flag:'🇦🇿',name:'Azerbaycan'},
  {code:'BS',flag:'🇧🇸',name:'Bahamalar'},
  {code:'BH',flag:'🇧🇭',name:'Bahreyn'},
  {code:'BD',flag:'🇧🇩',name:'Bangladeş'},
  {code:'BB',flag:'🇧🇧',name:'Barbados'},
  {code:'BY',flag:'🇧🇾',name:'Belarus'},
  {code:'BE',flag:'🇧🇪',name:'Belçika'},
  {code:'BZ',flag:'🇧🇿',name:'Belize'},
  {code:'BJ',flag:'🇧🇯',name:'Benin'},
  {code:'BT',flag:'🇧🇹',name:'Bhutan'},
  {code:'BO',flag:'🇧🇴',name:'Bolivya'},
  {code:'BA',flag:'🇧🇦',name:'Bosna Hersek'},
  {code:'BW',flag:'🇧🇼',name:'Botsvana'},
  {code:'BR',flag:'🇧🇷',name:'Brezilya'},
  {code:'BN',flag:'🇧🇳',name:'Brunei'},
  {code:'BG',flag:'🇧🇬',name:'Bulgaristan'},
  {code:'BF',flag:'🇧🇫',name:'Burkina Faso'},
  {code:'BI',flag:'🇧🇮',name:'Burundi'},
  {code:'CV',flag:'🇨🇻',name:'Cabo Verde'},
  {code:'KH',flag:'🇰🇭',name:'Kamboçya'},
  {code:'CM',flag:'🇨🇲',name:'Kamerun'},
  {code:'CA',flag:'🇨🇦',name:'Kanada'},
  {code:'CF',flag:'🇨🇫',name:'Orta Afrika Cumhuriyeti'},
  {code:'TD',flag:'🇹🇩',name:'Çad'},
  {code:'CL',flag:'🇨🇱',name:'Şili'},
  {code:'CN',flag:'🇨🇳',name:'Çin'},
  {code:'CO',flag:'🇨🇴',name:'Kolombiya'},
  {code:'KM',flag:'🇰🇲',name:'Komorlar'},
  {code:'CG',flag:'🇨🇬',name:'Kongo'},
  {code:'CR',flag:'🇨🇷',name:'Kosta Rika'},
  {code:'HR',flag:'🇭🇷',name:'Hırvatistan'},
  {code:'CU',flag:'🇨🇺',name:'Küba'},
  {code:'CY',flag:'🇨🇾',name:'Kıbrıs'},
  {code:'CZ',flag:'🇨🇿',name:'Çekya'},
  {code:'DK',flag:'🇩🇰',name:'Danimarka'},
  {code:'DJ',flag:'🇩🇯',name:'Cibuti'},
  {code:'DM',flag:'🇩🇲',name:'Dominika'},
  {code:'DO',flag:'🇩🇴',name:'Dominik Cumhuriyeti'},
  {code:'EC',flag:'🇪🇨',name:'Ekvador'},
  {code:'EG',flag:'🇪🇬',name:'Mısır'},
  {code:'SV',flag:'🇸🇻',name:'El Salvador'},
  {code:'GQ',flag:'🇬🇶',name:'Ekvator Ginesi'},
  {code:'ER',flag:'🇪🇷',name:'Eritre'},
  {code:'EE',flag:'🇪🇪',name:'Estonya'},
  {code:'SZ',flag:'🇸🇿',name:'Esvatini'},
  {code:'ET',flag:'🇪🇹',name:'Etiyopya'},
  {code:'FJ',flag:'🇫🇯',name:'Fiji'},
  {code:'FI',flag:'🇫🇮',name:'Finlandiya'},
  {code:'FR',flag:'🇫🇷',name:'Fransa'},
  {code:'GA',flag:'🇬🇦',name:'Gabon'},
  {code:'GM',flag:'🇬🇲',name:'Gambiya'},
  {code:'GE',flag:'🇬🇪',name:'Gürcistan'},
  {code:'DE',flag:'🇩🇪',name:'Almanya'},
  {code:'GH',flag:'🇬🇭',name:'Gana'},
  {code:'GR',flag:'🇬🇷',name:'Yunanistan'},
  {code:'GD',flag:'🇬🇩',name:'Grenada'},
  {code:'GT',flag:'🇬🇹',name:'Guatemala'},
  {code:'GN',flag:'🇬🇳',name:'Gine'},
  {code:'GW',flag:'🇬🇼',name:'Gine-Bissau'},
  {code:'GY',flag:'🇬🇾',name:'Guyana'},
  {code:'HT',flag:'🇭🇹',name:'Haiti'},
  {code:'HN',flag:'🇭🇳',name:'Honduras'},
  {code:'HU',flag:'🇭🇺',name:'Macaristan'},
  {code:'IS',flag:'🇮🇸',name:'İzlanda'},
  {code:'IN',flag:'🇮🇳',name:'Hindistan'},
  {code:'ID',flag:'🇮🇩',name:'Endonezya'},
  {code:'IR',flag:'🇮🇷',name:'İran'},
  {code:'IQ',flag:'🇮🇶',name:'Irak'},
  {code:'IE',flag:'🇮🇪',name:'İrlanda'},
  {code:'IL',flag:'🇮🇱',name:'İsrail'},
  {code:'IT',flag:'🇮🇹',name:'İtalya'},
  {code:'JM',flag:'🇯🇲',name:'Jamaika'},
  {code:'JP',flag:'🇯🇵',name:'Japonya'},
  {code:'JO',flag:'🇯🇴',name:'Ürdün'},
  {code:'KZ',flag:'🇰🇿',name:'Kazakistan'},
  {code:'KE',flag:'🇰🇪',name:'Kenya'},
  {code:'KI',flag:'🇰🇮',name:'Kiribati'},
  {code:'KW',flag:'🇰🇼',name:'Kuveyt'},
  {code:'KG',flag:'🇰🇬',name:'Kırgızistan'},
  {code:'LA',flag:'🇱🇦',name:'Laos'},
  {code:'LV',flag:'🇱🇻',name:'Letonya'},
  {code:'LB',flag:'🇱🇧',name:'Lübnan'},
  {code:'LS',flag:'🇱🇸',name:'Lesotho'},
  {code:'LR',flag:'🇱🇷',name:'Liberya'},
  {code:'LY',flag:'🇱🇾',name:'Libya'},
  {code:'LI',flag:'🇱🇮',name:'Lihtenştayn'},
  {code:'LT',flag:'🇱🇹',name:'Litvanya'},
  {code:'LU',flag:'🇱🇺',name:'Lüksemburg'},
  {code:'MG',flag:'🇲🇬',name:'Madagaskar'},
  {code:'MW',flag:'🇲🇼',name:'Malavi'},
  {code:'MY',flag:'🇲🇾',name:'Malezya'},
  {code:'MV',flag:'🇲🇻',name:'Maldivler'},
  {code:'ML',flag:'🇲🇱',name:'Mali'},
  {code:'MT',flag:'🇲🇹',name:'Malta'},
  {code:'MH',flag:'🇲🇭',name:'Marshall Adaları'},
  {code:'MR',flag:'🇲🇷',name:'Moritanya'},
  {code:'MU',flag:'🇲🇺',name:'Mauritius'},
  {code:'MX',flag:'🇲🇽',name:'Meksika'},
  {code:'FM',flag:'🇫🇲',name:'Mikronezya'},
  {code:'MD',flag:'🇲🇩',name:'Moldova'},
  {code:'MC',flag:'🇲🇨',name:'Monako'},
  {code:'MN',flag:'🇲🇳',name:'Moğolistan'},
  {code:'ME',flag:'🇲🇪',name:'Karadağ'},
  {code:'MA',flag:'🇲🇦',name:'Fas'},
  {code:'MZ',flag:'🇲🇿',name:'Mozambik'},
  {code:'MM',flag:'🇲🇲',name:'Myanmar'},
  {code:'NA',flag:'🇳🇦',name:'Namibya'},
  {code:'NR',flag:'🇳🇷',name:'Nauru'},
  {code:'NP',flag:'🇳🇵',name:'Nepal'},
  {code:'NL',flag:'🇳🇱',name:'Hollanda'},
  {code:'NZ',flag:'🇳🇿',name:'Yeni Zelanda'},
  {code:'NI',flag:'🇳🇮',name:'Nikaragua'},
  {code:'NE',flag:'🇳🇪',name:'Nijer'},
  {code:'NG',flag:'🇳🇬',name:'Nijerya'},
  {code:'NO',flag:'🇳🇴',name:'Norveç'},
  {code:'OM',flag:'🇴🇲',name:'Umman'},
  {code:'PK',flag:'🇵🇰',name:'Pakistan'},
  {code:'PW',flag:'🇵🇼',name:'Palau'},
  {code:'PA',flag:'🇵🇦',name:'Panama'},
  {code:'PG',flag:'🇵🇬',name:'Papua Yeni Gine'},
  {code:'PY',flag:'🇵🇾',name:'Paraguay'},
  {code:'PE',flag:'🇵🇪',name:'Peru'},
  {code:'PH',flag:'🇵🇭',name:'Filipinler'},
  {code:'PL',flag:'🇵🇱',name:'Polonya'},
  {code:'PT',flag:'🇵🇹',name:'Portekiz'},
  {code:'QA',flag:'🇶🇦',name:'Katar'},
  {code:'RO',flag:'🇷🇴',name:'Romanya'},
  {code:'RU',flag:'🇷🇺',name:'Rusya'},
  {code:'RW',flag:'🇷🇼',name:'Ruanda'},
  {code:'KN',flag:'🇰🇳',name:'Saint Kitts ve Nevis'},
  {code:'LC',flag:'🇱🇨',name:'Saint Lucia'},
  {code:'VC',flag:'🇻🇨',name:'Saint Vincent'},
  {code:'WS',flag:'🇼🇸',name:'Samoa'},
  {code:'SM',flag:'🇸🇲',name:'San Marino'},
  {code:'ST',flag:'🇸🇹',name:'Sao Tome ve Principe'},
  {code:'SA',flag:'🇸🇦',name:'Suudi Arabistan'},
  {code:'SN',flag:'🇸🇳',name:'Senegal'},
  {code:'RS',flag:'🇷🇸',name:'Sırbistan'},
  {code:'SC',flag:'🇸🇨',name:'Seyşeller'},
  {code:'SL',flag:'🇸🇱',name:'Sierra Leone'},
  {code:'SG',flag:'🇸🇬',name:'Singapur'},
  {code:'SK',flag:'🇸🇰',name:'Slovakya'},
  {code:'SI',flag:'🇸🇮',name:'Slovenya'},
  {code:'SB',flag:'🇸🇧',name:'Solomon Adaları'},
  {code:'SO',flag:'🇸🇴',name:'Somali'},
  {code:'ZA',flag:'🇿🇦',name:'Güney Afrika'},
  {code:'KR',flag:'🇰🇷',name:'Güney Kore'},
  {code:'SS',flag:'🇸🇸',name:'Güney Sudan'},
  {code:'ES',flag:'🇪🇸',name:'İspanya'},
  {code:'LK',flag:'🇱🇰',name:'Sri Lanka'},
  {code:'SD',flag:'🇸🇩',name:'Sudan'},
  {code:'SR',flag:'🇸🇷',name:'Surinam'},
  {code:'SE',flag:'🇸🇪',name:'İsveç'},
  {code:'CH',flag:'🇨🇭',name:'İsviçre'},
  {code:'SY',flag:'🇸🇾',name:'Suriye'},
  {code:'TW',flag:'🇹🇼',name:'Tayvan'},
  {code:'TJ',flag:'🇹🇯',name:'Tacikistan'},
  {code:'TZ',flag:'🇹🇿',name:'Tanzanya'},
  {code:'TH',flag:'🇹🇭',name:'Tayland'},
  {code:'TL',flag:'🇹🇱',name:'Doğu Timor'},
  {code:'TG',flag:'🇹🇬',name:'Togo'},
  {code:'TO',flag:'🇹🇴',name:'Tonga'},
  {code:'TT',flag:'🇹🇹',name:'Trinidad ve Tobago'},
  {code:'TN',flag:'🇹🇳',name:'Tunus'},
  {code:'TR',flag:'🇹🇷',name:'Türkiye'},
  {code:'TM',flag:'🇹🇲',name:'Türkmenistan'},
  {code:'TV',flag:'🇹🇻',name:'Tuvalu'},
  {code:'UG',flag:'🇺🇬',name:'Uganda'},
  {code:'UA',flag:'🇺🇦',name:'Ukrayna'},
  {code:'AE',flag:'🇦🇪',name:'BAE'},
  {code:'GB',flag:'🇬🇧',name:'İngiltere'},
  {code:'US',flag:'🇺🇸',name:'Amerika'},
  {code:'UY',flag:'🇺🇾',name:'Uruguay'},
  {code:'UZ',flag:'🇺🇿',name:'Özbekistan'},
  {code:'VU',flag:'🇻🇺',name:'Vanuatu'},
  {code:'VE',flag:'🇻🇪',name:'Venezuela'},
  {code:'VN',flag:'🇻🇳',name:'Vietnam'},
  {code:'YE',flag:'🇾🇪',name:'Yemen'},
  {code:'ZM',flag:'🇿🇲',name:'Zambiya'},
  {code:'ZW',flag:'🇿🇼',name:'Zimbabve'},
];

// Section title, cased per language rather than by one blanket rule: TR and EN take
// real title case (TR with the dotted İ — "İlanlar", never "Ilanlar"), DE keeps
// German orthography where only the nouns capitalise ("Die neuesten Anzeigen" —
// title-casing the adjective would be wrong), RU takes sentence case, and FA/AR have
// no letter case at all so they are unchanged.
const heroText: Record<Lang, { l1: string; l2: string; sub: string }> = {
  tr: { l1: "Dünyanın her yerinden", l2: "En Son İlanlar", sub: "İhtiyacın olan alanı kolayca bul." },
  en: { l1: "From all around the world", l2: "The Latest Listings", sub: "Easily find the space you need." },
  fa: { l1: "از سراسر جهان", l2: "جدیدترین آگهی‌ها", sub: "فضای موردنیازت را به‌راحتی پیدا کن." },
  ar: { l1: "من جميع أنحاء العالم", l2: "أحدث الإعلانات", sub: "اعثر بسهولة على المساحة التي تحتاجها." },
  de: { l1: "Aus der ganzen Welt", l2: "Die neuesten Anzeigen", sub: "Finde ganz einfach den Raum, den du brauchst." },
  ru: { l1: "Со всего мира", l2: "Самые свежие объявления", sub: "Легко найдите нужное пространство." },
};

// Chip order: the main markets in a fixed business order, then everything else
// alphabetically in the reader's own language (localeCompare with the locale, so
// Turkish sorts Ç/Ş/İ correctly and Russian sorts Cyrillic correctly).
const MAIN_MARKET_ORDER = ["TR", "IR", "DE", "RU", "US", "AE", "SA", "GB", "FR", "CA", "NL"] as const;

// The reader's own market comes first. This map predates the main-market order
// (d35fcdb5b, softened from auto-selection to reorder-only in 0f06470d3) and was
// dropped in 62a7c8667 when the fixed order landed; the two are merged rather than
// traded off — language priority heads the row, the remaining main markets follow.
const langPriorityCountries: Record<string, string[]> = {
  en: ['US', 'GB', 'CA'],
  fa: ['IR', 'AF'],
  ru: ['RU'],
  de: ['DE', 'NO'],
  ar: ['AE', 'SA', 'QA', 'EG'],
  tr: ['TR'],
};

const sectionUI: Record<Lang, {
  count: string; emptyTitle: string; emptyCta: string; lookingForHome: string; lookingForSpace: string; perMonth: string; noSmoking: string; showMore: string; seeAll: string; showLess: string;
}> = {
  tr: { count: "ilan", emptyTitle: "Bu ülkede henüz ilan yok", emptyCta: "İlk ilanı sen ver", lookingForHome: "Ev/oda arıyor", lookingForSpace: "Alan arıyor", perMonth: "/ay", noSmoking: "Sigara İçilmez", showMore: "Daha fazla göster", seeAll: "Tüm ilanlar", showLess: "Daha az göster" },
  en: { count: "listings", emptyTitle: "No listings in this country yet", emptyCta: "Post the first listing", lookingForHome: "Looking for a room", lookingForSpace: "Looking for a space", perMonth: "/mo", noSmoking: "No smoking", showMore: "Show more", seeAll: "All listings", showLess: "Show less" },
  fa: { count: "آگهی", emptyTitle: "هنوز آگهی‌ای در این کشور نیست", emptyCta: "اولین آگهی را ثبت کن", lookingForHome: "به دنبال اتاق", lookingForSpace: "به دنبال فضا", perMonth: "/ماه", noSmoking: "سیگار ممنوع", showMore: "نمایش بیشتر", seeAll: "همه آگهی‌ها", showLess: "نمایش کمتر" },
  ar: { count: "إعلان", emptyTitle: "لا توجد إعلانات في هذا البلد بعد", emptyCta: "انشر أول إعلان", lookingForHome: "يبحث عن غرفة", lookingForSpace: "يبحث عن مساحة", perMonth: "/شهر", noSmoking: "ممنوع التدخين", showMore: "عرض المزيد", seeAll: "كل الإعلانات", showLess: "عرض أقل" },
  de: { count: "Inserate", emptyTitle: "Noch keine Inserate in diesem Land", emptyCta: "Erstes Inserat aufgeben", lookingForHome: "Sucht ein Zimmer", lookingForSpace: "Sucht eine Fläche", perMonth: "/Mon.", noSmoking: "Nichtraucher", showMore: "Mehr anzeigen", seeAll: "Alle Inserate", showLess: "Weniger anzeigen" },
  ru: { count: "объявлений", emptyTitle: "В этой стране пока нет объявлений", emptyCta: "Разместить первое объявление", lookingForHome: "Ищет комнату", lookingForSpace: "Ищет помещение", perMonth: "/мес", noSmoking: "Не курить", showMore: "Показать ещё", seeAll: "Все объявления", showLess: "Свернуть" },
};

const categoryTabs: { key: "all" | "residential" | "commercial"; icon: string; label: Record<Lang, string> }[] = [
  { key: "all", icon: "🌐", label: { tr: "Tümü", en: "All", fa: "همه", ar: "الكل", de: "Alle", ru: "Все" } },
  { key: "residential", icon: "🏠", label: { tr: "Konut", en: "Residential", fa: "مسکونی", ar: "سكني", de: "Wohnen", ru: "Жильё" } },
  { key: "commercial", icon: "🏢", label: { tr: "Ticari", en: "Commercial", fa: "تجاری", ar: "تجاري", de: "Gewerbe", ru: "Коммерческий" } },
];

const cardLabels: Record<Lang, {
  furnished: string; unfurnished: string; residents: string; rooms: string;
  maxBudget: string; age: string; working: string; student: string; privateRoom: string;
}> = {
  tr: { furnished:"Eşyalı",      unfurnished:"Eşyasız",      residents:"kişi var",     rooms:"oda",   maxBudget:"Max", age:"yaş",  working:"Çalışıyor", student:"Öğrenci",   privateRoom:"Özel oda şart" },
  en: { furnished:"Furnished",   unfurnished:"Unfurnished",  residents:"residents",    rooms:"rooms", maxBudget:"Max", age:"yrs",  working:"Working",   student:"Student",   privateRoom:"Private room required" },
  fa: { furnished:"مبله",        unfurnished:"بدون مبل",     residents:"نفر ساکن",     rooms:"اتاق",  maxBudget:"حداکثر", age:"سال", working:"شاغل",  student:"دانشجو",    privateRoom:"اتاق خصوصی لازم" },
  ar: { furnished:"مفروش",       unfurnished:"غير مفروش",    residents:"ساكن",         rooms:"غرف",   maxBudget:"الحد الأقصى", age:"سنة", working:"موظف", student:"طالب", privateRoom:"غرفة خاصة مطلوبة" },
  de: { furnished:"Möbliert",    unfurnished:"Unmöbliert",   residents:"Bewohner",     rooms:"Zi.",   maxBudget:"Max", age:"J.",   working:"Berufstätig", student:"Student/in", privateRoom:"Eigenes Zimmer nötig" },
  ru: { furnished:"Меблированная", unfurnished:"Без мебели", residents:"жильцов",      rooms:"комн.", maxBudget:"Макс", age:"лет", working:"Работающий", student:"Студент",  privateRoom:"Нужна отд. комната" },
};

// Localized country name for the overlay's "city, country" line. Prefers the stored
// country_code, falls back to the free-text `country` column, then to the code map
// derived from the city — mirroring what filterByCountry already trusts.
function countryLabel(listing: { country_code?: string | null; country?: string | null; city?: string | null; district?: string | null }, lang: Lang): string | null {
  const code = listing.country_code?.toUpperCase()
    ?? (listing.country ? countryNameToCode[listing.country.toLowerCase()] : undefined)
    ?? detectCountry(listing.city || "", listing.district || "").country
    ?? undefined;
  if (!code) return listing.country ?? null;
  const entry = countries.find((c) => c.code === code);
  return entry ? (entry.name[lang] ?? entry.name.tr) : (listing.country ?? code);
}

const cityFilterUI: Record<Lang, { label: string; clear: string; backToAll: string }> = {
  tr: { label: "ilanları gösteriliyor", clear: "✕ Temizle",    backToAll: "← Tüm İlanlara Dön" },
  en: { label: "listings shown",        clear: "✕ Clear",       backToAll: "← Back to All Listings" },
  fa: { label: "آگهی‌ها نمایش داده می‌شوند", clear: "✕ پاک کردن", backToAll: "← بازگشت به همه آگهی‌ها" },
  ar: { label: "إعلانات معروضة",       clear: "✕ مسح",         backToAll: "← العودة إلى جميع الإعلانات" },
  de: { label: "Inserate angezeigt",    clear: "✕ Löschen",     backToAll: "← Zurück zu allen Inseraten" },
  ru: { label: "объявлений показано",   clear: "✕ Очистить",    backToAll: "← Вернуться ко всем объявлениям" },
};

const fixedCodes = new Set(countries.map((c) => c.code));

const countryNameToCode: Record<string, string> = {};
for (const c of allCountries) {
  countryNameToCode[c.name.toLowerCase()] = c.code;
}
for (const c of countries) {
  if (c.code !== "all") {
    for (const name of Object.values(c.name)) {
      if (!countryNameToCode[name.toLowerCase()]) {
        countryNameToCode[name.toLowerCase()] = c.code;
      }
    }
  }
}

function filterByCountry(listings: any[], countryCode: string) {
  if (countryCode === "all") return listings;
  return listings.filter((l) => {
    if (l.country_code && l.country_code.toUpperCase() === countryCode.toUpperCase()) return true;
    if (l.country && countryNameToCode[l.country.toLowerCase()] === countryCode) return true;
    const normalizedLocation = normalizeTR((l.city || "") + " " + (l.district || ""));
    const cities = cityMap[countryCode] || [];
    return cities.some((c) => normalizedLocation.includes(normalizeTR(c)));
  });
}

const langPriorityCountry: Record<string, string> = {
  tr: 'TR',
  ru: 'RU',
  fa: 'IR',
  de: 'DE',
  ar: 'EG',
  en: 'US',
};

// (The old per-language priority map lived here. Chip order is now one fixed
// business order for every locale — MAIN_MARKET_ORDER — with the tail sorted
// alphabetically in the reader's language.)

interface LatestListingsProps {
  lang: string;
  filterCity?: string | null;
  onClearFilter?: () => void;
}

const listingTypeTrans: Record<string, Record<string, string>> = {
  has_place: { tr: "Ev Sahibi", en: "Host", fa: "صاحب‌خانه", ar: "صاحب المنزل", de: "Vermieter", ru: "Арендодатель" },
  needs_place: { tr: "Kiracı", en: "Tenant", fa: "مستأجر", ar: "مستأجر", de: "Mieter", ru: "Арендатор" }
}

// Reused by both the category toggle and the country chip below — same sessionStorage
// pattern as the scroll-restoration keys (sefira-scroll / homeScrollPosition), so a
// back-navigation from a listing lands on the exact filtered view the user left.
function readPersistedFilter<T extends string>(key: string, fallback: T, valid?: readonly T[]): T {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved && (!valid || (valid as readonly string[]).includes(saved))) return saved as T;
  } catch {
    // sessionStorage unavailable (privacy mode etc.) — fall back silently
  }
  return fallback;
}

// One page of the "En Son İlanlar" grid. 12 fills four rows on a phone and four
// rows of three on desktop, so a page boundary never lands mid-row.
const PAGE_SIZE = 12;

// Shared by both states of the control below so the swap is a label change and
// nothing else. Same orange token as the empty-state CTA in this section.
const showMorePill =
  "inline-flex items-center justify-center cursor-pointer rounded-full border-2 border-orange-500 px-8 py-3 text-sm font-bold text-orange-500 transition-all duration-200 hover:bg-orange-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

// The secondary half of the pager: no border, so it reads as the lesser of the two,
// but `h-12` pins it to the pill's 48px so the row's height never depends on which
// pair of labels is showing.
const showLessGhost =
  "inline-flex h-12 items-center justify-center cursor-pointer rounded-full px-5 text-sm font-bold text-orange-500 transition-all duration-200 hover:bg-orange-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";

// The navbar is `position: fixed`, so it covers the top of the viewport and a section
// scrolled flush to y=0 would have its heading tucked underneath. Measure whatever bar
// is actually rendered — its height is a layout detail of another component.
function stickyHeaderHeight(): number {
  for (const el of Array.from(document.querySelectorAll("nav, header"))) {
    if (getComputedStyle(el).position !== "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.top <= 0 && r.bottom > 0) return r.height;
  }
  return 0;
}

// useLayoutEffect warns when it is called during SSR. The collapse scroll only ever
// happens on the client, where it has to run before paint so the reader never sees
// the collapsed grid at the old scroll offset.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function LatestListings({ lang, filterCity, onClearFilter }: LatestListingsProps) {
  const router = useRouter();
  const [allListings, setAllListings] = useState<any[]>([]);
  const [sonIlanlarCategory, setSonIlanlarCategory] = useState<'all' | 'residential' | 'commercial'>(
    () => readPersistedFilter('sefira-listings-category', 'all', ['all', 'residential', 'commercial'] as const)
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(
    () => readPersistedFilter('sefira-listings-country', 'all')
  );
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sectionRef = useRef<HTMLElement | null>(null);
  /* Bumped by the collapse handler so the scroll below runs after the shorter grid
     has been committed and can be measured. Nothing sets state in the effect itself. */
  const [collapseTick, setCollapseTick] = useState(0);

  useEffect(() => {
    try { sessionStorage.setItem('sefira-listings-category', sonIlanlarCategory); } catch { /* ignore */ }
  }, [sonIlanlarCategory]);

  useEffect(() => {
    try { sessionStorage.setItem('sefira-listings-country', selectedCountry); } catch { /* ignore */ }
  }, [selectedCountry]);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("listings")
        .select("id, type, city, district, neighborhood, rent, currency, photos, house_type, rooms, smoking, furnished, elevator, current_residents, user_id, country_code, country, max_budget, seeker_age, seeker_gender, occupation, private_room_required, about_text, listing_category, has_place, needs_place")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !data || data.length === 0) {
        setAllListings([]);
        setLoading(false);
        return;
      }

      const userIds = data.map((l: any) => l.user_id).filter(Boolean);
      const { data: profiles } = await supabaseClient
        .from("profiles_public")
        .select("user_id, display_name, avatar_url, gender")
        .in("user_id", userIds);

      setAllListings(
        data.map((l: any) => ({
          ...l,
          profile: profiles?.find((p: any) => p.user_id === l.user_id) || null,
        }))
      );
      setLoading(false);
    }
    fetchListings();
  }, []);

  useEffect(() => {
    if (filterCity) setSonIlanlarCategory("all");
  }, [filterCity]);

  const filteredListings = useMemo(() => {
    let base = filterCity
      ? allListings
      : allListings.filter((l) => {
          const category = l.listing_category ?? null;
          if (sonIlanlarCategory === "all") return true;
          if (sonIlanlarCategory === "commercial") return category === "commercial";
          return category === "residential" || category == null;
        });
    if (filterCity) {
      base = base.filter(
        (l) =>
          cityMatches(l.city || "", filterCity) ||
          cityMatches(l.district || "", filterCity)
      );
    }
    if (selectedCountry !== 'all') {
      base = filterByCountry(base, selectedCountry);
    }
    return base;
  }, [allListings, sonIlanlarCategory, filterCity, selectedCountry]);

  /* A new filter is a new list, so paging starts over: switching Konut/Ticari or
     picking another country chip drops the reader back to the first page. Reset
     during render rather than in an effect — React re-renders before painting, so
     the reader never sees the stale page, and no cascading effect render is queued. */
  const filterKey = `${sonIlanlarCategory}|${selectedCountry}|${filterCity ?? ""}`;
  const [pagedFilterKey, setPagedFilterKey] = useState(filterKey);
  if (pagedFilterKey !== filterKey) {
    setPagedFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const listings = useMemo(
    () => filteredListings.slice(0, visibleCount),
    [filteredListings, visibleCount]
  );
  const hasMore = filteredListings.length > listings.length;

  /* Where "see all listings" goes once the locally-held page runs out. The param
     names are /search's own (app/search/page.tsx reads q/category/commercial_type/
     country/city/district/neighborhood); we send the three this section can express.
     A city filter overrides the category tab here exactly as it does in
     `filteredListings` above, so the link reproduces what is on screen. */
  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    if (!filterCity && sonIlanlarCategory !== "all") params.set("category", sonIlanlarCategory);
    if (selectedCountry !== "all") params.set("country", selectedCountry);
    if (filterCity) params.set("city", filterCity);
    const qs = params.toString();
    // No filter active means "everything", which /search needs told explicitly —
    // param-less /search is its own prompt state and must stay that way.
    return qs ? `/search?${qs}` : "/search?browse=1";
  }, [sonIlanlarCategory, selectedCountry, filterCity]);

  useIsomorphicLayoutEffect(() => {
    if (collapseTick === 0) return; // nothing to restore on first mount
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight();
    /* Explicitly instant: the stylesheet sets `scroll-behavior: smooth` globally, and
       animating a collapse the reader just asked for only delays the result. */
    window.scrollTo({ top, behavior: "instant" });
  }, [collapseTick]);

  const lbl = cardLabels[lang as Lang] ?? cardLabels.tr;
  const ui = sectionUI[lang as Lang] ?? sectionUI.tr;

  // "All" first, then the main markets in their fixed business order, then the
  // remainder A→Z in the reader's own language.
  // "All", then the reader's language-priority countries, then whatever is left of
  // the main-market order, then the remainder A→Z in the reader's own language.
  // `seen` is what keeps the three tiers from repeating an entry.
  const orderedCountries = useMemo(() => {
    const byCode = (code: string) => countries.find((c) => c.code === code);
    const seen = new Set<string>(["all"]);
    const take = (codes: readonly string[]) =>
      codes
        .filter((code) => !seen.has(code))
        .map((code) => {
          const entry = byCode(code);
          if (entry) seen.add(code);
          return entry;
        })
        .filter((c): c is typeof countries[number] => c !== undefined);

    const allEntry = byCode("all")!;
    const priorityEntries = take(langPriorityCountries[lang] ?? []);
    const mainEntries = take(MAIN_MARKET_ORDER);
    const restEntries = countries
      .filter((c) => !seen.has(c.code))
      .sort((a, b) => {
        const an = a.name[lang as Lang] ?? a.name.tr;
        const bn = b.name[lang as Lang] ?? b.name.tr;
        return an.localeCompare(bn, lang);
      });
    return [allEntry, ...priorityEntries, ...mainEntries, ...restEntries];
  }, [lang]);

  const isRTL = lang === "ar" || lang === "fa";
  const hero = heroText[lang as Lang] ?? heroText.tr;
  // The single scroll-reveal on this page section. `false` as the initial state opts
  // the header straight into its final position when the OS asks for reduced motion.
  const reduceMotion = useReducedMotion();

  // A segmented control means exactly one option always reads as selected. The
  // category model has three states and defaults to "all", so "all" gets its own
  // segment — previously it was an unrepresented state, which left both visible
  // segments looking inert on first paint. Filtering behaviour is unchanged: the
  // default is still "all", it is just visible now.
  const segmentedControl = (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-stone-200 bg-white p-0.5 self-start">
      {categoryTabs.map((tab) => {
        const isActive = sonIlanlarCategory === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => {
              setSonIlanlarCategory(tab.key);
              if (tab.key === "all") onClearFilter?.();
            }}
            // Sized to match the bigger headline rather than to fit the narrowest
            // locale: the row below scrolls, so RU's "Все / Жильё / Коммерческий" —
            // the widest of the six — no longer has to be designed around.
            className={`rounded-full px-3.5 py-2 text-sm sm:text-base font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${
              isActive ? "bg-orange-500 text-white" : "text-stone-600 hover:text-orange-500"
            }`}
          >
            {tab.label[lang as Lang] ?? tab.label.tr}
          </button>
        );
      })}
    </div>
  );

  const heroCopy = (
    <>
      <p className="text-base leading-tight text-stone-500">{hero.l1}</p>
      {/* No leading override: `bg-clip-text` paints the gradient only inside the
          element's own box, so a tighter line-height would cut it off the ascenders
          and descenders of the Persian and Arabic headlines. */}
      <p className="mt-1 text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
        {hero.l2}
      </p>
      <p className="mt-2 text-base leading-snug text-stone-500">{hero.sub}</p>
    </>
  );

  return (
    // No `mt-section`: this section's top boundary is owned by the full-bleed band
    // below, which sits flush against the smart-recs section's `border-b`. Every other
    // section boundary on the page still uses the token.
    <section className="mb-0" ref={sectionRef}>
      {/* ── Section header ─────────────────────────────────────────────────────
          A full-bleed band, not a floating card: the orange-50 runs edge to edge of
          the viewport so the corners are filled and the top/bottom are straight lines,
          while the content stays on the page's `px-5` gutter inside a `max-w-7xl` —
          only the background bleeds. Flush at the top, so the separator is the recs
          section's own full-width hairline; the band adds none of its own rather than
          doubling it up.
          A section title, not a caption: the type is sized to carry the band (text-4xl
          headline on mobile) and the artwork is back at full size beside it. No
          min-height — the copy block plus the control size the band and the art column
          stretches to match (`items-stretch`), so the height is content-driven in every
          locale and there is no slack for a dead zone.
          The band's own `dir` makes the logical properties inside resolve for FA/AR
          even if this component is ever mounted outside the RTL page shell. */}
      <div dir={isRTL ? "rtl" : "ltr"} className="bg-orange-50">
        {/* px-5 at every width, not sm:px-6 — this has to be the SAME gutter as the
            chips row and the grid below, or the band's copy sits 4px off them at sm+.
            The art is absolutely positioned against this box rather than sitting in a
            flex row beside the copy, and `inset-0` resolves against the padding box, so
            the artwork bleeds across the full gutter while the copy stays on it. */}
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          {/* The cityscape at its own proportions. `object-contain`, NOT `cover`: the
              art is a 1.74:1 landscape and the band is taller than it is wide per column
              — covering a narrow column blew the globe up to fill it and lost the
              cityscape entirely, which is what made the previous strip read as a crop
              rather than as artwork. Contained, the illustration is drawn whole at
              345x204 on a 390px viewport, roughly the scale the pre-plate design had.
              `object-[100%_100%]` pins it to the END edge and the BOTTOM, so the
              buildings sit on the band's bottom edge like a skyline instead of floating,
              and the art runs off the end of the screen.
              Nothing letterboxes visibly: scripts/crop-hero-art.mjs trims -v2 to the
              skyline's own bottom edge and flattens its empty areas to exactly the band
              colour, so the picture's box has no edge of its own — the corners the art
              does not reach are the same orange-50 as the ones it does. */}
          <Image
            src="/son-ilanlar-band-v2.webp"
            alt=""
            fill
            priority
            // `unoptimized`: the file is already 960px / 31KB, which is what this paints
            // at 2x on a phone. Running it through Next's q=75 pass smears the ink into
            // the flat background, which is enough to outline the picture box again.
            unoptimized
            className={`object-contain object-[100%_100%] ${isRTL ? "scale-x-[-1]" : ""}`}
          />
          {/* Below lg the copy overlaps the art's start half — that half is the small
              houses, the least load-bearing part of the illustration — so it fades to
              the band colour under the text and runs at full strength from the copy's
              edge outward. Not needed at lg, where the copy row reserves the art's lane
              instead (`lg:pe-*` below) and nothing overlaps.
              It fades to `orange-50/0`, not to `transparent`: `transparent` is
              rgba(0,0,0,0), so an sRGB ramp to it drags the midpoint toward grey and
              the artwork underneath comes out muddy rather than merely lighter. */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 lg:hidden ${
              isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"
            } from-orange-50 from-52% to-orange-50/0 to-96%`}
          />

          {/* At lg the copy and the control sit on ONE row with the control pushed to
              the end (`lg:ms-auto`, logical so FA/AR mirror). Stacked, a 1240px-wide
              band would leave most of its width empty; as a toolbar row it reads
              deliberate. `lg:pe-[380px]` is the art's lane — at lg the band is short
              enough that `contain` sizes the artwork off its height (1.74 × the band's
              ~198px, so ~344px wide), and the padding stops the control landing on top
              of it.
              `py-6` is the band's breathing room — with the corners gone it carries what
              the card's inset used to. */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative z-10 py-6 lg:flex lg:items-center lg:gap-8 lg:py-12 lg:pe-[380px]"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            {/* 82%, near the share the pre-plate design gave the copy. The measured
                constraint is RU: "самые свежие" is 273px at text-4xl, so anything under
                ~280px breaks that headline over three lines instead of two. At 82% the
                headline is one line in TR/FA/AR and a clean two in DE/EN/RU, and the
                copy still stops short of the globe. */}
            <div className="max-w-[82%] lg:max-w-none">{heroCopy}</div>
            {/* overflow-x-auto is a guard, not a layout: all six locales fit the control
                inside 82% at this size (RU is widest at 266px). If a translation ever
                grows it scrolls — the same affordance as the country chips below —
                instead of clipping. */}
            <div className="mt-4 flex max-w-[82%] overflow-x-auto scrollbar-hide lg:mt-0 lg:ms-auto lg:max-w-none lg:shrink-0 lg:overflow-visible">
              {segmentedControl}
            </div>
          </motion.div>
        </div>
      </div>

      {/* The `max-w-7xl` that used to sit on the section now lives here, because the
          band above has to escape it to reach the viewport edges. No `bg-white`: the
          chips and the grid sit on the page's stone-50, which is what the white,
          shadowed listing cards were always drawn for. */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-5 pb-6">

      {/* City filter badge */}
      {filterCity && (
        <>
          <div className="flex items-center gap-2 mb-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2">
            <span className="text-orange-700 text-sm font-medium">
              📍 {filterCity} {cityFilterUI[lang as Lang]?.label ?? cityFilterUI.tr.label}
            </span>
            <button
              onClick={onClearFilter}
              className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              {cityFilterUI[lang as Lang]?.clear ?? cityFilterUI.tr.clear}
            </button>
          </div>
          <button
            onClick={onClearFilter}
            className="w-full mb-4 border border-orange-400 text-orange-500 rounded-xl py-2 text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            {cityFilterUI[lang as Lang]?.backToAll ?? cityFilterUI.tr.backToAll}
          </button>
        </>
      )}

      {/* ── Country selector ──────────────────────────────────────────────────
          Touch: one horizontally scrolling, snapping row — a phone flicks through
          it and the row's own momentum is the affordance.
          Desktop (lg+): the row WRAPS instead. A mouse has no horizontal flick, and
          `scrollbar-hide` removes the only remaining cue, so a single overflowing
          row read as "clipped at Kanada, rest unreachable". Wrapping puts all 34
          chips on the rail where every one of them is clickable.
          `dir` is set explicitly so the scroller starts at the right in FA/AR even
          if this component is ever mounted outside the RTL page shell. */}
      <div className="mb-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="relative">
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2 lg:mx-0 lg:snap-none lg:flex-wrap lg:gap-2.5 lg:overflow-visible lg:px-0">
            {orderedCountries.map((country) => {
              const isActive = selectedCountry === country.code;
              return (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  aria-pressed={isActive}
                  className={`flex shrink-0 snap-start cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-500 hover:scale-[1.03]"
                  }`}
                >
                  {/* SVG, not the emoji: Windows has no flag glyph and renders the
                      regional-indicator pair as its two letters ("TR Türkiye"). */}
                  <CountryFlag code={country.code} width={20} />
                  <span>{country.name[lang as Lang] ?? country.name.tr}</span>
                </button>
              );
            })}
          </div>

        </div>

        {selectedCountry !== 'all' && (
          <p className="text-xs text-stone-400 mt-1">
            {listings.length} {ui.count}
          </p>
        )}
      </div>

      {loading ? (
        /* Skeletons mirror the real card — 4:3 image block, two text lines, a price
           line — so the grid does not reflow when the data lands. The third is
           `hidden sm:block`: two columns on a phone means a third pulsing card would
           start a lonely second row. */
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl bg-white shadow-md ${i === 2 ? "hidden lg:block" : ""}`}
            >
              <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-200" />
              <div className="p-4">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3.5 w-1/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        filterCity ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-4xl mb-3">🏙️</p>
            <p className="text-gray-500 font-medium">{filterCity} için henüz ilan yok</p>
            <button onClick={onClearFilter} className="mt-3 text-orange-500 text-sm underline">
              Tüm ilanları gör
            </button>
          </div>
        ) : (
          /* A dead end became an invitation: the country filter's empty result now
             offers the one action that fixes it. */
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-100">
              <PackageOpen className="h-7 w-7 text-orange-500" aria-hidden="true" />
            </span>
            <p className="mt-4 max-w-xs text-base font-semibold text-stone-700">
              {ui.emptyTitle}
            </p>
            <button
              onClick={() => router.push("/create-listing")}
              className="mt-5 cursor-pointer rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:bg-orange-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              {ui.emptyCta}
            </button>
          </div>
        )
      ) : (
        /* 2-up on phones, 3-up from lg. The fixed 3-up left ~110px-wide cards on a
           390px screen, which the new photo overlay could not be read in. */
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          {listings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => {
              sessionStorage.setItem("sefira-scroll", String(window.scrollY));
              sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
              router.push(`/listings/${listing.id}`);
            }}
              className="group rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow cursor-pointer"
            >
              {/* aspect-[4/3] at every width so a photo card, an avatar card and the
                  illustrated fallback are all exactly the same shape — the grid used to
                  ripple because `aspect-video` framed 4:3 photos differently from the
                  square-ish avatars. overflow-hidden + rounded-xl on the frame is what
                  clips the image's hover zoom; only the image scales. */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                {listing.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getThumbUrl(listing.photos[0])}
                    alt={listing.city}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : getListingSide(listing) === "needs_place" ? (
                  // Seeker: prefer the seeker's avatar filling the slot; fall back to
                  // the illustrated SeekerCardVisual only when there's no avatar (or it fails).
                  <AvatarImage
                    url={listing.profile?.avatar_url}
                    size="card"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    fallback={
                      <SeekerCardVisual
                        variant={listing.listing_category === "commercial" ? "commercial" : "residential"}
                        className="w-full h-full"
                      />
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                )}
                {(() => {
                  const side = getListingSide(listing);
                  if (!side) return null;
                  const isCommercial = listing.listing_category === "commercial";
                  const label = isCommercial
                    ? getCommercialBadgeLabel(side, lang as Lang)
                    : listingTypeTrans[side]?.[lang] || listingTypeTrans[side]?.["tr"];
                  return (
                    <span className={`absolute top-2 start-2 z-10 rounded-full px-2 py-1 text-[11px] font-semibold text-white ${getBadgeClass(side, isCommercial)}`}>
                      {label}
                    </span>
                  );
                })()}

                {/* ── Info overlay ───────────────────────────────────────────
                    Sits on the photo so the card leads with what/where/how much
                    before any of the detail rows below. The listings table has no
                    title column (nothing in any select across the app returns one),
                    so the headline is composed from the fields that do exist —
                    house_type/rooms for a place, the localized "looking for" line
                    for a seeker — and falls back to the city. `rent` is read as-is.
                    Logical inset (start/end) so FA/AR mirror. */}
                {(() => {
                  const side = getListingSide(listing);
                  const isSeeker = side === "needs_place";
                  const roomsPart = listing.rooms ? `${listing.rooms} ${lbl.rooms}` : null;
                  const title = isSeeker
                    ? (listing.listing_category === "commercial" ? ui.lookingForSpace : ui.lookingForHome)
                    : [listing.house_type, roomsPart].filter(Boolean).join(" · ") || listing.city;
                  const place = [listing.city, countryLabel(listing, lang as Lang)].filter(Boolean).join(", ");
                  const amount = isSeeker ? listing.max_budget : listing.rent;
                  return (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-3 pb-2.5 pt-8">
                      <p className="truncate text-sm font-semibold text-white drop-shadow-sm">{title}</p>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        {place && (
                          <span className="flex min-w-0 items-center gap-1 text-[11px] text-white/90">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{place}</span>
                          </span>
                        )}
                        {amount && listing.currency && (
                          <span className="shrink-0 text-xs font-bold text-white drop-shadow-sm">
                            {amount} {listing.currency}
                            <span className="font-medium text-white/80">{ui.perMonth}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4">
                {/* City */}
                <p className="font-bold text-sm text-gray-900">
                  {listing.type === "has_place"
                    ? listing.city
                    : `${listing.city}${listing.district ? ` / ${listing.district}` : ""}`}
                </p>
                {listing.type === "has_place" && (listing.neighborhood || listing.district) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {listing.neighborhood || listing.district}
                  </p>
                )}

                {/* Country flag + plate */}
                {(() => {
                  const countryInfo = detectCountry(listing.city, listing.district);
                  const code = listing.country_code;
                  const flagCode = code && /^[A-Za-z]{2}$/.test(code) ? code : countryInfo.country;
                  return (
                    <div className="flex items-center gap-2 mt-1 mb-2">
                      <CountryFlag code={flagCode} width={20} />
                      {countryInfo.plate && (
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden text-xs font-bold shadow-sm">
                          <div className="bg-blue-700 text-white px-1 py-0.5 flex flex-col items-center leading-tight">
                            <span className="text-[8px]">🇪🇺</span>
                            <span className="text-[7px]">TR</span>
                          </div>
                          <div className="bg-white text-gray-800 px-2 py-0.5 tracking-widest font-bold text-xs">
                            {countryInfo.plate}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {listing.type === "has_place" ? (
                  <>
                    {listing.rent && listing.currency && (
                      <p className="text-orange-500 font-bold text-sm mt-1">
                        {listing.rent} {listing.currency}{ui.perMonth}
                      </p>
                    )}
                    {(listing.house_type || listing.rooms || listing.furnished != null || listing.elevator) && (
                      <p className="text-gray-500 text-xs mt-1">
                        {[
                          listing.house_type,
                          listing.rooms ? `${listing.rooms} ${lbl.rooms}` : null,
                          listing.furnished === true ? lbl.furnished : listing.furnished === false ? lbl.unfurnished : null,
                          listing.elevator ? "🛗" : null,
                        ].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    {listing.current_residents > 0 && (
                      <p className="text-gray-400 text-xs mt-1">👥 {listing.current_residents} {lbl.residents}</p>
                    )}
                    {listing.smoking === false && (
                      <p className="text-gray-400 text-xs mt-1">🚭 {ui.noSmoking}</p>
                    )}
                  </>
                ) : (
                  <>
                    {listing.max_budget && listing.currency && (
                      <p className="text-orange-500 font-bold text-sm mt-1">
                        {lbl.maxBudget}: {listing.max_budget} {listing.currency}{ui.perMonth}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {listing.seeker_age && (
                        <span className="text-gray-500 text-xs">{listing.seeker_age} {lbl.age}</span>
                      )}
                      <GenderBadge gender={listing.seeker_gender ?? null} />
                      {listing.occupation && (
                        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                          {(() => {
                            const o = listing.occupation.toLowerCase();
                            if (o.includes("student") || o.includes("öğrenci")) return lbl.student;
                            if (o.includes("employ") || o.includes("work") || o.includes("çalış")) return lbl.working;
                            return listing.occupation;
                          })()}
                        </span>
                      )}
                    </div>
                    {listing.private_room_required && (
                      <p className="text-gray-500 text-xs mt-1">🚪 {lbl.privateRoom}</p>
                    )}
                    {listing.smoking === false && (
                      <p className="text-gray-400 text-xs mt-1">🚭 {ui.noSmoking}</p>
                    )}
                    {listing.about_text && (
                      <p className="text-gray-400 text-xs mt-1 italic">
                        {listing.about_text.length > 60 ? listing.about_text.slice(0, 60) + "…" : listing.about_text}
                      </p>
                    )}
                  </>
                )}

                {/* Avatar row */}
                {listing.profile?.avatar_url && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <AvatarImage
                      url={listing.profile.avatar_url}
                      size="thumb"
                      loading="lazy"
                      decoding="async"
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                      alt=""
                    />
                    <span className="text-xs text-gray-500 font-medium truncate">
                      {listing.profile.display_name || ""}
                    </span>
                    <GenderBadge gender={listing.profile.gender ?? null} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && listings.length > 0 && (
        /* One control, two states, never absent. While local listings remain it pages
           in place — the cards already on screen stay mounted and the next page lands
           underneath them. Once they run out it becomes the way out to the full
           catalogue instead of vanishing, which would read as "that is all there is".
           Both states carry the same pill classes, so the swap moves nothing. */
        <div className="mt-section flex flex-wrap items-center justify-center gap-3">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className={showMorePill}
            >
              {ui.showMore}
            </button>
          ) : (
            <Link href={searchHref} className={showMorePill}>
              {ui.seeAll}
            </Link>
          )}
          {/* Only once there is something to collapse. DOM order is primary-then-
              secondary; an RTL `dir` reverses the flex row on its own, so the pair
              mirrors without an `order` override. */}
          {visibleCount > PAGE_SIZE && (
            <button
              type="button"
              onClick={() => {
                setVisibleCount(PAGE_SIZE);
                setCollapseTick((t) => t + 1);
              }}
              className={showLessGhost}
            >
              {ui.showLess}
            </button>
          )}
        </div>
      )}

      </div>
    </section>
  );
}
