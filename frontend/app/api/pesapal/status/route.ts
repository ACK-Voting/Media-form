import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const trackingId = req.nextUrl.searchParams.get('trackingId');
    if (!trackingId) return NextResponse.json({ error: 'Missing trackingId' }, { status: 400 });

    const res = await fetch(`${BACKEND}/api/pesapal/status?trackingId=${encodeURIComponent(trackingId)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
