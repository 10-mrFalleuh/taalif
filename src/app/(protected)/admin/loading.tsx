// Affiché pendant le chargement des écrans d'administration.
// Placé au niveau du segment /admin : il couvre le tableau de bord et toutes
// les sous-pages qui n'ont pas leur propre loading.tsx.

import { TableauSquelette, BarreSquelette } from '@/components/ui/Squelette'

export default function ChargementAdmin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 space-y-3">
          <BarreSquelette className="h-3 w-32" />
          <BarreSquelette className="h-8 w-64" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <TableauSquelette lignes={6} />
      </div>
    </div>
  )
}
