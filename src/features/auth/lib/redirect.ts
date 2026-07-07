export function sanitizeAuthRedirect(rawRedirect: unknown): string {
  if (typeof rawRedirect !== "string") {
    return "/";
  }

  const redirect = rawRedirect.trim();

  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(redirect)
  ) {
    return "/";
  }

  return redirect;
}
