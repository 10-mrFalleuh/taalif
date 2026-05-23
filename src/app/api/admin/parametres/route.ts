// API Route – Paramètres admin
// GET /api/admin/parametres
// PUT /api/admin/parametres

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schemaParametres } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const parametres = await prisma.parametre.findFirst({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ parametres })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  try {
    const body = await req.json()
    const validation = schemaParametres.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ erreur: validation.error.errors[0]?.message }, { status: 400 })
    }

    const { nomMouvement, descriptionMouvement, taalifDuJourId } = validation.data

    // Upsert : crée ou met à jour le seul enregistrement de paramètres
    const parametres = await prisma.parametre.upsert({
      where: { id: 'parametres-uniques' },
      update: { nomMouvement, descriptionMouvement, taalifDuJourId: taalifDuJourId ?? null },
      create: { id: 'parametres-uniques', nomMouvement, descriptionMouvement, taalifDuJourId: taalifDuJourId ?? null },
    })

    return NextResponse.json({ parametres })
  } catch (err) {
    console.error('Erreur paramètres:', err)
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}
