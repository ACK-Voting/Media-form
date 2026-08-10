// Server-side backend origin, for Next route handlers that proxy to Express.
//
// BACKEND_URL was referenced by four payment routes but set nowhere, so they all
// silently fell back to localhost and payments broke in production. Falling back
// to NEXT_PUBLIC_API_URL (minus its /api suffix) means setting one variable is
// enough, while BACKEND_URL still wins if the backend is reachable at a
// different address from inside the deployment.
export const BACKEND_ORIGIN = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:3000'
).replace(/\/$/, '');
