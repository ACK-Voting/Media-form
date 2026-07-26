import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const trackingId = req.nextUrl.searchParams.get('OrderTrackingId') ?? '';
  const merchantRef = req.nextUrl.searchParams.get('OrderMerchantReference') ?? '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment Complete</title></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#f9fafb;">
  <p style="color:#6b7280;font-size:14px;">Processing payment…</p>
  <script>
    try {
      window.parent.postMessage(
        { type: 'pesapal-return', trackingId: ${JSON.stringify(trackingId)}, merchantRef: ${JSON.stringify(merchantRef)} },
        window.location.origin
      );
    } catch (e) {}
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
