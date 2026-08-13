import { apiUrl, cmsAuthHeaders, clearCMSSession } from '@/lib/apiBase';

// Shared plumbing for the CMS content stores.
//
// The stores keep their original synchronous shape — `{ items, add, update,
// remove }` — so the CMS pages and public pages that consume them are unchanged.
// What differs is that mutations now write through to the server, and the
// initial data comes from MongoDB rather than a hardcoded seed.

export type WithId = { id: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...cmsAuthHeaders(),
      ...(init?.headers || {}),
    },
  });

  if (res.status === 401) {
    // The token expired or the account was deactivated. Drop the stale session
    // rather than leaving the user clicking Save against a server that will
    // keep refusing them.
    clearCMSSession();
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/cms')) {
      window.location.href = '/cms/login';
    }
    throw new Error('Your session has expired. Please sign in again.');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json as T;
}

export async function fetchAllContent(): Promise<Record<string, unknown>> {
  // no-store, deliberately. Without it the browser's HTTP cache serves a stale
  // copy for the lifetime of the cache header, so an editor who saves a change
  // and then views the site sees the old text and assumes the save failed.
  const json = await request<{ sections: Record<string, unknown> }>('/content', {
    cache: 'no-store',
  });
  return json.sections || {};
}

/* ------------------------------------------------------------------ inbox -- */

// Messages the public sends in. The permissions are the mirror image of
// content: anyone may write, only signed-in staff may read.

export type InboxKind = 'prayer' | 'contact';

export async function submitToInbox(kind: InboxKind, payload: Record<string, unknown>) {
  await request(`/inbox/${kind}`, {
    method: 'POST',
    // `website` is a honeypot: it stays hidden and empty for real people.
    body: JSON.stringify({ website: '', ...payload }),
  });
}

/**
 * Joins the bulletin mailing list.
 *
 * Public, like the inbox submit: rate-limited and honeypotted server-side.
 * Throws so the form can report a failure instead of showing a thank-you for a
 * subscription that never happened.
 */
export async function subscribe(email: string, name = ''): Promise<void> {
  await request('/subscribers', {
    method: 'POST',
    body: JSON.stringify({ email, name, website: '' }),
  });
}

/** Confirms an unsubscribe from a link in a bulletin. */
export async function unsubscribe(token: string): Promise<string> {
  const json = await request<{ email?: string }>('/subscribers/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return json.email ?? '';
}

export async function fetchInbox<T>(kind: InboxKind): Promise<T[]> {
  const json = await request<{ items: T[] }>(`/inbox/${kind}`);
  return json.items || [];
}

export async function updateInbox(kind: InboxKind, id: string, patch: Record<string, unknown>) {
  await request(`/inbox/${kind}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteInbox(kind: InboxKind, id: string) {
  await request(`/inbox/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/**
 * Sends a reply from the Cathedral address and returns the updated message.
 *
 * Deliberately not optimistic, unlike the list helpers below: the reply is only
 * recorded once the email has actually gone, so there is nothing to show until
 * the server says so.
 */
export async function replyToInbox<T>(kind: InboxKind, id: string, body: string): Promise<T> {
  const json = await request<{ item: T }>(`/inbox/${kind}/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
  return json.item;
}

/* ------------------------------------------------------------------ lists -- */

interface ListDeps<T> {
  get: () => T[];
  setList: (items: T[]) => void;
  setError: (message: string | null) => void;
}

/**
 * CRUD operations for a list-shaped section.
 *
 * Every mutation applies locally first and rolls back if the server rejects it.
 * On a Kenyan mobile connection a round trip is easily half a second, and an
 * editor who sees nothing happen tends to click Save again.
 */
export function listOps<T extends WithId>(section: string, deps: ListDeps<T>) {
  // `published` and `ministrySlug` are columns on the document, not part of its
  // free-form `data`. The server strips them from `data` on write, so they have
  // to travel at the top level of the request or they are silently dropped.
  function split(patch: Record<string, unknown>) {
    const { published, ministrySlug, ...data } = patch;
    const top: Record<string, unknown> = {};
    if (published !== undefined) top.published = published;
    if (ministrySlug !== undefined) top.ministrySlug = ministrySlug;
    return { data, top };
  }

  async function attempt(apply: () => T[], send: () => Promise<void>) {
    const snapshot = deps.get();
    deps.setList(apply());
    deps.setError(null);
    try {
      await send();
    } catch (err) {
      deps.setList(snapshot); // put the editor's view back to the truth
      deps.setError(err instanceof Error ? err.message : 'Could not save changes.');
    }
  }

  return {
    async add(item: Omit<T, 'id'> & { id?: string }, extra?: { ministrySlug?: string }) {
      const tempId = item.id || (globalThis.crypto?.randomUUID?.() ?? `tmp-${Date.now()}`);
      const optimistic = { ...item, id: tempId } as T;
      const { data, top } = split(item as Record<string, unknown>);

      await attempt(
        () => [...deps.get(), optimistic],
        async () => {
          const { item: saved } = await request<{ item: T }>(`/content/${section}`, {
            method: 'POST',
            body: JSON.stringify({ itemId: tempId, data, ...top, ...extra }),
          });
          // Replace the optimistic copy with the server's version, which carries
          // the canonical id and audit fields.
          deps.setList(deps.get().map((i) => (i.id === tempId ? saved : i)));
        }
      );
    },

    async update(id: string, patch: Partial<T>, extra?: { ministrySlug?: string }) {
      const { data, top } = split(patch as Record<string, unknown>);
      await attempt(
        () => deps.get().map((i) => (i.id === id ? { ...i, ...patch } : i)),
        async () => {
          await request(`/content/${section}/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ data, ...top, ...extra }),
          });
        }
      );
    },

    async remove(id: string) {
      await attempt(
        () => deps.get().filter((i) => i.id !== id),
        async () => {
          await request(`/content/${section}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        }
      );
    },

    async removeMany(ids: string[]) {
      if (!ids.length) return;
      const set = new Set(ids);
      await attempt(
        () => deps.get().filter((i) => !set.has(i.id)),
        async () => {
          const query = ids.map(encodeURIComponent).join(',');
          await request(`/content/${section}/?ids=${query}`, { method: 'DELETE' });
        }
      );
    },
  };
}

/* -------------------------------------------------------------- singleton -- */

interface SingletonDeps<T> {
  get: () => T;
  getVersion: () => number;
  setValue: (value: T, version?: number) => void;
  setError: (message: string | null) => void;
}

/**
 * A section that is one object rather than a list (giving details, contact
 * info, home page copy).
 *
 * Saves are debounced: these are edited through text inputs, and a request per
 * keystroke would be both wasteful and a good way to lose a version race with
 * yourself. `version` is the optimistic lock — if another admin saved while
 * this one was typing, the server returns 409 rather than silently discarding
 * their work.
 */
export function singletonOps<T extends object>(section: string, deps: SingletonDeps<T>, delay = 600) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<void> | null = null;

  async function push() {
    const body = JSON.stringify({ data: deps.get(), version: deps.getVersion() });
    try {
      const res = await request<{ data: T; version: number }>(`/content/${section}`, {
        method: 'PUT',
        body,
      });
      deps.setValue(res.data, res.version);
      deps.setError(null);
    } catch (err) {
      deps.setError(err instanceof Error ? err.message : 'Could not save changes.');
    }
  }

  return {
    // Merge a patch into local state and schedule a save.
    patch(patch: Partial<T>) {
      deps.setValue({ ...deps.get(), ...patch });
      deps.setError(null);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        inFlight = push();
      }, delay);
    },
    // Force any pending save immediately — call before navigating away.
    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        inFlight = push();
      }
      if (inFlight) await inFlight;
    },
  };
}
