// API Route – Upload de fichiers audio/vidéo
// POST /api/upload
// En dev : stockage local dans public/uploads
// En prod : prévoir Cloudinary ou S3

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Types de fichiers autorisés
const TYPES_AUTORISES = {
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
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
    const type = (formData.get('type') as string)?.toLowerCase() as 'audio' | 'video' | 'image'

    if (!fichier) return NextResponse.json({ erreur: 'Aucun fichier fourni' }, { status: 400 })
    if (!['audio', 'video', 'image'].includes(type)) {
      return NextResponse.json({ erreur: 'Type de fichier invalide' }, { status: 400 })
    }

    // Vérification du type MIME
    const typesAutorises = TYPES_AUTORISES[type]
    if (!typesAutorises.includes(fichier.type)) {
      return NextResponse.json({ erreur: `Type MIME non autorisé : ${fichier.type}` }, { status: 400 })
    }

    // Vérification de la taille
    if (fichier.size > TAILLE_MAX[type]) {
      const maxMo = TAILLE_MAX[type] / (1024 * 1024)
      return NextResponse.json({ erreur: `Fichier trop volumineux. Maximum : ${maxMo} Mo` }, { status: 400 })
    }

    // Nom de fichier sécurisé (sans espaces, sans caractères spéciaux)
    const extension = fichier.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const nomFichier = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
    const sousRep = type === 'image' ? 'images' : type === 'audio' ? 'audio' : 'video'

    // Dossier de destination
    const repDestination = path.join(process.cwd(), 'public', 'uploads', sousRep)
    await mkdir(repDestination, { recursive: true })

    // Écriture du fichier
    const buffer = Buffer.from(await fichier.arrayBuffer())
    const cheminFichier = path.join(repDestination, nomFichier)
    await writeFile(cheminFichier, buffer)

    // URL publique
    const url = `/uploads/${sousRep}/${nomFichier}`

    return NextResponse.json({ url, nom: fichier.name, taille: fichier.size })
  } catch (err) {
    console.error('Erreur upload:', err)
    return NextResponse.json({ erreur: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
