import { NextRequest, NextResponse } from 'next/server';
import { State } from 'country-state-city';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country') || '';
  const states = State.getStatesOfCountry(countryCode).map(s => ({
    name: s.name,
    isoCode: s.isoCode,
  }));
  return NextResponse.json(states);
}
