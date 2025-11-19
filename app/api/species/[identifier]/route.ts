import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseLean, hasServiceRole } from '@/utils/supabase/lean-admin';
import {
  normalizeSpeciesRecord,
  slugify,
  speciesUpdateSchema,
} from '@/lib/api/species-route-helpers';
import type { SpeciesWithDetails, Species } from '@/types/species';
import type { Tables, TablesUpdate } from '@/types/database.types';
type TaxonomyRow = Tables<'taxonomy_hierarchy'> | null;
type ConservationRow = Tables<'conservation_data'> | null;
type SpeciesImageRow = Tables<'species_images'>;
type SpeciesUpdate = TablesUpdate<'species'>;

// Next.js 16: route handler context params are now a Promise
type Params = Promise<{ identifier: string }>;

const isUuid = (value: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value
  );

const resolveIdentifierColumn = (identifier: string) =>
  isUuid(identifier) ? 'id' : 'slug';

const enrichSpeciesRecord = async (speciesId: string) => {
  const [{ data: taxonomy }, { data: conservation }, { data: images }] = await Promise.all([
    supabaseLean
      .from('taxonomy_hierarchy')
      .select('*')
      .eq('species_id', speciesId)
      .maybeSingle(),
    supabaseLean
      .from('conservation_data')
      .select('*')
      .eq('species_id', speciesId)
      .maybeSingle(),
    supabaseLean
      .from('species_images')
      .select('*')
      .eq('species_id', speciesId)
      .order('sort_order', { ascending: true }),
  ]);

  return {
    taxonomy: taxonomy as TaxonomyRow,
    conservation: conservation as ConservationRow,
    images: (images ?? []) as SpeciesImageRow[],
  };
};

export async function GET(_request: NextRequest, context: { params: Params }) {
  const { identifier } = await context.params;
  const column = resolveIdentifierColumn(identifier);

  const { data: species, error } = await supabaseLean
    .from('species')
    .select('*')
    .eq(column, identifier)
    .single();

  if (error || !species) {
    return NextResponse.json({ error: 'Species not found' }, { status: 404 });
  }

  const extras = await enrichSpeciesRecord(species.id);
  const normalized = normalizeSpeciesRecord(species as Species);

  return NextResponse.json({
    data: {
      ...(normalized as SpeciesWithDetails),
      ...extras,
    },
  });
}

export async function PUT(request: NextRequest, context: { params: Params }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!hasServiceRole) {
    return NextResponse.json(
      {
        error:
          'Species updates require SUPABASE_SERVICE_ROLE_KEY. Add it to your environment to enable this endpoint.',
      },
      { status: 503 }
    );
  }

  const { identifier } = await context.params;
  const column = resolveIdentifierColumn(identifier);

  const body = await request.json();
  const parsed = speciesUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates = parsed.data;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  if (updates.scientific_name && !updates.slug) {
    updates.slug = slugify(updates.scientific_name);
  }

  const speciesUpdate: SpeciesUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseLean
    .from('species')
    .update(speciesUpdate)
    .eq(column, identifier)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error updating species:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Species not found' },
      { status: error ? 500 : 404 }
    );
  }

  const extras = await enrichSpeciesRecord(data.id);

  return NextResponse.json({
    data: {
      ...(normalizeSpeciesRecord(data as Species) as SpeciesWithDetails),
      ...extras,
    },
  });
}
