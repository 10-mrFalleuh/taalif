// Page liste des Taalifs - Server Component
// Affiche tous les taalifs avec filtres par format, thème, date et recherche

import { prisma } from '@/lib/prisma'
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

const LIMITE_PAR_PAGE = 12

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
  const format = searchParams.format as FormatTaalif | undefined
  const theme = searchParams.theme
  const q = searchParams.q
  const tri = searchParams.tri ?? 'date_desc'

  // Construction du filtre Prisma
  const where: Record<string, unknown> = {}

  if (format && ['TEXTE', 'AUDIO', 'VIDEO'].includes(format)) {
    where.format = format
  }

  if (theme) {
    where.theme = { contains: theme, mode: 'insensitive' }
  }

  if (q) {
    where.OR = [
      { titreFr: { contains: q, mode: 'insensitive' } },
      { titreWolof: { contains: q, mode: 'insensitive' } },
      { texteFr: { contains: q, mode: 'insensitive' } },
      { texteWolof: { contains: q, mode: 'insensitive' } },
      { theme: { contains: q, mode: 'insensitive' } },
    ]
  }

  // Ordre de tri
  const orderBy: Record<string, string> =
    tri === 'date_asc'
      ? { dateCreation: 'asc' }
      : tri === 'titre_asc'
      ? { titreFr: 'asc' }
      : { dateCreation: 'desc' }

  // Récupération paginée
  const [taalifs, total, themes] = await Promise.all([
    prisma.taalif.findMany({
      where,
      orderBy,
      skip: (page - 1) * LIMITE_PAR_PAGE,
      take: LIMITE_PAR_PAGE,
    }),
    prisma.taalif.count({ where }),
    // Liste des thèmes distincts pour le filtre
    prisma.taalif.findMany({
      select: { theme: true },
      where: { theme: { not: null } },
      distinct: ['theme'],
      orderBy: { theme: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(total / LIMITE_PAR_PAGE)
  const listeThemes = themes.map((t) => t.theme).filter(Boolean) as string[]

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
