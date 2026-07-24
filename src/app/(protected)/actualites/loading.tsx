// Affiché pendant le chargement des actualités

import { GrilleSquelette, BarreSquelette } from '@/components/ui/Squelette'

export default function ChargementActualites() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10 space-y-3">
          <BarreSquelette className="h-3 w-24" />
          <BarreSquelette className="h-9 w-48" />
          <BarreSquelette className="h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <GrilleSquelette nombre={6} />
      </div>
    </div>
  )
}
