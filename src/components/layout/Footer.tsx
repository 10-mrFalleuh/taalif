// Pied de page de l'application

import Link from 'next/link'

export function Footer() {
  const annee = new Date().getFullYear()

  return (
    <footer className="bg-vert-950 text-white mt-auto">
      {/* Bande dorée décorative */}
      <div className="h-1 bg-gradient-to-r from-or-400 via-or-500 to-or-400" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Colonne 1 : Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-vert-700 border border-vert-600 flex items-center justify-center text-white font-serif text-lg">
                ط
              </div>
              <div>
                <div className="font-serif text-xl font-bold tracking-wide">TAALIF</div>
                <div className="text-xs text-vert-400 tracking-widest">POÈMES SPIRITUELS</div>
              </div>
            </div>
            <p className="text-sm text-vert-300 leading-relaxed">
              Plateforme dédiée à la diffusion des poèmes de Cheikh Ahmadou Kara Mbacké 
              sur Serigne Touba et l'enseignement mouridiya.
            </p>
            {/* Ornement calligraphique */}
            <p className="font-arabic text-or-400 text-lg">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* Colonne 2 : Liens rapides */}
          <div>
            <h3 className="font-serif font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { label: 'Accueil', href: '/' },
                { label: 'Tous les Taalifs', href: '/taalifs' },
                { label: 'Actualités', href: '/actualites' },
              ].map((lien) => (
                <li key={lien.href}>
                  <Link
                    href={lien.href}
                    className="text-sm text-vert-300 hover:text-or-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-or-500">›</span>
                    {lien.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Formats */}
          <div>
            <h3 className="font-serif font-semibold text-white mb-4">Formats disponibles</h3>
            <ul className="space-y-2">
              {[
                { label: '📝 Taalifs Texte', desc: 'Lecture et téléchargement' },
                { label: '🎵 Taalifs Audio', desc: 'Écoute MP3 + téléchargement' },
                { label: '🎬 Taalifs Vidéo', desc: 'Lecture MP4 + téléchargement' },
              ].map((item) => (
                <li key={item.label} className="text-sm">
                  <span className="text-white">{item.label}</span>
                  <br />
                  <span className="text-vert-400 text-xs">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bas du footer */}
        <div className="border-t border-vert-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-vert-400 text-center sm:text-left">
            © {annee} TAALIF · Tous droits réservés
          </p>
          <p className="text-xs text-vert-600 text-center sm:text-right">
            Dédié à la mémoire et à l'enseignement de Khadimou Rassoul
          </p>
        </div>
      </div>
    </footer>
  )
}
