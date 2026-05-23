// Admin – Liste des Taalifs avec CRUD
// Tableau avec actions : éditer, supprimer, créer

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BoutonSupprimerTaalif } from '@/components/admin/BoutonSupprimerTaalif'
import { Plus, Pencil, BookOpen, Music, Video, ArrowLeft } from 'lucide-react'
import type { FormatTaalif } from '@prisma/client'

interface Props {
  searchParams: { format?: string; page?: string }
}

const LIMITE = 20

export default async function PageAdminTaalifs({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const format = searchParams.format as FormatTaalif | undefined

  const where = format && ['TEXTE', 'AUDIO', 'VIDEO'].includes(format) ? { format } : {}

  const [taalifs, total] = await Promise.all([
    prisma.taalif.findMany({
      where,
      orderBy: { dateCreation: 'desc' },
      skip: (page - 1) * LIMITE,
      take: LIMITE,
    }),
    prisma.taalif.count({ where }),
  ])

  const totalPages = Math.ceil(total / LIMITE)

  const iconeFormat = { TEXTE: BookOpen, AUDIO: Music, VIDEO: Video }
  const couleurFormat = {
    TEXTE: 'text-vert-600 bg-vert-50',
    AUDIO: 'text-blue-600 bg-blue-50',
    VIDEO: 'text-purple-600 bg-purple-50',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-vert-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Admin
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Taalifs</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              Taalifs <span className="text-gray-400 font-normal text-lg">({total})</span>
            </h1>
            <Link
              href="/admin/taalifs/nouveau"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau taalif
            </Link>
          </div>

          {/* Filtres format */}
          <div className="flex gap-2 mt-4">
            {[
              { valeur: undefined, label: 'Tous' },
              { valeur: 'TEXTE', label: '📝 Texte' },
              { valeur: 'AUDIO', label: '🎵 Audio' },
              { valeur: 'VIDEO', label: '🎬 Vidéo' },
            ].map((f) => (
              <Link
                key={f.label}
                href={f.valeur ? `/admin/taalifs?format=${f.valeur}` : '/admin/taalifs'}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  format === f.valeur || (!format && !f.valeur)
                    ? 'bg-vert-600 text-white border-vert-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-vert-300'
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {taalifs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun taalif trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Titre</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Format</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Thème</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">DL</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {taalifs.map((t) => {
                    const Icone = iconeFormat[t.format]
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 truncate max-w-[200px]">{t.titreFr}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px] font-arabic" dir="rtl">{t.titreWolof}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${couleurFormat[t.format]}`}>
                            <Icone className="w-3 h-3" />
                            {t.format}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-500 truncate max-w-[120px]">
                          {t.theme ?? '—'}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                          {formatDate(t.dateCreation, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                          {t.nbTelechargements}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/taalifs/${t.id}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-vert-600 hover:bg-vert-50 transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <BoutonSupprimerTaalif id={t.id} titre={t.titreFr} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination simple */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/taalifs?page=${page - 1}${format ? `&format=${format}` : ''}`}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                    ← Précédent
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/taalifs?page=${page + 1}${format ? `&format=${format}` : ''}`}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                    Suivant →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
