/**
 * Joins an honorific to a name without repeating it.
 *
 * The leadership records store the title inside the name as well
 * ("Rev. Duncan Nondi" with title "Rev."), so rendering `{title} {name}`
 * produced "Rev. Rev. Duncan Nondi" on the public About page and in the CMS.
 * Staff records keep them separate ("Mrs." + "Grace Wambua"), so the title
 * still has to be prepended there — hence a check rather than dropping it.
 */
export function displayName(title?: string, name?: string): string {
  const t = (title ?? '').trim();
  const n = (name ?? '').trim();
  if (!t) return n;
  if (!n) return t;
  // Already prefixed, in any casing.
  return n.toLowerCase().startsWith(t.toLowerCase()) ? n : `${t} ${n}`;
}
