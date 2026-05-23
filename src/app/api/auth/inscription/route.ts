export const dynamic = 'force-dynamic'
// API Route – Inscription d'un nouvel utilisateur
// POST /api/auth/inscription

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { schemaInscription } from '@/lib/validations'
import { envoyerEmailVerification } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Simple rate limiting en mémoire (remplacer par Redis en prod)
const tentatives = new Map<string, { count: number; dernier: number }>()
const LIMITE_TENTATIVES = 5
const FENETRE_MS = 15 * 60 * 1000 // 15 min

function verifierRateLimit(ip: string): boolean {
  const maintenant = Date.now()
  const record = tentatives.get(ip)
  if (!record || maintenant - record.dernier > FENETRE_MS) {
    tentatives.set(ip, { count: 1, dernier: maintenant })
    return true
  }
  if (record.count >= LIMITE_TENTATIVES) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!verifierRateLimit(ip)) {
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

    // Génération du token de vérification email (64 bytes aléatoires)
    const tokenVerification = crypto.randomBytes(32).toString('hex')
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h

    // Création de l'utilisateur
    const utilisateur = await prisma.user.create({
  data: {
    nom,
    email,
    motDePasse: motDePasseHashe,
    // En développement : email auto-vérifié
    // En production : mettre emailVerifie: false et envoyer le token
    emailVerifie: process.env.NODE_ENV === 'development',
    tokenVerification: process.env.NODE_ENV === 'development' ? null : tokenVerification,
    tokenExpiration: process.env.NODE_ENV === 'development' ? null : tokenExpiration,
  },
})

    // Envoi de l'email de vérification (non bloquant si ça échoue)
    try {
      await envoyerEmailVerification(email, nom, tokenVerification)
    } catch (erreurEmail) {
      console.error('Erreur envoi email vérification:', erreurEmail)
      // On ne fait pas échouer l'inscription pour ça
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
