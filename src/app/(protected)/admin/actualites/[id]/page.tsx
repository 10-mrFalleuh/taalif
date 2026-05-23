import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FormulaireActualiteAdmin } from '@/components/admin/FormulaireActualiteAdmin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props { params: { id: string } }

export default async function PageEditerActualite({ params }: Props) {
  const actualite = await prisma.actualite.findUnique({ where: { id: params.id } })
  if (!actualite) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-vert-600 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Admin</Link>
            <span>/</span>
            <Link href="/admin/actualites" className="hover:text-vert-600">Actualités</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Modifier</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Modifier l'actualité</h1>
          <p className="text-gray-500 text-sm mt-1">{actualite.titre}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <FormulaireActualiteAdmin actualite={actualite} />
      </div>
    </div>
  )
}
