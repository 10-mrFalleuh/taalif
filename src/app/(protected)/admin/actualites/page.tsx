// Admin – Gestion des Actualités

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BoutonSupprimerActualite } from '@/components/admin/BoutonSupprimerActualite'
import { Plus, Pencil, ArrowLeft, Newspaper } from 'lucide-react'

export default async function PageAdminActualites() {
  const actualites = await prisma.actualite.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const couleur = {
    ARTICLE: 'bg-blue-50 text-blue-700',
    EVENEMENT: 'bg-amber-50 text-amber-700',
    ANNONCE: 'bg-purple-50 text-purple-700',
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
            <span className="text-gray-900 font-medium">Actualités</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              Actualités <span className="text-gray-400 font-normal text-lg">({actualites.length})</span>
            </h1>
            <Link
              href="/admin/actualites/nouvelle"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nouvelle actualité
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {actualites.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune actualité.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Titre</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Catégorie</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {actualites.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[250px]">{a.titre}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${couleur[a.categorie]}`}>
                          {a.categorie}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.publiee ? 'bg-vert-50 text-vert-700' : 'bg-gray-100 text-gray-500'}`}>
                          {a.publiee ? '● Publiée' : '○ Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                        {formatDate(a.createdAt, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/actualites/${a.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-vert-600 hover:bg-vert-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <BoutonSupprimerActualite id={a.id} titre={a.titre} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
