const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  if (!res.ok) throw new Error('Request failed: ' + path);
  return res.json();
}

export const api = {
  get: (path) => req(path),
  post: (path, body) => req(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) => req(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => req(path, { method: 'DELETE' }),
};

// Files (like uploaded documents) are served from the backend origin, not the frontend's.
const ORIGIN = BASE.replace(/\/api$/, '');
export const fileUrl = (relativePath) => ORIGIN + relativePath;
