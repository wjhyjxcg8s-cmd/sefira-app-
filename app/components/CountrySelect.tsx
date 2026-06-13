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

// First 8 entries in COUNTRY_MAP are the priority countries
const PRIORITY_COUNT = 8

const RTL_LANGS = new Set(['fa', 'ar'])

function getCountryList(lang: string): string[] {
  const l = lang || 'tr'
  return Object.values(COUNTRY_MAP).map(t => t[l] || t['en'])
}

interface CountrySelectProps {
  value: string           // whatever is stored in DB — shown as-is
  onChange: (country: string, isValid: boolean) => void
  lang?: string           // used only for the dropdown list
  placeholder?: string
}

export default function CountrySelect({ value, onChange, lang = 'tr', placeholder }: CountrySelectProps) {
  const [search, setSearch] = useState(value || '')
  // query drives filtering; kept separate so focusing with a stored value shows all countries
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isValid, setIsValid] = useState(!!value)
  const [filtered, setFiltered] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const isRtl = RTL_LANGS.has(lang)

  // Show stored value as-is; no language conversion
  useEffect(() => {
    setSearch(value || '')
    setIsValid(!!value)
    setQuery('')
  }, [value])

  // Rebuild dropdown list when query or lang changes
  useEffect(() => {
    const allList = getCountryList(lang)
    if (!query) {
      setFiltered(allList)
    } else {
      const q = query.toLowerCase()
      setFiltered(allList.filter(c => c.toLowerCase().includes(q)))
    }
  }, [query, lang])

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

  const handleSelect = (displayName: string) => {
    setSearch(displayName)
    setQuery('')
    setIsValid(true)
    onChange(displayName, true)
    setOpen(false)
  }

  // On blur: if typed text is not in the current language's list, revert to stored value
  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      setQuery('')
      const currentList = getCountryList(lang)
      if (!currentList.includes(search)) {
        setSearch(value || '')
        setIsValid(!!value)
        onChange(value || '', !!value)
      }
    }, 200)
  }

  const borderColor = isValid ? '#22c55e' : search && !isValid ? '#ef4444' : '#ddd'

  // Precompute priority set for the current language
  const allList = getCountryList(lang)
  const priorityNames = new Set(allList.slice(0, PRIORITY_COUNT))

  return (
    <div ref={ref} dir={isRtl ? 'rtl' : undefined} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={search}
          dir={isRtl ? 'rtl' : undefined}
          onChange={(e) => { setSearch(e.target.value); setQuery(e.target.value); setIsValid(false); setOpen(true) }}
          onFocus={() => { setQuery(''); setOpen(true) }}
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
          {filtered.map((country, i) => {
            const isPriority = priorityNames.has(country)
            const nextIsPriority = filtered[i + 1] ? priorityNames.has(filtered[i + 1]) : false
            const showDivider = isPriority && !nextIsPriority && i < filtered.length - 1
            return (
              <div
                key={country}
                onMouseDown={() => handleSelect(country)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: showDivider ? '2px solid #0D9488' : 'none',
                  background: 'white',
                  fontSize: '15px',
                  textAlign: isRtl ? 'right' : 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ccfbf1')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                {isPriority ? '⭐ ' : ''}{country}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
