/**
 * Admin guard utilities.
 * Checks the current user's email against ADMIN_EMAILS env var (comma-separated).
 * Used by both server API routes and the admin layout guard.
 */

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  if (!raw) return false;
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
