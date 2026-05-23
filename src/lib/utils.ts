// Fonctions utilitaires partagées dans toute l'application

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fusionne les classes Tailwind de manière intelligente
 * Combine clsx (conditionnels) et tailwind-merge (déduplication)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Formate une date courte
 */
export function formatDateCourte(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Tronque un texte à une longueur max
 */
export function tronquer(texte: string, longueur: number): string {
  if (texte.length <= longueur) return texte
  return texte.slice(0, longueur).trim() + '...'
}

/**
 * Génère un slug depuis un titre
 */
export function creerSlug(titre: string): string {
  return titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Formate la taille d'un fichier en unités lisibles
 */
export function formatTailleFichier(octets: number): string {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`
  if (octets < 1024 * 1024 * 1024) return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
  return `${(octets / (1024 * 1024 * 1024)).toFixed(1)} Go`
}

/**
 * Extrait l'extension d'un nom de fichier
 */
export function getExtension(nomFichier: string): string {
  return nomFichier.split('.').pop()?.toLowerCase() ?? ''
}

/**
 * Vérifie si un fichier est un audio valide
 */
export function estAudio(nomFichier: string): boolean {
  return ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(getExtension(nomFichier))
}

/**
 * Vérifie si un fichier est une vidéo valide
 */
export function estVideo(nomFichier: string): boolean {
  return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(getExtension(nomFichier))
}

/**
 * Génère une URL d'image de couverture SVG basée sur le titre
 * Cette fonction génère un SVG inline en base64 comme placeholder
 */
export function genererImageCouvertureSvg(titre: string): string {
  // Couleurs mouridiya
  const couleurs = [
    ['#1a6f47', '#2da86c'],
    ['#185939', '#1f8a56'],
    ['#0a2919', '#1a6f47'],
  ]
  
  const idx = titre.length % couleurs.length
  const [couleur1, couleur2] = couleurs[idx]
  
  // Première lettre du titre pour l'ornement
  const initiale = titre.charAt(0).toUpperCase()
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${couleur1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${couleur2};stop-opacity:1" />
      </linearGradient>
      <pattern id="motif" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/>
        <path d="M0 20 L40 20 M20 0 L20 40" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="800" height="400" fill="url(#grad)"/>
    <rect width="800" height="400" fill="url(#motif)"/>
    <text x="400" y="180" text-anchor="middle" font-family="serif" font-size="80" fill="rgba(255,255,255,0.15)" font-weight="bold">${initiale}</text>
    <text x="400" y="220" text-anchor="middle" font-family="'Amiri', serif" font-size="24" fill="rgba(255,255,255,0.9)" letter-spacing="2">${titre.slice(0, 40)}</text>
    <text x="400" y="260" text-anchor="middle" font-family="serif" font-size="14" fill="rgba(255,255,255,0.6)" letter-spacing="4">T A A L I F</text>
    <line x1="300" y1="290" x2="500" y2="290" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>
    <text x="400" y="310" text-anchor="middle" font-family="'Amiri', serif" font-size="18" fill="rgba(212,175,55,0.7)">❖</text>
  </svg>`
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Calcule le temps de lecture estimé d'un texte
 */
export function tempsLecture(texte: string): string {
  const motsParMinute = 200
  const nbMots = texte.trim().split(/\s+/).length
  const minutes = Math.ceil(nbMots / motsParMinute)
  return `${minutes} min de lecture`
}

/**
 * Sécurise une URL de redirection pour éviter les redirections ouvertes
 */
export function securiserRedirection(url: string, base: string = '/'): string {
  try {
    const parsed = new URL(url, 'http://localhost')
    // On n'autorise que les chemins relatifs (même domaine)
    return parsed.pathname + parsed.search
  } catch {
    return base
  }
}
