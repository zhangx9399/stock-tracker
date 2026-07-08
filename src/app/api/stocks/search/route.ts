import { NextRequest, NextResponse } from 'next/server';
import { searchStock } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') || '';

  if (!keyword) {
    return NextResponse.json({ results: [] });
  }

  const results = searchStock(keyword);
  return NextResponse.json({ results });
}
