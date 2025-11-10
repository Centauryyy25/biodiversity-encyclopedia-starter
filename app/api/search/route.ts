import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { sanitizeSearchTerm } from '@/lib/api/species-route-helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('q') || searchParams.get('query') || searchParams.get('search') || '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 6, 1), 25);

  const term = sanitizeSearchTerm(raw);
  if (!term) {
    return NextResponse.json({ data: [] });
  }

  try {
    const { data, error } = await (supabaseAdmin as any).rpc('search_species', {
      search_query: term,
    });

    if (error) {
      console.error('RPC search_species failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = Array.isArray(data) ? data.slice(0, limit) : [];
    return NextResponse.json({ data: results });
  } catch (e) {
    console.error('Search endpoint error:', e);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}

