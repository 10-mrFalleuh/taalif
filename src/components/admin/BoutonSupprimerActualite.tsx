'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { afficherToast } from '@/components/ui/toaster'

export function BoutonSupprimerActualite({ id, titre }: { id: string; titre: string }) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState(false)
  const [chargement, setChargement] = useState(false)

  const supprimer = async () => {
    setChargement(true)
    try {
      const res = await fetch(`/api/actualites/${id}`, { method: 'DELETE' })
      if (res.ok) {
        afficherToast('Actualité supprimée', 'succes')
        router.refresh()
      } else {
        afficherToast('Erreur lors de la suppression', 'erreur')
      }
    } catch {
      afficherToast('Erreur réseau', 'erreur')
    } finally {
      setChargement(false)
      setConfirmation(false)
    }
  }

  if (confirmation) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 hidden sm:inline">Supprimer ?</span>
        <button onClick={supprimer} disabled={chargement} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
          {chargement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setConfirmation(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 text-xs">✕</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirmation(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title={`Supprimer "${titre}"`}>
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
