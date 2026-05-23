'use client'
// Page de réinitialisation du mot de passe
// Accessible via le lien envoyé par email : /reinitialiser-mdp?token=xxx

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PageReinitialisationMdp() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [formulaire, setFormulaire] = useState({ motDePasse: '', confirmationMotDePasse: '' })
  const [afficherMdp, setAfficherMdp] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  // Rediriger si pas de token
  useEffect(() => {
    if (!token) {
      router.replace('/login')
    }
  }, [token, router])

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')

    if (formulaire.motDePasse !== formulaire.confirmationMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (formulaire.motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setChargement(true)
    try {
      const res = await fetch('/api/auth/reinitialiser-mdp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, motDePasse: formulaire.motDePasse, confirmationMotDePasse: formulaire.confirmationMotDePasse }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErreur(data.erreur ?? 'Une erreur est survenue.')
      } else {
        setSucces(true)
        // Redirection auto vers login après 3s
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setChargement(false)
    }
  }

  if (!token) return null

  if (succes) {
    return (
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-vert-500 mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">Mot de passe modifié !</h2>
          <p className="text-gray-600 mb-2">Votre mot de passe a été réinitialisé avec succès.</p>
          <p className="text-sm text-gray-400 mb-8">Vous allez être redirigé vers la connexion…</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors">
            Se connecter maintenant
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-vert-700 to-vert-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <span className="font-arabic text-3xl text-white">ط</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">Nouveau mot de passe</h1>
          <p className="text-vert-200 text-sm">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        <form onSubmit={soumettre} className="p-8 space-y-5">
          {erreur && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="motDePasse"
                type={afficherMdp ? 'text' : 'password'}
                required
                value={formulaire.motDePasse}
                onChange={(e) => setFormulaire((p) => ({ ...p, motDePasse: e.target.value }))}
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
                placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              type="password"
              required
              value={formulaire.confirmationMotDePasse}
              onChange={(e) => setFormulaire((p) => ({ ...p, confirmationMotDePasse: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                formulaire.confirmationMotDePasse && formulaire.motDePasse !== formulaire.confirmationMotDePasse
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-200 focus:ring-vert-500 focus:border-vert-500'
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 px-6 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {chargement ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Réinitialisation...</>
            ) : (
              'Enregistrer le nouveau mot de passe'
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-vert-600 font-medium hover:text-vert-800 transition-colors">
              ← Retour à la connexion
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
