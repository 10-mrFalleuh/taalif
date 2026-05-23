'use client'
// Page de connexion
// Formulaire email + mot de passe avec NextAuth

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function PageConnexion() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const erreurParam = searchParams.get('error')

  const [formulaire, setFormulaire] = useState({ email: '', motDePasse: '' })
  const [afficherMdp, setAfficherMdp] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(erreurParam ? 'Session expirée. Veuillez vous reconnecter.' : '')

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    try {
      const resultat = await signIn('credentials', {
        email: formulaire.email,
        motDePasse: formulaire.motDePasse,
        redirect: false,
      })

      if (resultat?.error) {
        setErreur(resultat.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setErreur('Une erreur inattendue est survenue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Carte */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-vert-700 to-vert-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <span className="font-arabic text-3xl text-white">ط</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">TAALIF</h1>
          <p className="text-vert-200 text-sm">Connectez-vous pour accéder aux taalifs</p>
          <p className="font-arabic text-or-400 mt-3 text-base" dir="rtl">بِسْمِ اللَّهِ</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={soumettre} className="p-8 space-y-5">
          {/* Message d'erreur */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erreur}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formulaire.email}
              onChange={(e) => setFormulaire({ ...formulaire, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
              placeholder="votre@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-vert-600 hover:text-vert-800 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="motDePasse"
                type={afficherMdp ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formulaire.motDePasse}
                onChange={(e) => setFormulaire({ ...formulaire, motDePasse: e.target.value })}
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setAfficherMdp(!afficherMdp)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {afficherMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 px-6 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {chargement ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>

          {/* Lien inscription */}
          <p className="text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-vert-600 font-medium hover:text-vert-800 transition-colors">
              S'inscrire gratuitement
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
