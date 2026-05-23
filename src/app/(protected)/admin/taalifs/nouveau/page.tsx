// Admin – Nouveau Taalif

import { FormulaireTaalifAdmin } from '@/components/admin/FormulaireTaalifAdmin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PageNouveauTaalif() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-vert-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Admin
            </Link>
            <span>/</span>
            <Link href="/admin/taalifs" className="hover:text-vert-600">Taalifs</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Nouveau</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Nouveau Taalif</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <FormulaireTaalifAdmin />
      </div>
    </div>
  )
}
