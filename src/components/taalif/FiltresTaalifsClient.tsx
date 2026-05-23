'use client'
// Composant de filtres côté client
// Gère la recherche et les filtres avec navigation URL

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search, SlidersHorizontal, X, BookOpen, Music, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropsFiltres {
  themes: string[]
  total: number
  filtresActifs: {
    format?: string
    theme?: string
    q?: string
    tri?: string
  }
}

export function FiltresTaalifsClient({ themes, total, filtresActifs }: PropsFiltres) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [recherche, setRecherche] = useState(filtresActifs.q ?? '')
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  // Mise à jour des paramètres URL
  const mettreAJour = useCallback((cle: string, valeur: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (valeur === null || valeur === '') {
      params.delete(cle)
    } else {
      params.set(cle, valeur)
    }
    
    // Retour à la page 1 lors d'un changement de filtre
    params.delete('page')
    
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  // Soumission de la recherche
  const soumettrRecherche = (e: React.FormEvent) => {
    e.preventDefault()
    mettreAJour('q', recherche || null)
  }

  // Effacer tous les filtres
  const effacerTout = () => {
    setRecherche('')
    router.push(pathname)
  }

  const aDesFiltres = filtresActifs.format || filtresActifs.theme || filtresActifs.q

  const formats = [
    { valeur: 'TEXTE', label: 'Texte', icone: BookOpen, classe: 'border-vert-300 bg-vert-50 text-vert-700' },
    { valeur: 'AUDIO', label: 'Audio', icone: Music, classe: 'border-blue-300 bg-blue-50 text-blue-700' },
    { valeur: 'VIDEO', label: 'Vidéo', icone: Video, classe: 'border-purple-300 bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="space-y-4">
      {/* Barre de recherche + bouton filtres */}
      <div className="flex gap-3">
        <form onSubmit={soumettrRecherche} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un taalif..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => { setRecherche(''); mettreAJour('q', null) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <button
          onClick={() => setFiltresOuverts(!filtresOuverts)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
            filtresOuverts || aDesFiltres
              ? 'bg-vert-600 text-white border-vert-600'
              : 'bg-white text-gray-700 border-gray-200 hover:border-vert-300'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {aDesFiltres && (
            <span className="w-5 h-5 bg-white/20 text-white text-xs rounded-full flex items-center justify-center">
              {[filtresActifs.format, filtresActifs.theme, filtresActifs.q].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Panneau de filtres dépliable */}
      {filtresOuverts && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm animate-entree space-y-5">
          
          {/* Filtre par format */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
              Format
            </label>
            <div className="flex flex-wrap gap-2">
              {formats.map((fmt) => {
                const Icone = fmt.icone
                const actif = filtresActifs.format === fmt.valeur
                return (
                  <button
                    key={fmt.valeur}
                    onClick={() => mettreAJour('format', actif ? null : fmt.valeur)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                      actif ? fmt.classe : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    )}
                  >
                    <Icone className="w-4 h-4" />
                    {fmt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtre par thème */}
          {themes.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
                Thème
              </label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => mettreAJour('theme', filtresActifs.theme === theme ? null : theme)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      filtresActifs.theme === theme
                        ? 'bg-vert-600 text-white border-vert-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-vert-300 hover:text-vert-600'
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tri */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
              Trier par
            </label>
            <select
              value={filtresActifs.tri ?? 'date_desc'}
              onChange={(e) => mettreAJour('tri', e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vert-500 bg-white"
            >
              <option value="date_desc">Plus récents en premier</option>
              <option value="date_asc">Plus anciens en premier</option>
              <option value="titre_asc">Titre A→Z</option>
            </select>
          </div>

          {/* Effacer les filtres */}
          {aDesFiltres && (
            <button
              onClick={effacerTout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Effacer tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Résumé des résultats */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          <strong className="text-gray-700">{total}</strong> taalif{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
        </span>
        {aDesFiltres && (
          <button
            onClick={effacerTout}
            className="flex items-center gap-1 text-vert-600 hover:text-vert-800 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Effacer les filtres
          </button>
        )}
      </div>
    </div>
  )
}
