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
 *
 * There is no public branch here. Applicant CVs briefly used one; they are now
 * stored in MongoDB and served only to signed-in staff, which both fixed
 * Cloudinary's default block on PDF delivery and took applicants' personal
 * details off a public URL. So this endpoint is CMS-only, and the site has no
 * anonymous upload path at all.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(request: NextRequest) {
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

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: 'Uploads are not configured. Set the CLOUDINARY_* environment variables.' },
      { status: 501 }
    );
  }

  const rawFolder = new URL(request.url).searchParams.get('folder') ?? 'gallery';
  const cleanFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'gallery';
  const folder = `ack/${cleanFolder}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signs the alphabetically sorted parameters, excluding file,
  // api_key and resource_type.
  const params: Record<string, string> = { folder, timestamp: String(timestamp) };

  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signature = crypto.createHash('sha1').update(toSign + API_SECRET).digest('hex');

  return NextResponse.json({ cloudName: CLOUD_NAME, apiKey: API_KEY, timestamp, folder, signature });
}
