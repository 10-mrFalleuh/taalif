export const dynamic = 'force-dynamic'
// API Route – Actualités
// GET  /api/actualites  → liste paginée (auth)
// POST /api/actualites  → créer (ADMIN)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schemaActualite } from '@/lib/validations'
import { listerActualites, normaliserCategorie } from '@/lib/requetes/actualites'
import type { CategorieActualite } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const { searchParams } = req.nextUrl

  // Même construction de requête que la page /actualites
  const resultat = await listerActualites({
    categorie: normaliserCategorie(searchParams.get('categorie')),
    page: Math.max(1, parseInt(searchParams.get('page') ?? '1')),
  })

  return NextResponse.json(resultat)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  try {
    const body = await req.json()
    const validation = schemaActualite.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ erreur: validation.error.errors[0]?.message ?? 'Données invalides' }, { status: 400 })
    }

    const { titre, contenu, imageUrl, categorie, publiee, dateEvent } = validation.data

    const actualite = await prisma.actualite.create({
      data: {
        titre,
        contenu,
        imageUrl: imageUrl ?? null,
        categorie: categorie as CategorieActualite,
        publiee,
        dateEvent: dateEvent ? new Date(dateEvent) : null,
      },
    })

    return NextResponse.json({ actualite }, { status: 201 })
  } catch (err) {
    console.error('Erreur création actualité:', err)
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}
