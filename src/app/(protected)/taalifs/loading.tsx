// Affiché pendant le chargement de la bibliothèque (rendu à la demande)

import { GrilleSquelette, BarreSquelette } from '@/components/ui/Squelette'

export default function ChargementTaalifs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10 space-y-3">
          <BarreSquelette className="h-3 w-24" />
          <BarreSquelette className="h-9 w-56" />
          <BarreSquelette className="h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <BarreSquelette className="h-14 w-full rounded-xl" />
        <GrilleSquelette nombre={6} />
      </div>
    </div>
  )
}
