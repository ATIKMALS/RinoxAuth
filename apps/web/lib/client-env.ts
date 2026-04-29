/**
 * Backend origin for browser-side fetch (forms, client pages).
 * Set `NEXT_PUBLIC_BACKEND_URL` in `.env` to match `BACKEND_BASE_URL` when not using localhost.
 */
export const CLIENT_BACKEND_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  "http://127.0.0.1:8000";
