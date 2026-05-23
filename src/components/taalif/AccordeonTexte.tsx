'use client'
// Composant AccordéonTexte
// Affiche le titre + image d'un taalif texte, et déplie le texte complet au clic

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropsAccordeonTexte {
  titreWolof: string
  titreFr: string
  texteWolof?: string | null
  texteFr?: string | null
  imageUrl?: string | null
}

export function AccordeonTexte({
  titreWolof,
  titreFr,
  texteWolof,
  texteFr,
  imageUrl,
}: PropsAccordeonTexte) {
  const [ouvert, setOuvert] = useState(false)
  const [ongletActif, setOngletActif] = useState<'wolof' | 'fr'>('fr')

  const aTexte = texteWolof || texteFr

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* ─── En-tête cliquable ───────────────────────────────── */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className="w-full text-left group"
        aria-expanded={ouvert}
        aria-label={ouvert ? 'Réduire le texte' : 'Lire le texte complet'}
      >
        <div className="flex items-start gap-0">
          {/* Image de couverture */}
          {imageUrl && (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden">
              <Image
                src={imageUrl}
                alt={titreFr}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized={imageUrl.startsWith('data:')}
              />
            </div>
          )}

          <div className="flex-1 p-5 sm:p-6">
            {/* Titre arabe */}
            <p className="font-arabic text-base text-gray-500 mb-1" dir="rtl">
              {titreWolof}
            </p>
            
            {/* Titre français */}
            <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-vert-700 transition-colors leading-snug">
              {titreFr}
            </h3>

            {/* Indicateur d'état */}
            <div className="flex items-center gap-2 mt-3">
              <div className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors',
                ouvert ? 'text-vert-600' : 'text-gray-400 group-hover:text-vert-500'
              )}>
                <BookOpen className="w-4 h-4" />
                <span>{ouvert ? 'Réduire' : 'Lire le texte complet'}</span>
                {ouvert ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ─── Contenu déplié ──────────────────────────────────── */}
      {ouvert && aTexte && (
        <div className="border-t border-gray-100 animate-entree">
          {/* Onglets Wolof / Français si les deux sont disponibles */}
          {texteWolof && texteFr && (
            <div className="flex border-b border-gray-100 bg-gray-50">
              <button
                onClick={() => setOngletActif('fr')}
                className={cn(
                  'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                  ongletActif === 'fr'
                    ? 'bg-white text-vert-700 border-b-2 border-vert-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                🇫🇷 Traduction française
              </button>
              <button
                onClick={() => setOngletActif('wolof')}
                className={cn(
                  'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                  ongletActif === 'wolof'
                    ? 'bg-white text-vert-700 border-b-2 border-vert-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                🌍 Texte original
              </button>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Ornement de séparation */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-vert-200 to-transparent" />
              <span className="text-or-500 font-arabic text-lg">❖</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-vert-200 to-transparent" />
            </div>

            {/* Texte du taalif */}
            {ongletActif === 'fr' && texteFr && (
              <div className="texte-taalif whitespace-pre-line text-gray-700 leading-loose">
                {texteFr}
              </div>
            )}
            
            {ongletActif === 'wolof' && texteWolof && (
              <div className="texte-taalif-ar whitespace-pre-line text-gray-700 leading-loose" dir="rtl">
                {texteWolof}
              </div>
            )}

            {/* Si un seul texte disponible */}
            {!texteFr && texteWolof && (
              <div className="texte-taalif whitespace-pre-line text-gray-700 leading-loose">
                {texteWolof}
              </div>
            )}
            {!texteWolof && texteFr && (
              <div className="texte-taalif whitespace-pre-line text-gray-700 leading-loose">
                {texteFr}
              </div>
            )}

            {/* Ornement de fin */}
            <div className="flex items-center justify-center mt-8">
              <span className="text-or-400 font-arabic text-2xl">❖</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
