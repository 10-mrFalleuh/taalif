'use client'
// Page d'inscription
// Création de compte avec vérification email

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

export default function PageInscription() {
  const [formulaire, setFormulaire] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    confirmationMotDePasse: '',
  })
  const [afficherMdp, setAfficherMdp] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const mettreAJour = (champ: string, valeur: string) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }))
  }

  // Indicateur de force du mot de passe
  const forceMdp = () => {
    const mdp = formulaire.motDePasse
    if (mdp.length === 0) return 0
    let score = 0
    if (mdp.length >= 8) score++
    if (/[A-Z]/.test(mdp)) score++
    if (/[0-9]/.test(mdp)) score++
    if (/[^A-Za-z0-9]/.test(mdp)) score++
    return score
  }

  const labelForce = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  const couleurForce = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-vert-500']

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    if (formulaire.motDePasse !== formulaire.confirmationMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.')
      setChargement(false)
      return
    }

    try {
      const res = await fetch('/api/auth/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulaire),
      })

      const data = await res.json()

      if (!res.ok) {
        setErreur(data.erreur ?? 'Une erreur est survenue.')
      } else {
        setSucces(true)
      }
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setChargement(false)
    }
  }

  // Écran de succès après inscription
  if (succes) {
    return (
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-vert-500 mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">
            Inscription réussie !
          </h2>
          <p className="text-gray-600 mb-2">
            Un email de vérification a été envoyé à{' '}
            <strong className="text-gray-900">{formulaire.email}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    )
  }

  const force = forceMdp()

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-vert-700 to-vert-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <span className="font-arabic text-3xl text-white">ط</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">Créer un compte</h1>
          <p className="text-vert-200 text-sm">Rejoignez la communauté TAALIF</p>
        </div>

        <form onSubmit={soumettre} className="p-8 space-y-4">
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erreur}
            </div>
          )}

          {/* Nom */}
          <div className="space-y-1.5">
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom complet</label>
            <input
              id="nom"
              type="text"
              autoComplete="name"
              required
              value={formulaire.nom}
              onChange={(e) => mettreAJour('nom', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
              placeholder="Mamadou Diallo"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={formulaire.email}
              onChange={(e) => mettreAJour('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
              placeholder="votre@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div className="relative">
              <input
                id="motDePasse"
                type={afficherMdp ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formulaire.motDePasse}
                onChange={(e) => mettreAJour('motDePasse', e.target.value)}
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all"
                placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
              />
              <button
                type="button"
                onClick={() => setAfficherMdp(!afficherMdp)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {afficherMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Barre de force */}
            {formulaire.motDePasse && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-colors ${n <= force ? couleurForce[force] : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${force >= 3 ? 'text-vert-600' : force >= 2 ? 'text-orange-500' : 'text-red-500'}`}>
                  {labelForce[force]}
                </p>
              </div>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div className="space-y-1.5">
            <label htmlFor="confirmationMotDePasse" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmationMotDePasse"
              type="password"
              autoComplete="new-password"
              required
              value={formulaire.confirmationMotDePasse}
              onChange={(e) => mettreAJour('confirmationMotDePasse', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                formulaire.confirmationMotDePasse && formulaire.motDePasse !== formulaire.confirmationMotDePasse
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-gray-200 focus:ring-vert-500 focus:border-vert-500'
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 px-6 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm mt-2"
          >
            {chargement ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Création du compte...</>
            ) : (
              'Créer mon compte'
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-vert-600 font-medium hover:text-vert-800 transition-colors">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
