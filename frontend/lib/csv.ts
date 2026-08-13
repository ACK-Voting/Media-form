/**
 * Shared CSV export.
 *
 * Lives here rather than in lib/export.ts because both the media app and the
 * church CMS need it, and export.ts is otherwise all media-team specific. This
 * repo already had two hand-rolled CSV writers; a third would have been the
 * point at which they started disagreeing about quoting.
 */

/** Quotes a field only when it would otherwise break the row. */
export function escapeCSVField(field: unknown): string {
  if (field === null || field === undefined) return '';

  const value = String(field);
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Builds the CSV text. Separated from the download so it can be tested. */
export function toCSV<T>(data: T[], headers: string[], rowMapper: (item: T) => unknown[]): string {
  const rows = data.map((item) => rowMapper(item).map(escapeCSVField).join(','));
  return [headers.join(','), ...rows].join('\n');
}

/** Builds the CSV and hands it to the browser as a dated download. */
export function exportDataToCSV<T>(
  data: T[],
  headers: string[],
  rowMapper: (item: T) => unknown[],
  filename: string
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // A BOM, so Excel opens the file as UTF-8 rather than mangling any name with
  // an accent in it.
  const blob = new Blob(['﻿', toCSV(data, headers, rowMapper)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
