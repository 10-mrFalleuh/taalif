'use client'
// Frontière d'erreur racine
// Capture toute exception non gérée d'un segment (base injoignable, requête en
// échec…) et affiche un écran lisible au lieu de la page d'erreur brute de Next.

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function ErreurGlobale({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Le digest est l'identifiant que Next inscrit aussi dans les logs serveur :
    // c'est lui qui permet de relier un incident signalé à sa trace.
    console.error('Erreur non gérée:', error.digest ?? error.message)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>

        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          La page n&apos;a pas pu être affichée. Vous pouvez réessayer&nbsp;; si le
          problème persiste, revenez à l&apos;accueil.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6">
            Référence : {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>

        <p className="text-or-400 font-arabic text-2xl mt-8">❖</p>
      </div>
    </div>
  )
}
