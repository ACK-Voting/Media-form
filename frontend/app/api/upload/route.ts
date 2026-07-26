import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const DOC_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawFolder = searchParams.get('folder') ?? 'gallery';
  const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '');

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isDoc = file.type in DOC_TYPES;

  if (!isImage && !isDoc) {
    return NextResponse.json(
      { error: 'Unsupported file type. Allowed: JPEG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX' },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  const dir = path.join(process.cwd(), `public/uploads/${folder}`);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
  } catch {
    // Serverless hosts (Netlify/Vercel) have a read-only, ephemeral filesystem
    return NextResponse.json(
      { error: 'File uploads are not available on the live site yet — files can only be uploaded when running locally. Cloud storage is coming with the backend integration.' },
      { status: 501 }
    );
  }

  return NextResponse.json({
    url: `/uploads/${folder}/${filename}`,
    fileType: isDoc ? DOC_TYPES[file.type] : 'Image',
    fileSize: formatSize(file.size),
  });
}
