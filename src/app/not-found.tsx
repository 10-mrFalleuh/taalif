// Page 404 personnalisée

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function PageIntrouvable() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl gradient-vert flex items-center justify-center mx-auto mb-6 shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-serif text-6xl font-bold text-vert-800 mb-3">404</h1>
        <p className="font-arabic text-or-500 text-lg mb-2" dir="rtl">❖</p>
        <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-3">
          Page introuvable
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/taalifs"
            className="px-6 py-3 border border-vert-300 text-vert-700 font-medium rounded-xl hover:bg-vert-50 transition-colors"
          >
            Explorer les taalifs
          </Link>
        </div>
      </div>
    </div>
  )
}
