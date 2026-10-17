/**
 * Resolve API base URL for browser vs server.
 * On HTTPS pages, never call an HTTP backend (mixed content → Network Error).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim() || '';
    const normalized = configured.replace(/\/$/, '');

    if (
      window.location.protocol === 'https:' &&
      (!normalized || normalized.startsWith('http://'))
    ) {
      return '/api/v1';
    }

    return normalized || '/api/v1';
  }

  const serverConfigured =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';

  return (serverConfigured || 'http://localhost:4000/api/v1').replace(/\/$/, '');
}
