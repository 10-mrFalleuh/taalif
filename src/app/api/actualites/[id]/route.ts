// API Route – Actualité par ID
// PUT    /api/actualites/[id]  (ADMIN)
// DELETE /api/actualites/[id]  (ADMIN)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schemaActualite } from '@/lib/validations'
import type { CategorieActualite } from '@prisma/client'

interface Contexte { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Contexte) {
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

    const actualite = await prisma.actualite.update({
      where: { id: params.id },
      data: {
        titre, contenu,
        imageUrl: imageUrl ?? null,
        categorie: categorie as CategorieActualite,
        publiee,
        dateEvent: dateEvent ? new Date(dateEvent) : null,
      },
    })

    return NextResponse.json({ actualite })
  } catch {
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  try {
    await prisma.actualite.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Actualité supprimée' })
  } catch {
    return NextResponse.json({ erreur: 'Introuvable' }, { status: 404 })
  }
}
