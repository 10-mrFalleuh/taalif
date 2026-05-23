// API Route – Mot de passe oublié
// POST /api/auth/mot-de-passe-oublie

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { schemaMotDePasseOublie } from '@/lib/validations'
import { envoyerEmailReinitialisation } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = schemaMotDePasseOublie.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ erreur: 'Email invalide' }, { status: 400 })
    }

    const { email } = validation.data

    // On renvoie toujours un succès pour ne pas révéler si l'email existe
    const utilisateur = await prisma.user.findUnique({ where: { email } })

    if (utilisateur) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiration = new Date(Date.now() + 60 * 60 * 1000) // +1h

      await prisma.user.update({
        where: { id: utilisateur.id },
        data: { tokenReset: token, tokenResetExp: expiration },
      })

      try {
        await envoyerEmailReinitialisation(email, utilisateur.nom, token)
      } catch (err) {
        console.error('Erreur envoi email reset:', err)
      }
    }

    return NextResponse.json({ message: 'Si un compte existe, un email a été envoyé.' })
  } catch {
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}
