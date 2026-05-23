export const dynamic = 'force-dynamic'
// API Route – Actualités
// GET  /api/actualites  → liste paginée (auth)
// POST /api/actualites  → créer (ADMIN)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schemaActualite } from '@/lib/validations'
import type { CategorieActualite } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limite = 9
  const categorie = searchParams.get('categorie') as CategorieActualite | null

  const where = {
    publiee: true,
    ...(categorie ? { categorie } : {}),
  }

  const [elements, total] = await Promise.all([
    prisma.actualite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.actualite.count({ where }),
  ])

  return NextResponse.json({ elements, total, page, totalPages: Math.ceil(total / limite) })
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
