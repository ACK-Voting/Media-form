import { apiUrl, cmsAuthHeaders } from './apiBase';

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

/** CV types accepted from the public application form. No images. */
const CV_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

/** 5 MB. A CV that exceeds this is a scan, and the applicant can compress it. */
const CV_MAX_BYTES = 5 * 1024 * 1024;

export type CVUploadResult = {
  fileId: string;
  fileName: string;
  fileType: string;
};

/**
 * Uploads a CV from the public job application form.
 *
 * Unlike everything else here this does not touch Cloudinary. CVs are stored in
 * MongoDB and served only to a signed-in CMS user, because a Cloudinary
 * delivery URL is public to anyone holding it — and a CV carries a home
 * address, a phone number and an employment history. Cloudinary also blocks PDF
 * delivery by default, so the previous version stored CVs that nobody could
 * open.
 *
 * The file goes straight to the API rather than through a Next route, which on
 * Netlify would cap the body at roughly 4.5 MB.
 *
 * The checks below are for a readable error message; the server re-checks the
 * type from the file's leading bytes, which is the check that counts.
 */
export async function uploadApplicationCV(file: File): Promise<CVUploadResult> {
  if (!(file.type in CV_TYPES)) {
    throw new Error('Please upload your CV as a PDF or Word document.');
  }
  if (file.size > CV_MAX_BYTES) {
    throw new Error(`That file is ${formatSize(file.size)}. Please upload a CV under 5 MB.`);
  }

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(apiUrl('/get-involved/cv'), { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.fileId) {
    throw new Error(json.message || 'Upload failed. Please try again.');
  }

  return { fileId: json.fileId, fileName: json.fileName, fileType: json.fileType };
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
