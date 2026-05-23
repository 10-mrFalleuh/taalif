'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { afficherToast } from '@/components/ui/toaster'
import type { Parametre } from '@prisma/client'

interface Props {
  parametres: Parametre | null
  taalifs: { id: string; titreFr: string }[]
}

export function FormulaireParametres({ parametres, taalifs }: Props) {
  const router = useRouter()
  const [formulaire, setFormulaire] = useState({
    nomMouvement: parametres?.nomMouvement ?? 'Mouvement Mondial Mame Cheikh',
    descriptionMouvement: parametres?.descriptionMouvement ?? '',
    taalifDuJourId: parametres?.taalifDuJourId ?? '',
  })
  const [chargement, setChargement] = useState(false)

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    setChargement(true)
    try {
      const res = await fetch('/api/admin/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formulaire, taalifDuJourId: formulaire.taalifDuJourId || null }),
      })
      if (res.ok) {
        afficherToast('Paramètres sauvegardés', 'succes')
        router.refresh()
      } else {
        afficherToast('Erreur lors de la sauvegarde', 'erreur')
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
        <h2 className="font-semibold text-gray-800">Mouvement mis en avant</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Nom du mouvement</label>
          <input
            type="text"
            required
            value={formulaire.nomMouvement}
            onChange={(e) => setFormulaire((p) => ({ ...p, nomMouvement: e.target.value }))}
            className={inputClass}
            placeholder="Mouvement Mondial Mame Cheikh"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Description du mouvement</label>
          <textarea
            rows={5}
            required
            value={formulaire.descriptionMouvement}
            onChange={(e) => setFormulaire((p) => ({ ...p, descriptionMouvement: e.target.value }))}
            className={inputClass}
            placeholder="Décrivez le mouvement mouridiya..."
          />
          <p className="text-xs text-gray-400">Ce texte apparaît sur la page d'accueil.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Taalif du Jour</h2>
        <p className="text-sm text-gray-500">Sélectionnez un taalif manuellement, ou laissez vide pour une sélection automatique parmi les taalifs marqués.</p>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Taalif sélectionné</label>
          <select
            value={formulaire.taalifDuJourId}
            onChange={(e) => setFormulaire((p) => ({ ...p, taalifDuJourId: e.target.value }))}
            className={inputClass}
          >
            <option value="">— Sélection automatique —</option>
            {taalifs.map((t) => (
              <option key={t.id} value={t.id}>{t.titreFr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={chargement} className="inline-flex items-center gap-2 px-6 py-2.5 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60">
          {chargement ? <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde...</> : <><Save className="w-4 h-4" />Enregistrer</>}
        </button>
      </div>
    </form>
  )
}
