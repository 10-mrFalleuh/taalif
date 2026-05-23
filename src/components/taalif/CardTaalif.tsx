// Composant CardTaalif
// Affiche un taalif dans une carte (grille, liste, carrousel)

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Music, Video, Download, Calendar } from 'lucide-react'
import { formatDate, genererImageCouvertureSvg, tronquer } from '@/lib/utils'
import type { Taalif } from '@prisma/client'
import { cn } from '@/lib/utils'

interface PropsCardTaalif {
  taalif: Taalif
  compact?: boolean
  className?: string
}

// Icône et couleur selon le format
function BadgeFormat({ format }: { format: 'TEXTE' | 'AUDIO' | 'VIDEO' }) {
  const config = {
    TEXTE: {
      icone: BookOpen,
      label: 'Texte',
      classe: 'bg-vert-100 text-vert-700 border-vert-200',
      emoji: '📝',
    },
    AUDIO: {
      icone: Music,
      label: 'Audio',
      classe: 'bg-blue-50 text-blue-700 border-blue-200',
      emoji: '🎵',
    },
    VIDEO: {
      icone: Video,
      label: 'Vidéo',
      classe: 'bg-purple-50 text-purple-700 border-purple-200',
      emoji: '🎬',
    },
  }

  const { label, classe, emoji } = config[format]

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', classe)}>
      <span>{emoji}</span>
      {label}
    </span>
  )
}

export function CardTaalif({ taalif, compact = false, className }: PropsCardTaalif) {
  // Génération de l'image de couverture si absente
  const imageSrc = taalif.imageUrl ?? genererImageCouvertureSvg(taalif.titreFr)
  const imageEstBase64 = imageSrc.startsWith('data:')

  return (
    <Link
      href={`/taalifs/${taalif.id}`}
      className={cn(
        'group block bg-white rounded-xl border border-gray-100 overflow-hidden carte-hover shadow-sm hover:shadow-md hover:border-vert-200',
        className
      )}
    >
      {/* Image de couverture */}
      <div className={cn('relative overflow-hidden bg-vert-50', compact ? 'h-36' : 'h-48')}>
        <Image
          src={imageSrc}
          alt={taalif.titreFr}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={imageEstBase64}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badge format en haut à droite */}
        <div className="absolute top-3 left-3">
          <BadgeFormat format={taalif.format} />
        </div>

        {/* Compteur de téléchargements si > 0 */}
        {taalif.nbTelechargements > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            <Download className="w-3 h-3" />
            <span>{taalif.nbTelechargements}</span>
          </div>
        )}
      </div>

      {/* Corps de la carte */}
      <div className="p-4">
        {/* Titre en wolof/arabe */}
        <p className="font-arabic text-sm text-gray-400 mb-1 truncate" dir="rtl">
          {taalif.titreWolof}
        </p>

        {/* Titre en français */}
        <h3 className="font-serif font-semibold text-gray-900 group-hover:text-vert-700 transition-colors leading-snug mb-2">
          {tronquer(taalif.titreFr, compact ? 50 : 70)}
        </h3>

        {/* Extrait du texte français */}
        {!compact && taalif.texteFr && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3">
            {taalifDuJourExtrait(taalif.texteFr)}
          </p>
        )}

        {/* Footer de la carte : date + thème */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(taalif.dateCreation, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {taalif.theme && (
            <span className="px-2 py-0.5 bg-vert-50 text-vert-600 rounded-full truncate max-w-[120px]">
              {taalif.theme}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Extrait propre du texte (première strophe)
function taalifDuJourExtrait(texte: string): string {
  const lignes = texte.split('\n').filter((l) => l.trim())
  return lignes.slice(0, 3).join(' ')
}
