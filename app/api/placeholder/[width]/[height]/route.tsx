import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

// Next.js 16: route handler context params are now a Promise
type Params = Promise<{ width: string; height: string }>;

const clampDimension = (value: number) => {
  if (!Number.isFinite(value)) return null;
  return Math.min(Math.max(Math.floor(value), 16), 2000);
};

export async function GET(request: NextRequest, context: { params: Params }) {
  const { width: widthParam, height: heightParam } = await context.params;
  const requestedWidth = Number(widthParam);
  const requestedHeight = Number(heightParam);

  const width = clampDimension(requestedWidth);
  const height = clampDimension(requestedHeight);

  if (!width || !height) {
    return new Response(JSON.stringify({ error: 'Invalid placeholder dimensions' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const label = searchParams.get('text') ?? `${width}x${height}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B2B26, #163832)',
          color: '#DAF1DE',
          fontSize: Math.max(Math.min(width, height) / 8, 24),
          fontFamily: 'Inter, Arial, sans-serif',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
    ),
    { width, height }
  );
}
