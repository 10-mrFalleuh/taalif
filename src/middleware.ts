// Middleware Next.js - Protection des routes
// Redirige vers /login si l'utilisateur n'est pas authentifié
// Redirige vers / si un non-admin tente d'accéder à /admin

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Protection des routes admin : seuls les ADMIN peuvent y accéder
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Token valide ET compte toujours existant en base (cf. callback jwt)
      authorized: ({ token }) => !!token && !token.supprime,
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Routes protégées par le middleware
//
// `/api` est exclu volontairement : le middleware répond par une redirection
// 302 vers /login, ce qui renverrait du HTML à un client qui attend du JSON.
// Chaque route API applique elle-même getServerSession() et répond 401/403.
export const config = {
  matcher: [
    // Toutes les pages sauf les pages publiques, les API et les assets
    '/((?!login|register|forgot-password|reinitialiser-mdp|api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
