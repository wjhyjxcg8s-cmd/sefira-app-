'use client'
import { useState, useRef, useEffect } from 'react'

const COUNTRY_MAP: Record<string, Record<string, string>> = {
  'Russia':                       { en: 'Russia',                tr: 'Rusya',                          fa: 'روسیه',                    ar: 'روسيا',                              ru: 'Россия',            de: 'Russland' },
  'Turkey':                       { en: 'Turkey',                tr: 'Türkiye',                        fa: 'ترکیه',                    ar: 'تركيا',                              ru: 'Турция',            de: 'Türkei' },
  'Germany':                      { en: 'Germany',               tr: 'Almanya',                        fa: 'آلمان',                    ar: 'ألمانيا',                            ru: 'Германия',          de: 'Deutschland' },
  'United States':                { en: 'United States',         tr: 'Amerika Birleşik Devletleri',    fa: 'ایالات متحده آمریکا',      ar: 'الولايات المتحدة الأمريكية',         ru: 'США',               de: 'Vereinigte Staaten' },
  'France':                       { en: 'France',                tr: 'Fransa',                         fa: 'فرانسه',                   ar: 'فرنسا',                              ru: 'Франция',           de: 'Frankreich' },
  'Italy':                        { en: 'Italy',                 tr: 'İtalya',                         fa: 'ایتالیا',                  ar: 'إيطاليا',                            ru: 'Италия',            de: 'Italien' },
  'United Kingdom':               { en: 'United Kingdom',        tr: 'Birleşik Krallık',               fa: 'بریتانیا',                 ar: 'المملكة المتحدة',                    ru: 'Великобритания',    de: 'Vereinigtes Königreich' },
  'Iran':                         { en: 'Iran',                  tr: 'İran',                           fa: 'ایران',                    ar: 'إيران',                              ru: 'Иран',              de: 'Iran' },
  'Afghanistan':                  { en: 'Afghanistan',           tr: 'Afganistan',                     fa: 'افغانستان',                ar: 'أفغانستان',                          ru: 'Афганистан',        de: 'Afghanistan' },
  'Albania':                      { en: 'Albania',               tr: 'Arnavutluk',                     fa: 'آلبانی',                   ar: 'ألبانيا',                            ru: 'Албания',           de: 'Albanien' },
  'Algeria':                      { en: 'Algeria',               tr: 'Cezayir',                        fa: 'الجزایر',                  ar: 'الجزائر',                            ru: 'Алжир',             de: 'Algerien' },
  'Argentina':                    { en: 'Argentina',             tr: 'Arjantin',                       fa: 'آرژانتین',                 ar: 'الأرجنتين',                          ru: 'Аргентина',         de: 'Argentinien' },
  'Armenia':                      { en: 'Armenia',               tr: 'Ermenistan',                     fa: 'ارمنستان',                 ar: 'أرمينيا',                            ru: 'Армения',           de: 'Armenien' },
  'Australia':                    { en: 'Australia',             tr: 'Avustralya',                     fa: 'استرالیا',                 ar: 'أستراليا',                           ru: 'Австралия',         de: 'Australien' },
  'Austria':                      { en: 'Austria',               tr: 'Avusturya',                      fa: 'اتریش',                    ar: 'النمسا',                             ru: 'Австрия',           de: 'Österreich' },
  'Azerbaijan':                   { en: 'Azerbaijan',            tr: 'Azerbaycan',                     fa: 'آذربایجان',                ar: 'أذربيجان',                           ru: 'Азербайджан',       de: 'Aserbaidschan' },
  'Bangladesh':                   { en: 'Bangladesh',            tr: 'Bangladeş',                      fa: 'بنگلادش',                  ar: 'بنغلاديش',                           ru: 'Бангладеш',         de: 'Bangladesch' },
  'Belarus':                      { en: 'Belarus',               tr: 'Beyaz Rusya',                    fa: 'بلاروس',                   ar: 'روسيا البيضاء',                      ru: 'Беларусь',          de: 'Weißrussland' },
  'Belgium':                      { en: 'Belgium',               tr: 'Belçika',                        fa: 'بلژیک',                    ar: 'بلجيكا',                             ru: 'Бельгия',           de: 'Belgien' },
  'Bolivia':                      { en: 'Bolivia',               tr: 'Bolivya',                        fa: 'بولیوی',                   ar: 'بوليفيا',                            ru: 'Боливия',           de: 'Bolivien' },
  'Brazil':                       { en: 'Brazil',                tr: 'Brezilya',                       fa: 'برزیل',                    ar: 'البرازيل',                           ru: 'Бразилия',         de: 'Brasilien' },
  'Bulgaria':                     { en: 'Bulgaria',              tr: 'Bulgaristan',                    fa: 'بلغارستان',                ar: 'بلغاريا',                            ru: 'Болгария',          de: 'Bulgarien' },
  'Canada':                       { en: 'Canada',                tr: 'Kanada',                         fa: 'کانادا',                   ar: 'كندا',                               ru: 'Канада',            de: 'Kanada' },
  'Chile':                        { en: 'Chile',                 tr: 'Şili',                           fa: 'شیلی',                     ar: 'تشيلي',                              ru: 'Чили',              de: 'Chile' },
  'China':                        { en: 'China',                 tr: 'Çin',                            fa: 'چین',                      ar: 'الصين',                              ru: 'Китай',             de: 'China' },
  'Colombia':                     { en: 'Colombia',              tr: 'Kolombiya',                      fa: 'کلمبیا',                   ar: 'كولومبيا',                           ru: 'Колумбия',          de: 'Kolumbien' },
  'Croatia':                      { en: 'Croatia',               tr: 'Hırvatistan',                    fa: 'کرواسی',                   ar: 'كرواتيا',                            ru: 'Хорватия',          de: 'Kroatien' },
  'Cuba':                         { en: 'Cuba',                  tr: 'Küba',                           fa: 'کوبا',                     ar: 'كوبا',                               ru: 'Куба',              de: 'Kuba' },
  'Czech Republic':               { en: 'Czech Republic',        tr: 'Çekya',                          fa: 'جمهوری چک',                ar: 'جمهورية التشيك',                     ru: 'Чехия',             de: 'Tschechien' },
  'Denmark':                      { en: 'Denmark',               tr: 'Danimarka',                      fa: 'دانمارک',                  ar: 'الدنمارك',                           ru: 'Дания',             de: 'Dänemark' },
  'Egypt':                        { en: 'Egypt',                 tr: 'Mısır',                          fa: 'مصر',                      ar: 'مصر',                                ru: 'Египет',            de: 'Ägypten' },
  'Ethiopia':                     { en: 'Ethiopia',              tr: 'Etiyopya',                       fa: 'اتیوپی',                   ar: 'إثيوبيا',                            ru: 'Эфиопия',           de: 'Äthiopien' },
  'Finland':                      { en: 'Finland',               tr: 'Finlandiya',                     fa: 'فنلاند',                   ar: 'فنلندا',                             ru: 'Финляндия',         de: 'Finnland' },
  'Georgia':                      { en: 'Georgia',               tr: 'Gürcistan',                      fa: 'گرجستان',                  ar: 'جورجيا',                             ru: 'Грузия',            de: 'Georgien' },
  'Ghana':                        { en: 'Ghana',                 tr: 'Gana',                           fa: 'غنا',                      ar: 'غانا',                               ru: 'Гана',              de: 'Ghana' },
  'Greece':                       { en: 'Greece',                tr: 'Yunanistan',                     fa: 'یونان',                    ar: 'اليونان',                            ru: 'Греция',            de: 'Griechenland' },
  'Hungary':                      { en: 'Hungary',               tr: 'Macaristan',                     fa: 'مجارستان',                 ar: 'المجر',                              ru: 'Венгрия',           de: 'Ungarn' },
  'India':                        { en: 'India',                 tr: 'Hindistan',                      fa: 'هند',                      ar: 'الهند',                              ru: 'Индия',             de: 'Indien' },
  'Indonesia':                    { en: 'Indonesia',             tr: 'Endonezya',                      fa: 'اندونزی',                  ar: 'إندونيسيا',                          ru: 'Индонезия',         de: 'Indonesien' },
  'Iraq':                         { en: 'Iraq',                  tr: 'Irak',                           fa: 'عراق',                     ar: 'العراق',                             ru: 'Ирак',              de: 'Irak' },
  'Ireland':                      { en: 'Ireland',               tr: 'İrlanda',                        fa: 'ایرلند',                   ar: 'أيرلندا',                            ru: 'Ирландия',          de: 'Irland' },
  'Israel':                       { en: 'Israel',                tr: 'İsrail',                         fa: 'اسرائیل',                  ar: 'إسرائيل',                            ru: 'Израиль',           de: 'Israel' },
  'Japan':                        { en: 'Japan',                 tr: 'Japonya',                        fa: 'ژاپن',                     ar: 'اليابان',                            ru: 'Япония',            de: 'Japan' },
  'Jordan':                       { en: 'Jordan',                tr: 'Ürdün',                          fa: 'اردن',                     ar: 'الأردن',                             ru: 'Иордания',          de: 'Jordanien' },
  'Kazakhstan':                   { en: 'Kazakhstan',            tr: 'Kazakistan',                     fa: 'قزاقستان',                 ar: 'كازاخستان',                          ru: 'Казахстан',         de: 'Kasachstan' },
  'Kenya':                        { en: 'Kenya',                 tr: 'Kenya',                          fa: 'کنیا',                     ar: 'كينيا',                              ru: 'Кения',             de: 'Kenia' },
  'Kuwait':                       { en: 'Kuwait',                tr: 'Kuveyt',                         fa: 'کویت',                     ar: 'الكويت',                             ru: 'Кувейт',            de: 'Kuwait' },
  'Kyrgyzstan':                   { en: 'Kyrgyzstan',            tr: 'Kırgızistan',                    fa: 'قرقیزستان',                ar: 'قيرغيزستان',                         ru: 'Киргизия',          de: 'Kirgisistan' },
  'Lebanon':                      { en: 'Lebanon',               tr: 'Lübnan',                         fa: 'لبنان',                    ar: 'لبنان',                              ru: 'Ливан',             de: 'Libanon' },
  'Libya':                        { en: 'Libya',                 tr: 'Libya',                          fa: 'لیبی',                     ar: 'ليبيا',                              ru: 'Ливия',             de: 'Libyen' },
  'Malaysia':                     { en: 'Malaysia',              tr: 'Malezya',                        fa: 'مالزی',                    ar: 'ماليزيا',                            ru: 'Малайзия',          de: 'Malaysia' },
  'Mexico':                       { en: 'Mexico',                tr: 'Meksika',                        fa: 'مکزیک',                    ar: 'المكسيك',                            ru: 'Мексика',           de: 'Mexiko' },
  'Morocco':                      { en: 'Morocco',               tr: 'Fas',                            fa: 'مراکش',                    ar: 'المغرب',                             ru: 'Марокко',           de: 'Marokko' },
  'Netherlands':                  { en: 'Netherlands',           tr: 'Hollanda',                       fa: 'هلند',                     ar: 'هولندا',                             ru: 'Нидерланды',        de: 'Niederlande' },
  'New Zealand':                  { en: 'New Zealand',           tr: 'Yeni Zelanda',                   fa: 'نیوزیلند',                 ar: 'نيوزيلندا',                          ru: 'Новая Зеландия',    de: 'Neuseeland' },
  'Nigeria':                      { en: 'Nigeria',               tr: 'Nijerya',                        fa: 'نیجریه',                   ar: 'نيجيريا',                            ru: 'Нигерия',           de: 'Nigeria' },
  'Norway':                       { en: 'Norway',                tr: 'Norveç',                         fa: 'نروژ',                     ar: 'النرويج',                            ru: 'Норвегия',          de: 'Norwegen' },
  'Oman':                         { en: 'Oman',                  tr: 'Umman',                          fa: 'عمان',                     ar: 'عُمان',                              ru: 'Оман',              de: 'Oman' },
  'Pakistan':                     { en: 'Pakistan',              tr: 'Pakistan',                       fa: 'پاکستان',                  ar: 'باكستان',                            ru: 'Пакистан',          de: 'Pakistan' },
  'Peru':                         { en: 'Peru',                  tr: 'Peru',                           fa: 'پرو',                      ar: 'بيرو',                               ru: 'Перу',              de: 'Peru' },
  'Philippines':                  { en: 'Philippines',           tr: 'Filipinler',                     fa: 'فیلیپین',                  ar: 'الفلبين',                            ru: 'Филиппины',         de: 'Philippinen' },
  'Poland':                       { en: 'Poland',                tr: 'Polonya',                        fa: 'لهستان',                   ar: 'بولندا',                             ru: 'Польша',            de: 'Polen' },
  'Portugal':                     { en: 'Portugal',              tr: 'Portekiz',                       fa: 'پرتغال',                   ar: 'البرتغال',                           ru: 'Португалия',        de: 'Portugal' },
  'Qatar':                        { en: 'Qatar',                 tr: 'Katar',                          fa: 'قطر',                      ar: 'قطر',                                ru: 'Катар',             de: 'Katar' },
  'Romania':                      { en: 'Romania',               tr: 'Romanya',                        fa: 'رومانی',                   ar: 'رومانيا',                            ru: 'Румыния',           de: 'Rumänien' },
  'Saudi Arabia':                 { en: 'Saudi Arabia',          tr: 'Suudi Arabistan',                fa: 'عربستان سعودی',            ar: 'المملكة العربية السعودية',           ru: 'Саудовская Аравия', de: 'Saudi-Arabien' },
  'Serbia':                       { en: 'Serbia',                tr: 'Sırbistan',                      fa: 'صربستان',                  ar: 'صربيا',                              ru: 'Сербия',            de: 'Serbien' },
  'Singapore':                    { en: 'Singapore',             tr: 'Singapur',                       fa: 'سنگاپور',                  ar: 'سنغافورة',                           ru: 'Сингапур',          de: 'Singapur' },
  'Slovakia':                     { en: 'Slovakia',              tr: 'Slovakya',                       fa: 'اسلواکی',                  ar: 'سلوفاكيا',                           ru: 'Словакия',          de: 'Slowakei' },
  'Somalia':                      { en: 'Somalia',               tr: 'Somali',                         fa: 'سومالی',                   ar: 'الصومال',                            ru: 'Сомали',            de: 'Somalia' },
  'South Africa':                 { en: 'South Africa',          tr: 'Güney Afrika',                   fa: 'آفریقای جنوبی',            ar: 'جنوب أفريقيا',                       ru: 'ЮАР',               de: 'Südafrika' },
  'South Korea':                  { en: 'South Korea',           tr: 'Güney Kore',                     fa: 'کره جنوبی',                ar: 'كوريا الجنوبية',                     ru: 'Южная Корея',       de: 'Südkorea' },
  'Spain':                        { en: 'Spain',                 tr: 'İspanya',                        fa: 'اسپانیا',                  ar: 'إسبانيا',                            ru: 'Испания',           de: 'Spanien' },
  'Sudan':                        { en: 'Sudan',                 tr: 'Sudan',                          fa: 'سودان',                    ar: 'السودان',                            ru: 'Судан',             de: 'Sudan' },
  'Sweden':                       { en: 'Sweden',                tr: 'İsveç',                          fa: 'سوئد',                     ar: 'السويد',                             ru: 'Швеция',            de: 'Schweden' },
  'Switzerland':                  { en: 'Switzerland',           tr: 'İsviçre',                        fa: 'سوئیس',                    ar: 'سويسرا',                             ru: 'Швейцария',         de: 'Schweiz' },
  'Syria':                        { en: 'Syria',                 tr: 'Suriye',                         fa: 'سوریه',                    ar: 'سوريا',                              ru: 'Сирия',             de: 'Syrien' },
  'Tajikistan':                   { en: 'Tajikistan',            tr: 'Tacikistan',                     fa: 'تاجیکستان',                ar: 'طاجيكستان',                          ru: 'Таджикистан',       de: 'Tadschikistan' },
  'Thailand':                     { en: 'Thailand',              tr: 'Tayland',                        fa: 'تایلند',                   ar: 'تايلاند',                            ru: 'Таиланд',           de: 'Thailand' },
  'Tunisia':                      { en: 'Tunisia',               tr: 'Tunus',                          fa: 'تونس',                     ar: 'تونس',                               ru: 'Тунис',             de: 'Tunesien' },
  'Turkmenistan':                 { en: 'Turkmenistan',          tr: 'Türkmenistan',                   fa: 'ترکمنستان',                ar: 'تركمانستان',                         ru: 'Туркменистан',      de: 'Turkmenistan' },
  'Ukraine':                      { en: 'Ukraine',               tr: 'Ukrayna',                        fa: 'اوکراین',                  ar: 'أوكرانيا',                           ru: 'Украина',           de: 'Ukraine' },
  'United Arab Emirates':         { en: 'United Arab Emirates',  tr: 'Birleşik Arap Emirlikleri',      fa: 'امارات متحده عربی',        ar: 'الإمارات العربية المتحدة',           ru: 'ОАЭ',               de: 'Vereinigte Arabische Emirate' },
  'Uzbekistan':                   { en: 'Uzbekistan',            tr: 'Özbekistan',                     fa: 'ازبکستان',                 ar: 'أوزبكستان',                          ru: 'Узбекистан',        de: 'Usbekistan' },
  'Venezuela':                    { en: 'Venezuela',             tr: 'Venezuela',                      fa: 'ونزوئلا',                  ar: 'فنزويلا',                            ru: 'Венесуэла',         de: 'Venezuela' },
  'Vietnam':                      { en: 'Vietnam',               tr: 'Vietnam',                        fa: 'ویتنام',                   ar: 'فيتنام',                             ru: 'Вьетнам',           de: 'Vietnam' },
  'Yemen':                        { en: 'Yemen',                 tr: 'Yemen',                          fa: 'یمن',                      ar: 'اليمن',                              ru: 'Йемен',             de: 'Jemen' },
}

const PRIORITY_KEYS = ['Russia', 'Turkey', 'Germany', 'United States', 'France', 'Italy', 'United Kingdom', 'Iran']

const RTL_LANGS = new Set(['fa', 'ar'])

function getDisplayName(englishKey: string, lang: string): string {
  return COUNTRY_MAP[englishKey]?.[lang] || englishKey
}

function findEnglishKey(displayName: string): string | null {
  for (const [key, translations] of Object.entries(COUNTRY_MAP)) {
    if (Object.values(translations).includes(displayName) || key === displayName) {
      return key
    }
  }
  return null
}

interface CountrySelectProps {
  value: string
  onChange: (englishKey: string, isValid: boolean) => void
  lang?: string
  placeholder?: string
}

export default function CountrySelect({ value, onChange, lang = 'tr', placeholder }: CountrySelectProps) {
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [filtered, setFiltered] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const isRtl = RTL_LANGS.has(lang)

  // Convert stored value (possibly old language) to English key, update display for lang changes
  useEffect(() => {
    const key = COUNTRY_MAP[value] ? value : findEnglishKey(value)
    setCurrentKey(key ?? null)
    setSearch(key ? getDisplayName(key, lang) : '')
    setIsValid(!!key)
  }, [value, lang])

  // Build filtered list with priority keys first, then alphabetical
  useEffect(() => {
    const q = search.toLowerCase()
    const allKeys = Object.keys(COUNTRY_MAP)

    const matches = (key: string) => {
      if (!q) return true
      const display = getDisplayName(key, lang)
      return display.toLowerCase().includes(q) || key.toLowerCase().includes(q)
    }

    const priorityMatches = PRIORITY_KEYS.filter(k => COUNTRY_MAP[k] && matches(k))
    const nonPriorityMatches = allKeys
      .filter(k => !PRIORITY_KEYS.includes(k) && matches(k))
      .sort((a, b) => getDisplayName(a, lang).localeCompare(getDisplayName(b, lang)))

    setFiltered([...priorityMatches, ...nonPriorityMatches])
  }, [search, lang])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (englishKey: string) => {
    setCurrentKey(englishKey)
    setSearch(getDisplayName(englishKey, lang))
    setIsValid(true)
    onChange(englishKey, true)
    setOpen(false)
  }

  // On blur: revert display to last valid selection, or clear if none
  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      if (!currentKey) {
        setSearch('')
        setIsValid(false)
      } else {
        setSearch(getDisplayName(currentKey, lang))
        setIsValid(true)
      }
    }, 200)
  }

  const borderColor = isValid ? '#22c55e' : search && !isValid ? '#ef4444' : '#ddd'

  return (
    <div ref={ref} dir={isRtl ? 'rtl' : undefined} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={search}
          dir={isRtl ? 'rtl' : undefined}
          onChange={(e) => { setSearch(e.target.value); setIsValid(false); setCurrentKey(null); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder || 'Ülke seçin...'}
          style={{
            width: '100%',
            padding: '12px',
            paddingRight: isRtl ? '12px' : '36px',
            paddingLeft: isRtl ? '36px' : '12px',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        <span style={{
          position: 'absolute',
          top: '50%',
          right: isRtl ? 'auto' : '12px',
          left: isRtl ? '12px' : 'auto',
          transform: 'translateY(-50%)',
          fontSize: '16px',
          pointerEvents: 'none',
          color: isValid ? '#22c55e' : '#ef4444',
          opacity: search ? 1 : 0,
        }}>
          {isValid ? '✓' : '✗'}
        </span>
      </div>

      {open && filtered.length > 0 && (
        <div
          dir={isRtl ? 'rtl' : undefined}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: '2px',
          }}
        >
          {filtered.map((key, i) => {
            const isPriority = PRIORITY_KEYS.includes(key)
            const nextIsPriority = filtered[i + 1] ? PRIORITY_KEYS.includes(filtered[i + 1]) : false
            const showDivider = isPriority && !nextIsPriority && i < filtered.length - 1
            return (
              <div
                key={key}
                onMouseDown={() => handleSelect(key)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: showDivider ? '2px solid #f97316' : 'none',
                  background: 'white',
                  fontSize: '15px',
                  textAlign: isRtl ? 'right' : 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fff7ed')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                {isPriority ? '⭐ ' : ''}{getDisplayName(key, lang)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
