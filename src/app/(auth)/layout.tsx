// Layout pour les pages d'authentification
// Pages publiques sans navigation ni footer

export default function LayoutAuth({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vert-950 via-vert-900 to-vert-800 flex items-center justify-center p-4">
      {/* Motif géométrique de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/5 rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 border border-white/5 rounded-full -translate-x-8 -translate-y-8" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-white/5 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-white/5 rounded-full translate-x-8 translate-y-8" />
      </div>
      {children}
    </div>
  )
}
