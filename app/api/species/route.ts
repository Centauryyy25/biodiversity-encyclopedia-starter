import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, hasSupabaseServiceRole } from '@/utils/supabase/admin';
import {
  normalizeSpeciesRecord,
  sanitizeSearchTerm,
  slugify,
  speciesPayloadSchema,
} from '@/lib/api/species-route-helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 24, 1), 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  const featured = searchParams.get('featured') === 'true';
  const kingdom = searchParams.get('kingdom');
  const iucnStatus = searchParams.get('iucn_status');
  const search = searchParams.get('search');

  // Preferred path: advanced search via RPC when a search term is provided
  if (search) {
    try {
      const term = sanitizeSearchTerm(search);
      if (term) {
        // 1) Call RPC to get ranked hits (id, rank, etc.)
        const { data: hits, error: rpcError } = await (supabaseAdmin as any).rpc(
          'search_species',
          { search_query: term }
        );

        if (!rpcError && Array.isArray(hits)) {
          // Keep original order (rank DESC in function). Build ordered id list.
          const orderedIds: string[] = (hits as any[]).map((h) => h.id).filter(Boolean);

          // 2) If there are extra filters, compute the allowed ids via a cheap filtered select.
          let filteredIds = orderedIds;
          if (kingdom || iucnStatus || featured) {
            let idFilterQuery = (supabaseAdmin as any)
              .from('species')
              .select('id')
              .in('id', orderedIds);
            if (featured) idFilterQuery = idFilterQuery.eq('featured', true);
            if (kingdom) idFilterQuery = idFilterQuery.ilike('kingdom', kingdom);
            if (iucnStatus) idFilterQuery = idFilterQuery.eq('iucn_status', iucnStatus);

            const { data: idRows, error: idErr } = await idFilterQuery;
            if (idErr) throw idErr;
            const allowed = new Set((idRows ?? []).map((r: any) => r.id));
            filteredIds = orderedIds.filter((id) => allowed.has(id));
          }

          const total = filteredIds.length;
          const pagedIds = filteredIds.slice(offset, offset + limit);

          // 3) Fetch full records for paged ids and order them to match rank order
          let detailsQuery = (supabaseAdmin as any)
            .from('species')
            .select('*')
            .in('id', pagedIds);

          const { data: details, error: detailsErr } = await detailsQuery;
          if (detailsErr) throw detailsErr;

          const byId = new Map((details ?? []).map((r: any) => [r.id, r]));
          const ordered = pagedIds.map((id) => byId.get(id)).filter(Boolean);
          const normalized = (ordered as any[]).map((rec) =>
            normalizeSpeciesRecord(rec as any)
          );

          return NextResponse.json({
            data: normalized,
            metadata: {
              count: total,
              limit,
              offset,
              filters: { featured, kingdom, iucnStatus, search: term },
              mode: 'rpc-search',
            },
          });
        }
      }
    } catch (e) {
      console.warn('RPC search failed, falling back to basic filter:', e);
      // fall through to basic query below
    }
  }

  // Fallback/basic query path (no search term or RPC unavailable)
  let query = (supabaseAdmin as any)
    .from('species')
    .select('*', { count: 'exact' })
    .order('featured', { ascending: false })
    .order('scientific_name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (featured) {
    query = query.eq('featured', true);
  }

  if (kingdom) {
    query = query.ilike('kingdom', kingdom);
  }

  if (iucnStatus) {
    query = query.eq('iucn_status', iucnStatus);
  }

  if (search) {
    const term = sanitizeSearchTerm(search);
    if (term) {
      query = query.or(`scientific_name.ilike.%${term}%,common_name.ilike.%${term}%`);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching species list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? []).map(normalizeSpeciesRecord);

  return NextResponse.json({
    data: normalized,
    metadata: {
      count: count ?? normalized.length,
      limit,
      offset,
      filters: {
        featured,
        kingdom,
        iucnStatus,
        search: search ?? null,
      },
      mode: 'basic-query',
    },
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!hasSupabaseServiceRole) {
    return NextResponse.json(
      {
        error:
          'Species creation requires SUPABASE_SERVICE_ROLE_KEY. Add it to your environment to enable this endpoint.',
      },
      { status: 503 }
    );
  }

  const body = await request.json();

  const parsed = speciesPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const slug = payload.slug ?? slugify(payload.scientific_name);

  const { data, error } = await (supabaseAdmin as any)
    .from('species')
    .insert([{ ...payload, slug }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating species:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: normalizeSpeciesRecord(data) }, { status: 201 });
}
