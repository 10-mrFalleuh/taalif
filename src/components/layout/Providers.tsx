'use client'
// Composant Providers - enveloppe les providers côté client
// SessionProvider de NextAuth nécessite un Client Component

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'

interface PropsProviders {
  children: React.ReactNode
}

export function Providers({ children }: PropsProviders) {
  return (
    <SessionProvider>
      {children}
      {/* Système de notifications toast */}
      <Toaster />
    </SessionProvider>
  )
}
