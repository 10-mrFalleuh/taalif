'use client'
// Formulaire Admin – Créer / Modifier une Actualité

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { afficherToast } from '@/components/ui/toaster'
import type { Actualite } from '@prisma/client'

interface Props { actualite?: Actualite }

export function FormulaireActualiteAdmin({ actualite }: Props) {
  const router = useRouter()
  const modeEdition = !!actualite

  const [formulaire, setFormulaire] = useState({
    titre: actualite?.titre ?? '',
    contenu: actualite?.contenu ?? '',
    imageUrl: actualite?.imageUrl ?? '',
    categorie: actualite?.categorie ?? 'ARTICLE',
    publiee: actualite?.publiee ?? false,
    dateEvent: actualite?.dateEvent ? new Date(actualite.dateEvent).toISOString().split('T')[0] : '',
  })
  const [chargement, setChargement] = useState(false)

  const mettreAJour = (champ: string, valeur: string | boolean) =>
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }))

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formulaire.titre.trim() || !formulaire.contenu.trim()) {
      afficherToast('Le titre et le contenu sont requis', 'erreur')
      return
    }
    setChargement(true)
    try {
      const url = modeEdition ? `/api/actualites/${actualite.id}` : '/api/actualites'
      const res = await fetch(url, {
        method: modeEdition ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formulaire, dateEvent: formulaire.dateEvent || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        afficherToast(data.erreur ?? 'Erreur', 'erreur')
      } else {
        afficherToast(modeEdition ? 'Actualité modifiée' : 'Actualité créée', 'succes')
        router.push('/admin/actualites')
        router.refresh()
      }
    } catch {
      afficherToast('Erreur réseau', 'erreur')
    } finally {
      setChargement(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500 focus:border-vert-500 transition-all'

  return (
    <form onSubmit={soumettre} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Contenu</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Titre <span className="text-red-500">*</span></label>
          <input type="text" required value={formulaire.titre} onChange={(e) => mettreAJour('titre', e.target.value)} className={inputClass} placeholder="Grand Magal de Touba 2024" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Contenu <span className="text-red-500">*</span></label>
          <textarea rows={10} required value={formulaire.contenu} onChange={(e) => mettreAJour('contenu', e.target.value)} className={inputClass} placeholder="Rédigez le contenu de l'actualité..." />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">URL de l'image (optionnel)</label>
          <input type="text" value={formulaire.imageUrl} onChange={(e) => mettreAJour('imageUrl', e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Paramètres</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select value={formulaire.categorie} onChange={(e) => mettreAJour('categorie', e.target.value)} className={inputClass}>
              <option value="ARTICLE">📰 Article</option>
              <option value="EVENEMENT">📅 Événement</option>
              <option value="ANNONCE">📢 Annonce</option>
            </select>
          </div>

          {formulaire.categorie === 'EVENEMENT' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Date de l'événement</label>
              <input type="date" value={formulaire.dateEvent} onChange={(e) => mettreAJour('dateEvent', e.target.value)} className={inputClass} />
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => mettreAJour('publiee', !formulaire.publiee)} className={`w-10 h-6 rounded-full transition-colors relative ${formulaire.publiee ? 'bg-vert-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formulaire.publiee ? 'left-5' : 'left-1'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Publier immédiatement</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
          Annuler
        </button>
        <button type="submit" disabled={chargement} className="inline-flex items-center gap-2 px-6 py-2.5 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60">
          {chargement ? <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde...</> : <><Save className="w-4 h-4" />{modeEdition ? 'Enregistrer' : 'Créer'}</>}
        </button>
      </div>
    </form>
  )
}
