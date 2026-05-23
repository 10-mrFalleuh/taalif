'use client'
// Page mot de passe oublié

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'

export default function PageMotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    try {
      const res = await fetch('/api/auth/mot-de-passe-oublie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  if (succes) {
    return (
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-vert-500 mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">Email envoyé !</h2>
          <p className="text-gray-600 mb-8">
            Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous peu.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors">
            Retour à la connexion
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">Mot de passe oublié</h1>
          <p className="text-vert-200 text-sm">Nous vous enverrons un lien de réinitialisation</p>
        </div>

        <form onSubmit={soumettre} className="p-8 space-y-5">
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{erreur}</div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 transition-all"
              placeholder="votre@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={chargement}
            className="w-full py-3 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {chargement ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi...</> : 'Envoyer le lien'}
          </button>
          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-vert-600 font-medium hover:text-vert-800">← Retour à la connexion</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
