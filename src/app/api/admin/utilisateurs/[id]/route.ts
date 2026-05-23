// API Route – Gestion d'un utilisateur par ID
// PATCH /api/admin/utilisateurs/[id]  → changer le rôle

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
export const dynamic = 'force-dynamic'
interface Contexte { params: { id: string } }

const schemaRole = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

export async function PATCH(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  // Un admin ne peut pas se rétrograder lui-même
  if (params.id === session.user.id) {
    return NextResponse.json({ erreur: 'Vous ne pouvez pas modifier votre propre rôle.' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const validation = schemaRole.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ erreur: 'Rôle invalide' }, { status: 400 })
    }

    const utilisateur = await prisma.user.update({
      where: { id: params.id },
      data: { role: validation.data.role },
      select: { id: true, nom: true, email: true, role: true },
    })

    return NextResponse.json({ utilisateur })
  } catch {
    return NextResponse.json({ erreur: 'Utilisateur introuvable' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: Contexte) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })
  if (params.id === session.user.id) {
    return NextResponse.json({ erreur: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch {
    return NextResponse.json({ erreur: 'Utilisateur introuvable' }, { status: 404 })
  }
}
