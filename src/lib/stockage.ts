// Stockage des fichiers uploadés
//
// Deux pilotes, sélectionnés automatiquement :
//   • Cloudinary  si CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET sont définis
//   • Disque local sinon (public/uploads)
//
// Le disque local ne convient qu'au développement ou à un hébergement avec
// volume persistant (VPS). Sur une plateforme serverless — Vercel notamment —
// le système de fichiers est en lecture seule et éphémère, et `public/` est
// figé au build : les fichiers écrits à l'exécution sont perdus.
//
// L'API Cloudinary est appelée en REST signé, sans SDK : une dépendance de
// moins, et le même style que le limiteur de débit.

import { writeFile, mkdir } from 'fs/promises'
import crypto from 'crypto'
import path from 'path'
import type { FamilleFichier } from '@/lib/fichiers'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME
const CLE_API = process.env.CLOUDINARY_API_KEY
const SECRET_API = process.env.CLOUDINARY_API_SECRET

export const cloudinaryActif = Boolean(CLOUD && CLE_API && SECRET_API)

/** Sous-dossier utilisé pour chaque famille de fichier. */
const SOUS_DOSSIER: Record<FamilleFichier, string> = {
  image: 'images',
  audio: 'audio',
  video: 'video',
}

let avertissementEmis = false

function avertirStockageLocal() {
  if (avertissementEmis || process.env.NODE_ENV !== 'production') return
  avertissementEmis = true
  console.warn(
    '[stockage] Aucune configuration Cloudinary détectée : les fichiers sont ' +
      'écrits sur le disque local. Sur un hébergement serverless (Vercel), ils ' +
      'seront perdus au prochain démarrage. Définir CLOUDINARY_CLOUD_NAME, ' +
      'CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.'
  )
}

// ─── Pilote Cloudinary (REST signé) ────────────────────────────────

/**
 * Cloudinary signe la requête avec le SHA-1 des paramètres triés par ordre
 * alphabétique, concaténés en query string, suivis du secret d'API.
 * `api_key`, `file` et `resource_type` sont exclus de la signature.
 */
function signer(parametres: Record<string, string | number>): string {
  const aSigner = Object.keys(parametres)
    .sort()
    .map((cle) => `${cle}=${parametres[cle]}`)
    .join('&')

  return crypto.createHash('sha1').update(aSigner + SECRET_API).digest('hex')
}

async function envoyerVersCloudinary(
  buffer: Buffer,
  nomFichier: string,
  famille: FamilleFichier
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000)
  const dossier = `taalif/${SOUS_DOSSIER[famille]}`
  // Cloudinary ajoute lui-même l'extension à partir du contenu
  const identifiant = nomFichier.replace(/\.[^.]+$/, '')

  const parametres = { folder: dossier, public_id: identifiant, timestamp }
  const signature = signer(parametres)

  // Cloudinary classe l'audio sous la ressource « video »
  const typeRessource = famille === 'image' ? 'image' : 'video'

  const formulaire = new FormData()
  formulaire.append('file', new Blob([new Uint8Array(buffer)]), nomFichier)
  formulaire.append('api_key', CLE_API!)
  formulaire.append('timestamp', String(timestamp))
  formulaire.append('folder', dossier)
  formulaire.append('public_id', identifiant)
  formulaire.append('signature', signature)

  const reponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/${typeRessource}/upload`,
    { method: 'POST', body: formulaire, cache: 'no-store' }
  )

  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(`Cloudinary a répondu ${reponse.status} : ${detail.slice(0, 200)}`)
  }

  const resultat = (await reponse.json()) as { secure_url?: string }
  if (!resultat.secure_url) {
    throw new Error('Réponse Cloudinary sans secure_url')
  }

  return resultat.secure_url
}

// ─── Pilote local ──────────────────────────────────────────────────

async function ecrireEnLocal(
  buffer: Buffer,
  nomFichier: string,
  famille: FamilleFichier
): Promise<string> {
  avertirStockageLocal()

  const sousDossier = SOUS_DOSSIER[famille]
  const repDestination = path.join(process.cwd(), 'public', 'uploads', sousDossier)
  await mkdir(repDestination, { recursive: true })
  await writeFile(path.join(repDestination, nomFichier), buffer)

  return `/uploads/${sousDossier}/${nomFichier}`
}

// ─── API publique ──────────────────────────────────────────────────

/**
 * Enregistre le fichier et retourne son URL publique.
 * `nomFichier` doit avoir été généré côté serveur (cf. api/upload).
 */
export async function enregistrerFichier(
  buffer: Buffer,
  nomFichier: string,
  famille: FamilleFichier
): Promise<string> {
  if (cloudinaryActif) {
    return envoyerVersCloudinary(buffer, nomFichier, famille)
  }
  return ecrireEnLocal(buffer, nomFichier, famille)
}
