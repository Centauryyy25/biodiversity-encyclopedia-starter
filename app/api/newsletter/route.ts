import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, hasSupabaseServiceRole } from '@/utils/supabase/admin';

const signupSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  topic: z.string().max(120).optional(),
  source: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  if (!hasSupabaseServiceRole) {
    return NextResponse.json(
      { error: 'Newsletter signups require SUPABASE_SERVICE_ROLE_KEY to be configured.' },
      { status: 503 }
    );
  }

  const payload = await request.json().catch(() => null);

  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.email?.[0] ?? 'Invalid request payload.' },
      { status: 400 }
    );
  }

  const { email, topic, source } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabaseAdmin
    .from('newsletter_signups')
    .upsert(
      [
        {
          email: normalizedEmail,
          topic: topic ?? null,
          source: source ?? 'homepage',
        },
      ],
      { onConflict: 'email' }
    )
    .select('id, email, created_at')
    .single();

  if (error) {
    console.error('Newsletter signup failed:', error);
    return NextResponse.json({ error: 'Unable to subscribe right now. Please try again later.' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Subscribed successfully',
    data,
  });
}
