// Page Actualités - Server Component

import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Pagination } from '@/components/ui/Pagination'
import { Newspaper, Calendar, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import type { CategorieActualite } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Articles, événements et annonces du mouvement mouridiya.',
}

const LIMITE = 9

const CATEGORIES: { valeur: CategorieActualite | 'TOUTES'; label: string; emoji: string }[] = [
  { valeur: 'TOUTES', label: 'Toutes', emoji: '📋' },
  { valeur: 'ARTICLE', label: 'Articles', emoji: '📰' },
  { valeur: 'EVENEMENT', label: 'Événements', emoji: '📅' },
  { valeur: 'ANNONCE', label: 'Annonces', emoji: '📢' },
]

interface Props {
  searchParams: { categorie?: string; page?: string }
}

export default async function PageActualites({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const categorie = searchParams.categorie as CategorieActualite | undefined

  const where = {
    publiee: true,
    ...(categorie && ['ARTICLE', 'EVENEMENT', 'ANNONCE'].includes(categorie)
      ? { categorie }
      : {}),
  }

  const [actualites, total] = await Promise.all([
    prisma.actualite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * LIMITE,
      take: LIMITE,
    }),
    prisma.actualite.count({ where }),
  ])

  const totalPages = Math.ceil(total / LIMITE)

  const couleurCategorie = {
    ARTICLE: 'bg-blue-100 text-blue-700',
    EVENEMENT: 'bg-amber-100 text-amber-700',
    ANNONCE: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <div className="text-vert-500 text-sm font-medium uppercase tracking-widest mb-2">Mouvement</div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">Actualités</h1>
          <p className="text-gray-500">Articles, événements et annonces du mouvement mouridiya.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtres catégorie */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const actif = (cat.valeur === 'TOUTES' && !categorie) || cat.valeur === categorie
            const href = cat.valeur === 'TOUTES' ? '/actualites' : `/actualites?categorie=${cat.valeur}`
            return (
              <Link
                key={cat.valeur}
                href={href}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  actif
                    ? 'bg-vert-600 text-white border-vert-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-vert-300 hover:text-vert-600'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </Link>
            )
          })}
        </div>

        {/* Grille */}
        {actualites.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-serif text-xl text-gray-400">Aucune actualité pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {actualites.map((actu) => (
                <article
                  key={actu.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden carte-hover shadow-sm"
                >
                  {/* Image ou placeholder */}
                  <div className="relative h-44 bg-gradient-to-br from-vert-100 to-vert-200">
                    {actu.imageUrl ? (
                      <Image src={actu.imageUrl} alt={actu.titre} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Newspaper className="w-10 h-10 text-vert-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${couleurCategorie[actu.categorie]}`}>
                        {actu.categorie === 'ARTICLE' ? '📰 Article' : actu.categorie === 'EVENEMENT' ? '📅 Événement' : '📢 Annonce'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="font-serif font-semibold text-gray-900 leading-snug mb-3 line-clamp-2">
                      {actu.titre}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                      {actu.contenu.slice(0, 150)}…
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {actu.categorie === 'EVENEMENT' && actu.dateEvent
                            ? formatDate(actu.dateEvent, { month: 'short', day: 'numeric', year: 'numeric' })
                            : formatDate(actu.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination page={page} totalPages={totalPages} baseUrl="/actualites" searchParams={searchParams} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
