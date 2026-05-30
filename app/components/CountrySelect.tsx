'use client'
import { useState, useRef, useEffect } from 'react'

const PRIORITY_COUNTRIES = [
  'Rusya', 'Türkiye', 'Almanya', 'Amerika Birleşik Devletleri',
  'Fransa', 'İtalya', 'Birleşik Krallık', 'İran'
]

const ALL_COUNTRIES = [
  'Afganistan', 'Almanya', 'Amerika Birleşik Devletleri', 'Andorra',
  'Angola', 'Antigua ve Barbuda', 'Arjantin', 'Arnavutluk', 'Avustralya',
  'Avusturya', 'Azerbaycan', 'Bahamalar', 'Bahreyn', 'Bangladeş',
  'Barbados', 'Belçika', 'Belize', 'Benin', 'Beyaz Rusya', 'Bhutan',
  'Birleşik Arap Emirlikleri', 'Birleşik Krallık', 'Bolivya', 'Bosna Hersek',
  'Botsvana', 'Brezilya', 'Brunei', 'Bulgaristan', 'Burkina Faso',
  'Burundi', 'Cabo Verde', 'Cezayir', 'Cibuti', 'Çad', 'Çekya', 'Çin',
  'Danimarka', 'Demokratik Kongo Cumhuriyeti', 'Dominik Cumhuriyeti',
  'Dominika', 'Ekvador', 'Ekvator Ginesi', 'El Salvador', 'Endonezya',
  'Eritre', 'Ermenistan', 'Estonya', 'Etiyopya', 'Fas', 'Fiji',
  'Fildişi Sahili', 'Filipinler', 'Finlandiya', 'Fransa', 'Gabon',
  'Gambiya', 'Gana', 'Gine', 'Gine-Bissau', 'Grenada', 'Guatemala',
  'Guyana', 'Güney Afrika', 'Güney Kore', 'Güney Sudan', 'Gürcistan',
  'Haiti', 'Hırvatistan', 'Hindistan', 'Hollanda', 'Honduras', 'Irak',
  'İran', 'İrlanda', 'İspanya', 'İsrail', 'İsveç', 'İsviçre', 'İtalya',
  'İzlanda', 'Jamaika', 'Japonya', 'Kamboçya', 'Kamerun', 'Kanada',
  'Karadağ', 'Katar', 'Kazakistan', 'Kenya', 'Kıbrıs', 'Kırgızistan',
  'Kiribati', 'Kolombiya', 'Komorlar', 'Kongo', 'Kosova', 'Kosta Rika',
  'Küba', 'Kuveyt', 'Kuzey Kore', 'Kuzey Makedonya', 'Laos', 'Lesoto',
  'Letonya', 'Liberya', 'Libya', 'Liechtenstein', 'Litvanya', 'Lübnan',
  'Lüksemburg', 'Macaristan', 'Madagaskar', 'Malavi', 'Maldivler',
  'Malezya', 'Mali', 'Malta', 'Marshall Adaları', 'Mauritanya', 'Mauritius',
  'Meksika', 'Mikronezya', 'Moğolistan', 'Moldova', 'Monako', 'Mozambik',
  'Myanmar', 'Namibya', 'Nauru', 'Nepal', 'Nijer', 'Nijerya', 'Nikaragua',
  'Norveç', 'Özbekistan', 'Pakistan', 'Palau', 'Panama', 'Papua Yeni Gine',
  'Paraguay', 'Peru', 'Polonya', 'Portekiz', 'Romanya', 'Rusya', 'Rwanda',
  'Saint Kitts ve Nevis', 'Saint Lucia', 'Saint Vincent', 'Samoa',
  'San Marino', 'Sao Tome ve Principe', 'Senegal', 'Seyşeller', 'Sierra Leone',
  'Singapur', 'Sırbistan', 'Slovakya', 'Slovenya', 'Solomon Adaları',
  'Somali', 'Sri Lanka', 'Sudan', 'Surinam', 'Suriye', 'Suudi Arabistan',
  'Svaziland', 'Tacikistan', 'Tanzanya', 'Tayland', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad ve Tobago', 'Tunus', 'Türkiye', 'Türkmenistan',
  'Tuvalu', 'Uganda', 'Ukrayna', 'Umman', 'Uruguay', 'Ürdün', 'Vanuatu',
  'Venezuela', 'Vietnam', 'Yemen', 'Yeni Zelanda', 'Yunanistan',
  'Zambiya', 'Zimbabve'
]

const SORTED_COUNTRIES = [
  ...PRIORITY_COUNTRIES,
  ...ALL_COUNTRIES.filter(c => !PRIORITY_COUNTRIES.includes(c)).sort()
]

interface CountrySelectProps {
  value: string
  onChange: (country: string) => void
  placeholder?: string
}

export default function CountrySelect({ value, onChange, placeholder }: CountrySelectProps) {
  const [search, setSearch] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState(SORTED_COUNTRIES)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearch(value || '')
  }, [value])

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(SORTED_COUNTRIES)
    } else {
      const q = search.toLowerCase()
      setFiltered(SORTED_COUNTRIES.filter(c => c.toLowerCase().includes(q)))
    }
  }, [search])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (country: string) => {
    setSearch(country)
    onChange(country)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || 'Ülke seçin...'}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          outline: 'none'
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {filtered.map((country, i) => (
            <div
              key={country}
              onMouseDown={() => handleSelect(country)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: i < PRIORITY_COUNTRIES.length - 1 ? 'none' :
                  i === PRIORITY_COUNTRIES.length - 1 ? '2px solid #f97316' : 'none',
                background: 'white',
                fontSize: '15px'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff7ed')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              {i < PRIORITY_COUNTRIES.length ? '⭐ ' : ''}{country}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
