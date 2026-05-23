// API Route – Réinitialisation du mot de passe
// POST /api/auth/reinitialiser-mdp

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { schemaReinitialisationMdp } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = schemaReinitialisationMdp.safeParse(body)

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message ?? 'Données invalides'
      return NextResponse.json({ erreur: msg }, { status: 400 })
    }

    const { token, motDePasse } = validation.data

    // Rechercher l'utilisateur par token de reset
    const utilisateur = await prisma.user.findUnique({
      where: { tokenReset: token },
    })

    if (!utilisateur) {
      return NextResponse.json(
        { erreur: 'Lien de réinitialisation invalide ou déjà utilisé.' },
        { status: 400 }
      )
    }

    // Vérifier si le token n'est pas expiré (1h)
    if (!utilisateur.tokenResetExp || utilisateur.tokenResetExp < new Date()) {
      return NextResponse.json(
        { erreur: 'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const motDePasseHashe = await bcrypt.hash(motDePasse, 12)

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: utilisateur.id },
      data: {
        motDePasse: motDePasseHashe,
        tokenReset: null,
        tokenResetExp: null,
      },
    })

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès.' })
  } catch (err) {
    console.error('Erreur réinitialisation mdp:', err)
    return NextResponse.json({ erreur: 'Erreur serveur interne.' }, { status: 500 })
  }
}
