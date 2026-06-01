'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface Suggestion { name: string; subtitle: string }
interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  lang: string
  type: 'city' | 'neighborhood'
  label: string
  isRTL?: boolean
}

export default function PlacesAutocomplete({
  value, onChange, placeholder, lang, type, label, isRTL
}: Props) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<any>(null)

  const calcPos = useCallback(() => {
    if (!inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `/api/places?q=${encodeURIComponent(q)}&lang=${lang}&type=${type}`
      )
      const data = await res.json()
      const r = data.results || []
      setSuggestions(r)
      setOpen(r.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [lang, type])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    onChange(v)
    calcPos()
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 280)
  }

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name)
    onChange(s.name)
    setSuggestions([])
    setOpen(false)
  }

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const onScroll = () => calcPos()
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [open, calcPos])

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { calcPos(); if (suggestions.length > 0) setOpen(true) }}
          placeholder={placeholder}
          autoComplete="off"
          dir={isRTL ? 'rtl' : 'ltr'}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl
            focus:outline-none focus:ring-2 focus:ring-orange-400
            focus:border-transparent text-gray-900 bg-white text-sm"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4
            border-2 border-orange-400 border-t-transparent
            rounded-full animate-spin pointer-events-none" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 99999,
          }}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl
            overflow-y-auto max-h-60"
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
              className="w-full text-left px-4 py-3 hover:bg-orange-50
                border-b border-gray-100 last:border-0 transition-colors block"
            >
              <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
              {s.subtitle && (
                <p className="text-xs text-gray-400 mt-0.5">{s.subtitle}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
