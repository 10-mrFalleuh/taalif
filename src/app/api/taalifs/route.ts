// API Route – Taalifs
// GET /api/taalifs  → liste paginée
// POST /api/taalifs → créer (ADMIN seulement)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schemaTaalif, schemaFiltreTaalif } from '@/lib/validations'
import { genererImageCouvertureSvg } from '@/lib/utils'
import type { FormatTaalif } from '@prisma/client'

// ─── GET : liste des taalifs ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const params = Object.fromEntries(searchParams)

  const validation = schemaFiltreTaalif.safeParse(params)
  if (!validation.success) {
    return NextResponse.json({ erreur: 'Paramètres invalides' }, { status: 400 })
  }

  const { format, theme, q, page, limite, tri } = validation.data

  const where: Record<string, unknown> = {}
  if (format) where.format = format as FormatTaalif
  if (theme) where.theme = { contains: theme, mode: 'insensitive' }
  if (q) {
    where.OR = [
      { titreFr: { contains: q, mode: 'insensitive' } },
      { titreWolof: { contains: q, mode: 'insensitive' } },
      { texteFr: { contains: q, mode: 'insensitive' } },
    ]
  }

  const orderBy =
    tri === 'date_asc' ? { dateCreation: 'asc' as const }
    : tri === 'titre_asc' ? { titreFr: 'asc' as const }
    : { dateCreation: 'desc' as const }

  const [elements, total] = await Promise.all([
    prisma.taalif.findMany({ where, orderBy, skip: (page - 1) * limite, take: limite }),
    prisma.taalif.count({ where }),
  ])

  return NextResponse.json({
    elements,
    total,
    page,
    totalPages: Math.ceil(total / limite),
    limite,
  })
}

// ─── POST : créer un taalif ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  try {
    const body = await req.json()
    const validation = schemaTaalif.safeParse(body)

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message ?? 'Données invalides'
      return NextResponse.json({ erreur: msg }, { status: 400 })
    }

    const data = validation.data

    // Si Taalif du jour sélectionné : désélectionner les autres
    if (data.estTaalifDuJour) {
      await prisma.taalif.updateMany({ data: { estTaalifDuJour: false } })
    }

    // Génération auto de l'image si absente
    const imageUrl = data.imageUrl || genererImageCouvertureSvg(data.titreFr)

    const taalif = await prisma.taalif.create({
      data: {
        titreWolof: data.titreWolof,
        titreFr: data.titreFr,
        texteWolof: data.texteWolof ?? null,
        texteFr: data.texteFr ?? null,
        format: data.format as FormatTaalif,
        fichierUrl: data.fichierUrl ?? null,
        imageUrl,
        auteur: data.auteur,
        theme: data.theme ?? null,
        tags: data.tags,
        estTaalifDuJour: data.estTaalifDuJour,
      },
    })

    return NextResponse.json({ taalif }, { status: 201 })
  } catch (err) {
    console.error('Erreur création taalif:', err)
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}
