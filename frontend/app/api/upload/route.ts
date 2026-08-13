import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { apiUrl } from '@/lib/apiBase';

/**
 * Issues a short-lived signature so the browser can upload straight to
 * Cloudinary.
 *
 * The file never passes through this function on purpose: Netlify caps a
 * function's request body at roughly 4.5 MB, and the cathedral's existing
 * clergy portraits run to 8.3 MB — proxying would fail on exactly the files
 * that matter most. The previous implementation wrote to the local filesystem,
 * which is read-only and ephemeral on Netlify, so uploads never worked in
 * production at all.
 *
 * Signed rather than an unsigned preset: an unsigned preset is an open write
 * endpoint against the account's quota, discoverable in the page source of a
 * public church website.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * The one folder an anonymous visitor may upload into: a CV attached to a job
 * application.
 *
 * Everything else still needs a CMS session. This is a public *branch*, not a
 * public endpoint — the distinction matters, because it is what keeps the
 * declined gallery photo-submission surface closed.
 */
const PUBLIC_FOLDER = 'applications';

/** Documents only on the public branch. Deliberately no image formats. */
const PUBLIC_FORMATS = 'pdf,doc,docx';

const PUBLIC_MAX_PER_WINDOW = 5;
const PUBLIC_WINDOW_MS = 15 * 60 * 1000;

/**
 * In-memory per-IP limiter for the public branch.
 *
 * The Express API has express-rate-limit, but the Cloudinary secret lives only
 * in the frontend environment, so signing cannot move there without adding
 * three more production variables. A serverless instance can be recycled or
 * duplicated, making this a speed bump rather than a wall — which is the right
 * weight for an endpoint that hands out a signature scoped to one folder and
 * three document formats.
 */
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < PUBLIC_WINDOW_MS);
  if (recent.length >= PUBLIC_MAX_PER_WINDOW) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (attempts.size > 5000) {
    for (const [key, times] of attempts) {
      if (!times.some((t) => now - t < PUBLIC_WINDOW_MS)) attempts.delete(key);
    }
  }
  return false;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const rawFolder = new URL(request.url).searchParams.get('folder') ?? 'gallery';
  const cleanFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'gallery';
  const isPublicUpload = cleanFolder === PUBLIC_FOLDER;

  if (isPublicUpload) {
    if (rateLimited(clientIp(request))) {
      return NextResponse.json(
        { error: 'Too many uploads from this connection. Please try again later.' },
        { status: 429 }
      );
    }
  } else {
    // Authenticate before anything else, so an anonymous caller learns nothing
    // about how the deployment is configured.
    //
    // Only signed-in CMS staff may upload. The backend is asked to validate the
    // token rather than verifying it here, so JWT_SECRET stays in one service.
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    try {
      const check = await fetch(apiUrl('/cms-users/me'), {
        headers: { Authorization: authorization },
        cache: 'no-store',
      });
      if (!check.ok) {
        return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Could not verify your session.' }, { status: 502 });
    }
  }

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: 'Uploads are not configured. Set the CLOUDINARY_* environment variables.' },
      { status: 501 }
    );
  }

  const folder = `ack/${cleanFolder}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signs the alphabetically sorted parameters, excluding file,
  // api_key and resource_type. Signing `allowed_formats` on the public branch
  // means Cloudinary itself rejects an image — a client-side check alone would
  // be trivially bypassed by replaying the signature with a different file.
  const params: Record<string, string> = { folder, timestamp: String(timestamp) };
  if (isPublicUpload) params.allowed_formats = PUBLIC_FORMATS;

  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signature = crypto.createHash('sha1').update(toSign + API_SECRET).digest('hex');

  return NextResponse.json({
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    folder,
    signature,
    ...(isPublicUpload ? { allowedFormats: PUBLIC_FORMATS } : {}),
  });
}
