export function getApiBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    '';

  // Browser: prefer absolute backend URL so large uploads bypass Next rewrite
  // (Next proxy times out ~30s and returns bare 500).
  if (typeof window !== 'undefined') {
    if (configured) {
      return configured.replace(/\/$/, '');
    }

    return '/api/v1';
  }

  return (configured || 'http://localhost:4000/api/v1').replace(/\/$/, '');
}
