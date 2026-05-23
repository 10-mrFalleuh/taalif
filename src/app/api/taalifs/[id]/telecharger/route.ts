// API Route – Incrémenter le compteur de téléchargements
// POST /api/taalifs/[id]/telecharger

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Contexte { params: { id: string } }

export async function POST(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  try {
    await prisma.taalif.update({
      where: { id: params.id },
      data: { nbTelechargements: { increment: 1 } },
    })
    return NextResponse.json({ message: 'Compteur incrémenté' })
  } catch {
    // On ne bloque pas le téléchargement si l'incrémentation échoue
    return NextResponse.json({ message: 'Ok' })
  }
}
