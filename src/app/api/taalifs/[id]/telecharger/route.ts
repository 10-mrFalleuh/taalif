export const dynamic = 'force-dynamic'
// API Route – Incrémenter le compteur de téléchargements
// POST /api/taalifs/[id]/telecharger

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifierLimite } from '@/lib/rate-limit'

interface Contexte { params: { id: string } }

// Fenêtre pendant laquelle un même utilisateur ne recompte pas le même taalif.
// Le compteur mesure un intérêt, pas des clics : sans cela n'importe qui
// pouvait le gonfler en boucle. La déduplication n'a pas besoin d'être stricte.
const FENETRE_DEDUP_MS = 60 * 60 * 1000 // 1h

export async function POST(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  // Un seul décompte par utilisateur et par taalif dans la fenêtre
  const dedup = await verifierLimite(
    `dl:${session.user.id}:${params.id}`,
    1,
    FENETRE_DEDUP_MS
  )

  try {
    if (dedup.autorise) {
      const taalif = await prisma.taalif.update({
        where: { id: params.id },
        data: { nbTelechargements: { increment: 1 } },
        select: { nbTelechargements: true },
      })
      return NextResponse.json({ nbTelechargements: taalif.nbTelechargements })
    }

    // Déjà compté récemment : on renvoie la valeur actuelle sans incrémenter
    const taalif = await prisma.taalif.findUnique({
      where: { id: params.id },
      select: { nbTelechargements: true },
    })
    return NextResponse.json({ nbTelechargements: taalif?.nbTelechargements ?? 0 })
  } catch {
    // On ne bloque jamais le téléchargement si l'incrémentation échoue
    return NextResponse.json({ nbTelechargements: null })
  }
}
