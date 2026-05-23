'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { afficherToast } from '@/components/ui/toaster'

interface Props { id: string; roleActuel: string; nom: string }

export function BoutonRoleUtilisateur({ id, roleActuel, nom }: Props) {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)

  const basculerRole = async () => {
    const nouveauRole = roleActuel === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Changer le rôle de ${nom} en ${nouveauRole} ?`)) return

    setChargement(true)
    try {
      const res = await fetch(`/api/admin/utilisateurs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nouveauRole }),
      })
      if (res.ok) {
        afficherToast(`Rôle de ${nom} changé en ${nouveauRole}`, 'succes')
        router.refresh()
      } else {
        afficherToast('Erreur lors du changement de rôle', 'erreur')
      }
    } catch {
      afficherToast('Erreur réseau', 'erreur')
    } finally {
      setChargement(false)
    }
  }

  return (
    <button
      onClick={basculerRole}
      disabled={chargement}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 ${
        roleActuel === 'ADMIN'
          ? 'bg-vert-50 text-vert-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-vert-50 hover:text-vert-700'
      }`}
      title={roleActuel === 'ADMIN' ? 'Rétrograder en USER' : 'Promouvoir en ADMIN'}
    >
      {chargement ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : roleActuel === 'ADMIN' ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : (
        <ShieldOff className="w-3.5 h-3.5" />
      )}
      {roleActuel === 'ADMIN' ? 'Admin' : 'User'}
    </button>
  )
}
