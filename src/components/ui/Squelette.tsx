// Blocs de chargement réutilisés par les fichiers loading.tsx
// Affichés pendant le streaming des Server Components.

export function BarreSquelette({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
}

/** Carte de taalif en attente : reprend la silhouette de CardTaalif. */
export function CarteSquelette() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <BarreSquelette className="h-40 rounded-none" />
      <div className="p-5 space-y-3">
        <BarreSquelette className="h-3 w-20" />
        <BarreSquelette className="h-5 w-3/4" />
        <BarreSquelette className="h-3 w-full" />
        <BarreSquelette className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/** Grille de cartes, calquée sur la mise en page des listes. */
export function GrilleSquelette({ nombre = 6 }: { nombre?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: nombre }, (_, i) => (
        <CarteSquelette key={i} />
      ))}
    </div>
  )
}

/** Lignes de tableau, pour les écrans d'administration. */
export function TableauSquelette({ lignes = 6 }: { lignes?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
      {Array.from({ length: lignes }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <BarreSquelette className="w-8 h-8 rounded-full flex-shrink-0" />
          <BarreSquelette className="h-4 flex-1 max-w-xs" />
          <BarreSquelette className="h-4 w-16 hidden sm:block" />
          <BarreSquelette className="h-4 w-20 hidden md:block" />
        </div>
      ))}
    </div>
  )
}
