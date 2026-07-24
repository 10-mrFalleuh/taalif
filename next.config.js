/** @type {import('next').NextConfig} */

const estProd = process.env.NODE_ENV === 'production'

// Content-Security-Policy
//
// script-src conserve 'unsafe-inline' : sans infrastructure de nonce (qui
// exigerait de générer le CSP par requête dans le middleware et de couvrir
// aussi les pages publiques exclues du matcher), les scripts d'hydratation de
// Next seraient bloqués. La CSP reste néanmoins une défense en profondeur
// utile — le vecteur de XSS stockée par upload est fermé à la source
// (validation par signature binaire) — et verrouille tout le reste : origines
// des images, médias, polices, connexions, ainsi que base-uri et form-action.
//
// En développement, Next a besoin de 'unsafe-eval' (HMR) et de WebSockets.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${estProd ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.amazonaws.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "media-src 'self' https://res.cloudinary.com",
  // api.cloudinary.com : upload direct navigateur → Cloudinary (voir le
  // formulaire admin). Sans cette autorisation, la CSP bloque l'envoi.
  `connect-src 'self' https://api.cloudinary.com${estProd ? '' : ' ws:'}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(estProd ? ['upgrade-insecure-requests'] : []),
].join('; ')

const entetesSecurite = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Désactive des API navigateur que l'application n'utilise pas
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
]

// HSTS : n'a d'effet que sur HTTPS. Ajouté uniquement en production pour ne
// pas épingler « HTTPS obligatoire » sur http://localhost en développement.
if (estProd) {
  entetesSecurite.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  })
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: entetesSecurite,
      },
    ]
  },
}

module.exports = nextConfig