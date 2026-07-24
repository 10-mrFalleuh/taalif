// API Route – Upload de fichiers audio/vidéo/image
// POST /api/upload
// La destination (Cloudinary ou disque local) est choisie par lib/stockage.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { detecterType, type FamilleFichier } from '@/lib/fichiers'
import { enregistrerFichier } from '@/lib/stockage'
import crypto from 'crypto'

// Types réellement acceptés, par famille. La vérification porte sur le type
// détecté dans le contenu du fichier, pas sur celui déclaré par le client.
const TYPES_AUTORISES: Record<FamilleFichier, string[]> = {
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}

// Taille max : 100 Mo pour vidéo, 20 Mo pour audio, 5 Mo pour image
const TAILLE_MAX = {
  audio: 20 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  image: 5 * 1024 * 1024,
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ erreur: 'Accès refusé' }, { status: 403 })

  try {
    const formData = await req.formData()
    const fichier = formData.get('fichier') as File | null
    const type = (formData.get('type') as string)?.toLowerCase() as FamilleFichier

    if (!fichier) return NextResponse.json({ erreur: 'Aucun fichier fourni' }, { status: 400 })
    if (!['audio', 'video', 'image'].includes(type)) {
      return NextResponse.json({ erreur: 'Type de fichier invalide' }, { status: 400 })
    }

    // Vérification de la taille avant de charger le contenu en mémoire
    if (fichier.size > TAILLE_MAX[type]) {
      const maxMo = TAILLE_MAX[type] / (1024 * 1024)
      return NextResponse.json({ erreur: `Fichier trop volumineux. Maximum : ${maxMo} Mo` }, { status: 400 })
    }

    const buffer = Buffer.from(await fichier.arrayBuffer())

    // Identification par signature binaire : ni le type MIME déclaré ni le nom
    // du fichier ne sont pris en compte. Une signature inconnue est rejetée.
    const detecte = detecterType(buffer)
    if (!detecte) {
      return NextResponse.json(
        { erreur: 'Format de fichier non reconnu ou non autorisé.' },
        { status: 400 }
      )
    }
    if (detecte.famille !== type || !TYPES_AUTORISES[type].includes(detecte.mime)) {
      return NextResponse.json(
        { erreur: `Le contenu du fichier est de type ${detecte.mime}, incompatible avec un envoi ${type}.` },
        { status: 400 }
      )
    }

    // Nom de fichier entièrement généré côté serveur : l'extension vient de la
    // signature détectée, ce qui interdit d'écrire un .html ou un .svg servi
    // ensuite sur le même domaine.
    const nomFichier = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${detecte.extension}`

    // Cloudinary si configuré, disque local sinon
    const url = await enregistrerFichier(buffer, nomFichier, type)

    return NextResponse.json({ url, nom: nomFichier, taille: fichier.size, type: detecte.mime })
  } catch (err) {
    console.error('Erreur upload:', err)
    return NextResponse.json({ erreur: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
