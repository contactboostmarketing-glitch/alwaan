/** @type {import("next").NextConfig} */
// En-têtes de sécurité sur toutes les pages : HTTPS forcé, pas d'affichage du site dans un cadre tiers
// (anti-clickjacking), pas de détection de type, référent limité, capteurs du navigateur désactivés.
const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
];
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() { return [{ source: '/a-propos', destination: '/notre-atelier', permanent: true }]; },
  async headers() { return [{ source: '/:path*', headers: SECURITY_HEADERS }]; },
};
