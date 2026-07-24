export const dynamic = 'force-dynamic'
// API Route – Renvoi de l'email de vérification
// POST /api/auth/renvoyer-verification
//
// L'envoi à l'inscription est volontairement non bloquant : si le SMTP est
// indisponible à cet instant, le compte est créé sans que l'email parte.
// Sans cette route, l'utilisateur resterait bloqué définitivement.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { schemaMotDePasseOublie } from '@/lib/validations'
import { envoyerEmailVerification } from '@/lib/email'
import { verifierLimite, extraireIp } from '@/lib/rate-limit'
import { genererToken } from '@/lib/tokens'
import { MSG_VERIFIEZ_VOS_EMAILS } from '@/lib/messages'

const LIMITE_DEMANDES = 3
const FENETRE_MS = 15 * 60 * 1000

export async function POST(req: NextRequest) {
  const ip = extraireIp(req.headers)
  const limite = await verifierLimite(`renvoi-verif:${ip}`, LIMITE_DEMANDES, FENETRE_MS)
  if (!limite.autorise) {
    return NextResponse.json({ erreur: 'Trop de demandes. Réessayez dans 15 minutes.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    // Même forme que « mot de passe oublié » : un simple email
    const validation = schemaMotDePasseOublie.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ erreur: 'Email invalide' }, { status: 400 })
    }

    const { email } = validation.data
    const utilisateur = await prisma.user.findUnique({ where: { email } })

    // Réponse identique dans tous les cas : ni l'existence du compte ni son
    // état d'activation ne doivent transparaître.
    if (utilisateur && !utilisateur.emailVerifie) {
      const token = genererToken()

      await prisma.user.update({
        where: { id: utilisateur.id },
        data: {
          tokenVerification: token.hache,
          tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
        },
      })

      try {
        await envoyerEmailVerification(email, utilisateur.nom, token.brut)
      } catch (err) {
        console.error('Erreur renvoi email vérification:', err)
      }
    }

    return NextResponse.json({ message: MSG_VERIFIEZ_VOS_EMAILS })
  } catch {
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}
