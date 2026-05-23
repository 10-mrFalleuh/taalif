// API Route – Vérification d'email via token
// GET /api/auth/verifier-email?token=xxx

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=token_manquant', req.url))
  }

  try {
    const utilisateur = await prisma.user.findUnique({
      where: { tokenVerification: token },
    })

    if (!utilisateur) {
      return NextResponse.redirect(new URL('/login?error=token_invalide', req.url))
    }

    // Vérifier si le token n'est pas expiré
    if (utilisateur.tokenExpiration && utilisateur.tokenExpiration < new Date()) {
      return NextResponse.redirect(new URL('/login?error=token_expire', req.url))
    }

    // Marquer l'email comme vérifié et supprimer le token
    await prisma.user.update({
      where: { id: utilisateur.id },
      data: {
        emailVerifie: true,
        tokenVerification: null,
        tokenExpiration: null,
      },
    })

    return NextResponse.redirect(new URL('/login?verified=1', req.url))
  } catch (erreur) {
    console.error('Erreur vérification email:', erreur)
    return NextResponse.redirect(new URL('/login?error=serveur', req.url))
  }
}
