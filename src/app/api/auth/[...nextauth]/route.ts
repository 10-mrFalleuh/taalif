export const dynamic = 'force-dynamic'
// Route NextAuth – gestion de toutes les actions d'auth

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
