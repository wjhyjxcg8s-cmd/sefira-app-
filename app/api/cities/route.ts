import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

let citiesCache: Record<string, string[]> | null = null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || '';

  if (!country) {
    return NextResponse.json([]);
  }

  if (!citiesCache) {
    const filePath = path.join(process.cwd(), 'public', 'world-cities.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    citiesCache = JSON.parse(fileContent);
  }

  return NextResponse.json(citiesCache?.[country] || []);
}
