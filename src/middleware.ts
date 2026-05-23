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
      // L'utilisateur est autorisé s'il a un token valide
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Routes protégées par le middleware
export const config = {
  matcher: [
    // Toutes les routes sauf auth, API auth et assets
    '/((?!login|register|forgot-password|reinitialiser-mdp|api/auth|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
