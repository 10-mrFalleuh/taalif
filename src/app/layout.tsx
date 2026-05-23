// Layout racine de l'application
// Configure les providers, polices et métadonnées globales

import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

export const metadata: Metadata = {
  title: {
    default: 'TAALIF – Poèmes de Cheikh Ahmadou Kara',
    template: '%s | TAALIF',
  },
  description:
    'Plateforme dédiée à la diffusion des taalifs (poèmes) de Cheikh Ahmadou Kara Mbacké sur Serigne Touba et le mouvement mouridiya.',
  keywords: ['taalif', 'mouridiya', 'Serigne Touba', 'khassida', 'Cheikh Ahmadou Kara', 'Touba'],
  authors: [{ name: 'TAALIF' }],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'TAALIF',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Polices Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
