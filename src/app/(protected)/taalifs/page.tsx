// Page liste des Taalifs - Server Component
// Affiche tous les taalifs avec filtres par format, thème, date et recherche

import { listerTaalifs, listerThemes, LIMITE_TAALIFS_DEFAUT } from '@/lib/requetes/taalifs'
import type { TriTaalif } from '@/lib/requetes/taalifs'
import { CardTaalif } from '@/components/taalif/CardTaalif'
import { FiltresTaalifsClient } from '@/components/taalif/FiltresTaalifsClient'
import { Pagination } from '@/components/ui/Pagination'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import type { FormatTaalif } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Tous les Taalifs',
  description: 'Explorez tous les poèmes (taalifs) de Cheikh Ahmadou Kara Mbacké.',
}

interface Props {
  searchParams: {
    format?: string
    theme?: string
    q?: string
    page?: string
    tri?: string
  }
}

export default async function PageTaalifs({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const format = ['TEXTE', 'AUDIO', 'VIDEO'].includes(searchParams.format ?? '')
    ? (searchParams.format as FormatTaalif)
    : undefined
  const theme = searchParams.theme
  const q = searchParams.q
  const tri = (searchParams.tri ?? 'date_desc') as TriTaalif

  const [
    { elements: taalifs, total, totalPages },
    listeThemes,
  ] = await Promise.all([
    listerTaalifs({ format, theme, q, tri, page, limite: LIMITE_TAALIFS_DEFAUT }),
    listerThemes(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de page */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl">
            <div className="text-vert-500 text-sm font-medium uppercase tracking-widest mb-2">
              Bibliothèque
            </div>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">
              Les Taalifs
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Découvrez les poèmes spirituels de Cheikh Ahmadou Kara Mbacké 
              dédiés à Khadimou Rassoul, disponibles en texte, audio et vidéo.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtres (Client Component pour l'interactivité) */}
        <FiltresTaalifsClient
          themes={listeThemes}
          total={total}
          filtresActifs={{ format, theme, q, tri }}
        />

        {/* Grille des taalifs */}
        {taalifs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-gray-500 mb-2">
              Aucun taalif trouvé
            </h3>
            <p className="text-gray-400 text-sm">
              Essayez de modifier vos filtres ou d'effectuer une recherche différente.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {taalifs.map((taalif) => (
                <CardTaalif key={taalif.id} taalif={taalif} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  baseUrl="/taalifs"
                  searchParams={searchParams}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
