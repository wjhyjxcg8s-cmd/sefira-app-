import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const lang = searchParams.get('lang') || 'en'
  const type = searchParams.get('type') || 'city'

  if (q.length < 1) return NextResponse.json({ results: [] })

  const photonLang = ['de', 'en', 'fr'].includes(lang) ? lang : 'en'
  const layer = type === 'city'
    ? 'city,town,village'
    : 'district,suburb,neighbourhood,locality'

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=${photonLang}&layer=${layer}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SefiraApp/1.0 (support@getsefira.com)' }
    })
    const data = await res.json()
    const results = (data.features || []).map((f: any) => ({
      name: f.properties.name || '',
      subtitle: [f.properties.city, f.properties.state, f.properties.country]
        .filter(Boolean).join(', ')
    })).filter((r: any) => r.name)

    return NextResponse.json({ results })
  } catch (e: any) {
    return NextResponse.json({ results: [] })
  }
}
