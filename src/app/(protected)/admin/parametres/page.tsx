// Admin – Paramètres de la plateforme

import { prisma } from '@/lib/prisma'
import { FormulaireParametres } from '@/components/admin/FormulaireParametres'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'

export default async function PageAdminParametres() {
  const [parametres, taalifs] = await Promise.all([
    prisma.parametre.findFirst({ orderBy: { createdAt: 'desc' } }),
    prisma.taalif.findMany({ select: { id: true, titreFr: true }, orderBy: { titreFr: 'asc' } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-vert-600 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Admin</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Paramètres</span>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-vert-600" />
            <h1 className="font-serif text-2xl font-bold text-gray-900">Paramètres du site</h1>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <FormulaireParametres parametres={parametres} taalifs={taalifs} />
      </div>
    </div>
  )
}
