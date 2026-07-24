export const dynamic = 'force-dynamic'
// API Route – Signature d'upload direct vers Cloudinary
// POST /api/upload/signature
//
// Ne transporte AUCUN fichier : elle renvoie une signature à usage unique que
// le navigateur utilise pour téléverser directement vers Cloudinary, ce qui
// contourne la limite de ~4,5 Mo des fonctions serverless Vercel.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cloudinaryActif, genererSignatureUpload } from '@/lib/stockage'
import type { FamilleFichier } from '@/lib/fichiers'

const FAMILLES: FamilleFichier[] = ['audio', 'video', 'image']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  let type: string
  try {
    ;({ type } = await req.json())
  } catch {
    return NextResponse.json({ erreur: 'Requête invalide' }, { status: 400 })
  }

  if (!FAMILLES.includes(type as FamilleFichier)) {
    return NextResponse.json({ erreur: 'Type de fichier invalide' }, { status: 400 })
  }

  // Cloudinary non configuré (développement local) : le client retombera sur
  // l'upload serveur classique (/api/upload) qui écrit sur le disque.
  if (!cloudinaryActif) {
    return NextResponse.json({ cloudinary: false })
  }

  return NextResponse.json({ cloudinary: true, ...genererSignatureUpload(type as FamilleFichier) })
}
