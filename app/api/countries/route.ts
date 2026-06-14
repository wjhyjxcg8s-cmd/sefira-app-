import { NextResponse } from 'next/server';
import { Country } from 'country-state-city';

export async function GET() {
  const countries = Country.getAllCountries().map(c => ({
    name: c.name,
    isoCode: c.isoCode,
    flag: c.flag,
    phonecode: c.phonecode,
  }));
  return NextResponse.json(countries);
}
