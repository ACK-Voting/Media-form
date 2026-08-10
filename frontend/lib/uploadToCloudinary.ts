import { cmsAuthHeaders } from './apiBase';

// Browser-side upload helper. Returns the same three fields the old
// /api/upload route did, so the CMS pages that call it barely change.

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

export type UploadResult = {
  url: string;
  fileType: string;
  fileSize: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Ask Cloudinary to serve a modern format at a sensible size. The cathedral's
// portraits are multi-megabyte originals; without this every visitor on a phone
// downloads all of it. f_auto/q_auto typically turns an 8 MB JPEG into a WebP of
// a couple hundred KB, and the original stays untouched in the library.
function optimize(secureUrl: string): string {
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1600/');
}

/**
 * Uploads a file straight from the browser to Cloudinary.
 *
 * Throws on failure so callers can surface a real message — the previous code
 * ignored errors, leaving the editor looking at a form that silently did
 * nothing.
 */
export async function uploadFile(file: File, folder: string): Promise<UploadResult> {
  const isImage = IMAGE_TYPES.includes(file.type);
  const isDoc = file.type in DOC_TYPES;

  if (!isImage && !isDoc) {
    throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX');
  }

  const signRes = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    headers: cmsAuthHeaders(),
  });
  const signed = await signRes.json().catch(() => ({}));
  if (!signRes.ok) {
    throw new Error(signed.error || 'Could not start the upload.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signed.apiKey);
  form.append('timestamp', String(signed.timestamp));
  form.append('folder', signed.folder);
  form.append('signature', signed.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || 'Upload failed. Please try again.');
  }

  return {
    // Documents are delivered as-is; applying image transformations to a PDF
    // would rasterise it into a picture of page one.
    url: isImage ? optimize(json.secure_url) : json.secure_url,
    fileType: isDoc ? DOC_TYPES[file.type] : 'Image',
    fileSize: formatSize(file.size),
  };
}
