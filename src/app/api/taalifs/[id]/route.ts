// API Route – Taalif par ID
// GET    /api/taalifs/[id]
// PUT    /api/taalifs/[id]  (ADMIN)
// DELETE /api/taalifs/[id]  (ADMIN)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { schemaTaalif } from '@/lib/validations'
import { genererImageCouvertureSvg } from '@/lib/utils'
import { supprimerFichier } from '@/lib/stockage'
import type { FormatTaalif } from '@prisma/client'

interface Contexte { params: { id: string } }

// ─── GET ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const taalif = await prisma.taalif.findUnique({ where: { id: params.id } })
  if (!taalif) return NextResponse.json({ erreur: 'Taalif introuvable' }, { status: 404 })

  return NextResponse.json({ taalif })
}

// ─── PUT ──────────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Contexte) {
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

    if (data.estTaalifDuJour) {
      await prisma.taalif.updateMany({
        where: { id: { not: params.id } },
        data: { estTaalifDuJour: false },
      })
    }

    const imageUrl = data.imageUrl || genererImageCouvertureSvg(data.titreFr)

    const taalif = await prisma.taalif.update({
      where: { id: params.id },
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

    return NextResponse.json({ taalif })
  } catch (err) {
    console.error('Erreur mise à jour taalif:', err)
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  try {
    // On lit les URL avant de supprimer la ligne, pour pouvoir nettoyer
    // ensuite le fichier média et l'éventuelle image de couverture.
    const taalif = await prisma.taalif.findUnique({
      where: { id: params.id },
      select: { fichierUrl: true, imageUrl: true },
    })
    if (!taalif) {
      return NextResponse.json({ erreur: 'Taalif introuvable' }, { status: 404 })
    }

    await prisma.taalif.delete({ where: { id: params.id } })

    // Purge de la référence « taalif du jour » si elle pointait sur celui-ci :
    // sans cela la section disparaissait silencieusement de l'accueil.
    await prisma.parametre.updateMany({
      where: { taalifDuJourId: params.id },
      data: { taalifDuJourId: null },
    })

    // Nettoyage des fichiers (best-effort, ne bloque pas la réponse en cas d'échec)
    await Promise.all([
      supprimerFichier(taalif.fichierUrl),
      supprimerFichier(taalif.imageUrl),
    ])

    return NextResponse.json({ message: 'Taalif supprimé' })
  } catch {
    return NextResponse.json({ erreur: 'Erreur serveur' }, { status: 500 })
  }
}
