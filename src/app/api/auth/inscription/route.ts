export const dynamic = 'force-dynamic'
// API Route – Inscription d'un nouvel utilisateur
// POST /api/auth/inscription

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { schemaInscription } from '@/lib/validations'
import { envoyerEmailVerification } from '@/lib/email'
import { verifierLimite, extraireIp } from '@/lib/rate-limit'
import { genererToken } from '@/lib/tokens'
import bcrypt from 'bcryptjs'

const LIMITE_TENTATIVES = 5
const FENETRE_MS = 15 * 60 * 1000 // 15 min

export async function POST(req: NextRequest) {
  // Rate limiting (partagé, adossé à Redis si configuré)
  const ip = extraireIp(req.headers)
  const limite = await verifierLimite(`inscription:${ip}`, LIMITE_TENTATIVES, FENETRE_MS)
  if (!limite.autorise) {
    return NextResponse.json({ erreur: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 })
  }

  try {
    const body = await req.json()

    // Validation Zod
    const validation = schemaInscription.safeParse(body)
    if (!validation.success) {
      const premierreErreur = validation.error.errors[0]?.message ?? 'Données invalides'
      return NextResponse.json({ erreur: premierreErreur }, { status: 400 })
    }

    const { nom, email, motDePasse } = validation.data

    // Vérifier si l'email existe déjà
    const existant = await prisma.user.findUnique({ where: { email } })
    if (existant) {
      // Message volontairement vague pour sécurité
      return NextResponse.json(
        { erreur: 'Un compte avec cet email existe déjà.' },
        { status: 409 }
      )
    }

    // Hash du mot de passe (coût 12 = bon équilibre sécurité/perf)
    const motDePasseHashe = await bcrypt.hash(motDePasse, 12)

    // Génération du token de vérification email (32 octets aléatoires).
    // Seule l'empreinte est stockée ; le token brut part par email.
    const token = genererToken()
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h

    // En développement, l'email est auto-vérifié pour ne pas dépendre du SMTP.
    const autoVerifie = process.env.NODE_ENV === 'development'

    // Création de l'utilisateur
    const utilisateur = await prisma.user.create({
      data: {
        nom,
        email,
        motDePasse: motDePasseHashe,
        emailVerifie: autoVerifie,
        tokenVerification: autoVerifie ? null : token.hache,
        tokenExpiration: autoVerifie ? null : tokenExpiration,
      },
    })

    // Envoi de l'email de vérification (non bloquant si ça échoue :
    // l'utilisateur pourra le redemander via /api/auth/renvoyer-verification)
    if (!autoVerifie) {
      try {
        await envoyerEmailVerification(email, nom, token.brut)
      } catch (erreurEmail) {
        console.error('Erreur envoi email vérification:', erreurEmail)
      }
    }

    return NextResponse.json(
      { message: 'Compte créé. Vérifiez votre email pour l\'activer.', id: utilisateur.id },
      { status: 201 }
    )
  } catch (erreur) {
    console.error('Erreur inscription:', erreur)
    return NextResponse.json({ erreur: 'Erreur serveur interne.' }, { status: 500 })
  }
}
