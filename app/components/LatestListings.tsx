"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { getListingSide, getCommercialBadgeLabel, COMMERCIAL_BADGE_CLASS } from "@/app/lib/listingBadge";

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

const heroText: Record<Lang, { l1: string; l2: string; sub: string }> = {
  tr: { l1: "Dünyanın her yerinden", l2: "en son ilanlar", sub: "İhtiyacın olan alanı kolayca bul." },
  en: { l1: "From all around the world", l2: "the latest listings", sub: "Easily find the space you need." },
  fa: { l1: "از سراسر جهان", l2: "جدیدترین آگهی‌ها", sub: "فضای موردنیازت را به‌راحتی پیدا کن." },
  ar: { l1: "من جميع أنحاء العالم", l2: "أحدث الإعلانات", sub: "اعثر بسهولة على المساحة التي تحتاجها." },
  de: { l1: "Aus der ganzen Welt", l2: "die neuesten Anzeigen", sub: "Finde ganz einfach den Raum, den du brauchst." },
  ru: { l1: "Со всего мира", l2: "самые свежие объявления", sub: "Легко найдите нужное пространство." },
};

const categoryTabs: { key: "all" | "residential" | "commercial"; icon: string; label: Record<Lang, string> }[] = [
  { key: "all", icon: "🌐", label: { tr: "Tümü", en: "All", fa: "همه", ar: "الكل", de: "Alle", ru: "Все" } },
  { key: "residential", icon: "🏠", label: { tr: "Konut", en: "Residential", fa: "مسکونی", ar: "سكني", de: "Wohnen", ru: "Жильё" } },
  { key: "commercial", icon: "🏢", label: { tr: "Ticari", en: "Commercial", fa: "تجاری", ar: "تجاري", de: "Gewerbe", ru: "Коммерческий" } },
];

const cardLabels: Record<Lang, {
  furnished: string; unfurnished: string; residents: string;
  maxBudget: string; age: string; working: string; student: string; privateRoom: string;
}> = {
  tr: { furnished:"Eşyalı",      unfurnished:"Eşyasız",      residents:"kişi var",     maxBudget:"Max", age:"yaş",  working:"Çalışıyor", student:"Öğrenci",   privateRoom:"Özel oda şart" },
  en: { furnished:"Furnished",   unfurnished:"Unfurnished",  residents:"residents",    maxBudget:"Max", age:"yrs",  working:"Working",   student:"Student",   privateRoom:"Private room required" },
  fa: { furnished:"مبله",        unfurnished:"بدون مبل",     residents:"نفر ساکن",     maxBudget:"حداکثر", age:"سال", working:"شاغل",  student:"دانشجو",    privateRoom:"اتاق خصوصی لازم" },
  ar: { furnished:"مفروش",       unfurnished:"غير مفروش",    residents:"ساكن",         maxBudget:"الحد الأقصى", age:"سنة", working:"موظف", student:"طالب", privateRoom:"غرفة خاصة مطلوبة" },
  de: { furnished:"Möbliert",    unfurnished:"Unmöbliert",   residents:"Bewohner",     maxBudget:"Max", age:"J.",   working:"Berufstätig", student:"Student/in", privateRoom:"Eigenes Zimmer nötig" },
  ru: { furnished:"Меблированная", unfurnished:"Без мебели", residents:"жильцов",      maxBudget:"Макс", age:"лет", working:"Работающий", student:"Студент",  privateRoom:"Нужна отд. комната" },
};

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

const langPriorityCountries: Record<string, string[]> = {
  en: ['US', 'GB', 'CA'],
  fa: ['IR', 'AF'],
  ru: ['RU'],
  de: ['DE', 'NO'],
  ar: ['AE', 'SA', 'QA', 'EG'],
  tr: ['TR'],
};

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

  const listings = useMemo(() => {
    let base = filterCity
      ? allListings
      : allListings.filter((l) => {
          const category = l.listing_category ?? null;
          if (sonIlanlarCategory === "all") return true;
          if (sonIlanlarCategory === "commercial") return category === "commercial";
          return category === "residential" || category == null;
        });
    if (filterCity) {
      const q = normalizeTR(filterCity);
      base = base.filter(
        (l) =>
          normalizeTR(l.city || "").includes(q) ||
          normalizeTR(l.district || "").includes(q)
      );
    }
    if (selectedCountry !== 'all') {
      base = filterByCountry(base, selectedCountry);
    }
    return base.slice(0, 12);
  }, [allListings, sonIlanlarCategory, filterCity, selectedCountry]);

  const lbl = cardLabels[lang as Lang] ?? cardLabels.tr;

  const priorityCodes = langPriorityCountries[lang] ?? [];
  const allEntry = countries.find((c) => c.code === 'all')!;
  const priorityEntries = priorityCodes
    .map((code) => countries.find((c) => c.code === code))
    .filter((c): c is typeof countries[number] => c !== undefined);
  const restEntries = countries.filter((c) => c.code !== 'all' && !priorityCodes.includes(c.code));
  const orderedCountries = [allEntry, ...priorityEntries, ...restEntries];

  const isRTL = lang === "ar" || lang === "fa";
  const hero = heroText[lang as Lang] ?? heroText.tr;

  return (
    <section className="max-w-7xl mx-auto mt-10 mb-0">
      {/* Hero header */}
      <div className="relative overflow-hidden min-h-[200px] sm:min-h-[240px]">
        <Image
          src="/son-ilanlar-hero.webp"
          alt=""
          fill
          priority
          className={`object-cover object-[80%_center] ${isRTL ? "scale-x-[-1]" : ""}`}
        />
        <div
          className={`absolute inset-0 ${
            isRTL
              ? "bg-gradient-to-l from-white/95 via-white/70 to-transparent"
              : "bg-gradient-to-r from-white/95 via-white/70 to-transparent"
          }`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-stone-50 to-transparent pointer-events-none z-[1]" />

        <div
          className="relative z-10 h-full flex flex-col justify-center max-w-[75%] sm:max-w-[50%] px-6 py-6"
          dir={isRTL ? "rtl" : "ltr"}
          style={{ textAlign: isRTL ? "right" : "left" }}
        >
          <p className="text-lg sm:text-xl text-stone-700">{hero.l1}</p>
          <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {hero.l2}
          </p>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xs">{hero.sub}</p>

          {/* Category filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4">
            {categoryTabs.filter((tab) => tab.key !== "all").map((tab) => {
              const isActive = sonIlanlarCategory === tab.key;
              const activeGradient =
                tab.key === "residential"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500";
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSonIlanlarCategory(isActive ? "all" : tab.key);
                    onClearFilter?.();
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? `${activeGradient} text-white shadow-lg scale-105 border border-transparent`
                      : "bg-white/80 backdrop-blur border border-stone-200 text-stone-700 shadow-sm hover:border-orange-300"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label[lang as Lang] ?? tab.label.tr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white px-5 pt-2 pb-6">

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

      {/* Country selector */}
      <div className="mb-6">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          <div className="flex gap-2 w-max">
            {orderedCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedCountry === country.code
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name[lang as Lang] ?? country.name.tr}</span>
              </button>
            ))}
          </div>
        </div>
        {selectedCountry !== 'all' && (
          <p className="text-xs text-stone-400 mt-1">{listings.length} ilan</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48" />
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
          <p className="text-center text-gray-400 py-8">
            {lang === "tr" ? "Bu ülkede ilan yok" :
             lang === "fa" ? "آگهی‌ای در این کشور وجود ندارد" :
             lang === "ar" ? "لا توجد إعلانات في هذا البلد" :
             lang === "de" ? "Keine Anzeigen in diesem Land" :
             lang === "ru" ? "Нет объявлений в этой стране" :
             "No listings in this country"}
          </p>
        )
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => {
              sessionStorage.setItem("sefira-scroll", String(window.scrollY));
              sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
              router.push(`/listings/${listing.id}`);
            }}
              className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="aspect-video bg-gray-100 relative">
                {listing.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.photos[0]}
                    alt={listing.city}
                    className="w-full h-full object-cover"
                  />
                ) : listing.type === "needs_place" ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-orange-50 relative">
                    {listing.profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl text-blue-300 font-semibold">
                        {listing.profile?.display_name
                          ? listing.profile.display_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                          : "👤"}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
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
                  const colorClass = isCommercial
                    ? COMMERCIAL_BADGE_CLASS[side]
                    : side === "has_place" ? "bg-emerald-500" : "bg-blue-500";
                  return (
                    <span className={`absolute top-2 start-2 text-white text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
                      {label}
                    </span>
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
                  const flag = code && /^[A-Za-z]{2}$/.test(code)
                    ? String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)))
                    : countryInfo.flag;
                  return (
                    <div className="flex items-center gap-2 mt-1 mb-2">
                      <span className="text-base">{flag}</span>
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
                        {listing.rent} {listing.currency}/ay
                      </p>
                    )}
                    {(listing.house_type || listing.rooms || listing.furnished != null || listing.elevator) && (
                      <p className="text-gray-500 text-xs mt-1">
                        {[
                          listing.house_type,
                          listing.rooms ? `${listing.rooms} oda` : null,
                          listing.furnished === true ? lbl.furnished : listing.furnished === false ? lbl.unfurnished : null,
                          listing.elevator ? "🛗" : null,
                        ].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    {listing.current_residents > 0 && (
                      <p className="text-gray-400 text-xs mt-1">👥 {listing.current_residents} {lbl.residents}</p>
                    )}
                    {listing.smoking === false && (
                      <p className="text-gray-400 text-xs mt-1">🚭 Sigara İçilmez</p>
                    )}
                  </>
                ) : (
                  <>
                    {listing.max_budget && listing.currency && (
                      <p className="text-orange-500 font-bold text-sm mt-1">
                        {lbl.maxBudget}: {listing.max_budget} {listing.currency}/ay
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
                      <p className="text-gray-400 text-xs mt-1">🚭 Sigara İçilmez</p>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.profile.avatar_url}
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

      </div>
    </section>
  );
}
