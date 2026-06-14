import { NextRequest, NextResponse } from 'next/server';
import { City } from 'country-state-city';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || '';
  const state = searchParams.get('state') || '';

  if (!country || !state) {
    return NextResponse.json([]);
  }

  const cities = City.getCitiesOfState(country, state) || [];
  return NextResponse.json(cities.map((c) => c.name));
}
