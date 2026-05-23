// Page d'accueil - Server Component
// Affiche : Mouvement en avant, Taalif du jour, Derniers ajouts

import { prisma } from '@/lib/prisma'
import { formatDate, genererImageCouvertureSvg } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { CardTaalif } from '@/components/taalif/CardTaalif'
import { BookOpen, Music, Video, ArrowRight, Star } from 'lucide-react'

// Récupération des données côté serveur
async function getDonneesAccueil() {
  const [parametres, taalifDuJour, derniersAjouts, stats] = await Promise.all([
    // Paramètres du mouvement
    prisma.parametre.findFirst({ orderBy: { createdAt: 'desc' } }),
    
    // Taalif du jour : sélectionné manuellement ou aléatoire
    (async () => {
      const params = await prisma.parametre.findFirst()
      if (params?.taalifDuJourId) {
        return prisma.taalif.findUnique({ where: { id: params.taalifDuJourId } })
      }
      // Fallback : sélection aléatoire parmi les taalifs marqués
      const marques = await prisma.taalif.findMany({ where: { estTaalifDuJour: true }, take: 10 })
      if (marques.length > 0) return marques[Math.floor(Math.random() * marques.length)]
      // Dernière option : premier taalif disponible
      return prisma.taalif.findFirst({ orderBy: { dateCreation: 'desc' } })
    })(),
    
    // 6 derniers taalifs ajoutés
    prisma.taalif.findMany({
      orderBy: { dateCreation: 'desc' },
      take: 6,
    }),
    
    // Statistiques pour l'affichage
    prisma.taalif.groupBy({
      by: ['format'],
      _count: { id: true },
    }),
  ])

  return { parametres, taalifDuJour, derniersAjouts, stats }
}

export default async function PageAccueil() {
  const { parametres, taalifDuJour, derniersAjouts, stats } = await getDonneesAccueil()

  // Compteurs par format
  const compteTexte = stats.find((s) => s.format === 'TEXTE')?._count.id ?? 0
  const compteAudio = stats.find((s) => s.format === 'AUDIO')?._count.id ?? 0
  const compteVideo = stats.find((s) => s.format === 'VIDEO')?._count.id ?? 0
  const totalTaalifs = compteTexte + compteAudio + compteVideo

  return (
    <div className="min-h-screen">
      
      {/* ─── Section Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-vert text-white">
        {/* Motif géométrique décoratif */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
          <div className="absolute top-5 left-5 w-44 h-44 border border-white/50 rounded-full" />
          <div className="absolute bottom-10 right-10 w-40 h-40 border border-white rounded-full" />
          <div className="absolute bottom-5 right-5 w-56 h-56 border border-white/50 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Calligraphie arabe */}
            <p className="font-arabic text-2xl text-or-400 mb-4" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Star className="w-4 h-4 text-or-400" />
              <span>{parametres?.nomMouvement ?? 'Mouvement Mouridiya'}</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Les Taalifs de
              <span className="block text-or-400 mt-2">Cheikh Ahmadou Kara</span>
            </h1>
            
            <p className="text-vert-100 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
              {parametres?.descriptionMouvement ?? 
                "Découvrez les poèmes spirituels dédiés à l'enseignement de Khadimou Rassoul, disponibles en texte, audio et vidéo."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/taalifs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-vert-800 font-semibold rounded-xl hover:bg-vert-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <BookOpen className="w-5 h-5" />
                Explorer les Taalifs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/actualites"
                className="inline-flex items-center gap-2 px-8 py-4 bg-vert-800/50 text-white font-medium rounded-xl hover:bg-vert-800/70 transition-all border border-white/20"
              >
                Actualités du mouvement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Statistiques ─────────────────────────────────────── */}
      <section className="bg-white border-b border-vert-100 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icone: BookOpen, label: 'Taalifs Texte', count: compteTexte, couleur: 'text-vert-600' },
              { icone: Music, label: 'Taalifs Audio', count: compteAudio, couleur: 'text-blue-600' },
              { icone: Video, label: 'Taalifs Vidéo', count: compteVideo, couleur: 'text-purple-600' },
            ].map((stat) => {
              const Icone = stat.icone
              return (
                <div key={stat.label} className="text-center p-4">
                  <Icone className={`w-6 h-6 ${stat.couleur} mx-auto mb-2`} />
                  <div className="font-serif text-2xl font-bold text-gray-800">{stat.count}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Taalif du jour ────────────────────────────────────── */}
      {taalifDuJour && (
        <section className="py-16 bg-sable-50 motif-islamique">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-or-500 text-sm font-medium mb-3">
                <Star className="w-4 h-4 fill-current" />
                <span className="uppercase tracking-widest">Taalif du Jour</span>
                <Star className="w-4 h-4 fill-current" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-vert-900">
                {formatDate(new Date())}
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden bordure-or">
                <div className="md:flex">
                  {/* Image de couverture */}
                  <div className="md:w-64 md:flex-shrink-0 relative h-56 md:h-auto">
                    <Image
                      src={taalifDuJour.imageUrl ?? genererImageCouvertureSvg(taalifDuJour.titreFr)}
                      alt={taalifDuJour.titreFr}
                      fill
                      className="object-cover"
                      unoptimized={taalifDuJour.imageUrl?.startsWith('data:')}
                    />
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-8 flex flex-col justify-between flex-1">
                    <div>
                      {/* Badge format */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                        taalifDuJour.format === 'TEXTE' ? 'bg-vert-100 text-vert-700' :
                        taalifDuJour.format === 'AUDIO' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {taalifDuJour.format === 'TEXTE' ? '📝' : taalifDuJour.format === 'AUDIO' ? '🎵' : '🎬'}
                        {taalifDuJour.format}
                      </span>
                      
                      {/* Titre en wolof */}
                      <h3 className="font-arabic text-xl text-gray-700 mb-2" dir="rtl">
                        {taalifDuJour.titreWolof}
                      </h3>
                      
                      {/* Titre en français */}
                      <h4 className="font-serif text-2xl font-bold text-vert-900 mb-3">
                        {taalifDuJour.titreFr}
                      </h4>
                      
                      {/* Extrait du texte */}
                      {taalifDuJour.texteFr && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {taalifDuJour.texteFr}
                        </p>
                      )}
                      
                      {/* Thème et auteur */}
                      <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
                        <span>Par {taalifDuJour.auteur}</span>
                        {taalifDuJour.theme && (
                          <>
                            <span>·</span>
                            <span className="text-vert-600">{taalifDuJour.theme}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Link
                      href={`/taalifs/${taalifDuJour.id}`}
                      className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-vert-600 text-white font-medium rounded-xl hover:bg-vert-700 transition-colors w-fit"
                    >
                      Lire ce Taalif
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Derniers ajouts ───────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-vert-500 text-sm font-medium uppercase tracking-widest mb-2">
                Derniers ajouts
              </div>
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Nouveaux Taalifs
              </h2>
            </div>
            <Link
              href="/taalifs"
              className="hidden sm:inline-flex items-center gap-2 text-vert-600 font-medium hover:text-vert-800 transition-colors"
            >
              Voir tous les taalifs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {derniersAjouts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-serif text-lg">Aucun taalif disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {derniersAjouts.map((taalif) => (
                <CardTaalif key={taalif.id} taalif={taalif} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              href="/taalifs"
              className="inline-flex items-center gap-2 px-6 py-3 border border-vert-300 text-vert-700 font-medium rounded-xl hover:bg-vert-50 transition-colors"
            >
              Voir tous les taalifs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────── */}
      <section className="py-16 bg-vert-950 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="font-arabic text-or-400 text-xl mb-4" dir="rtl">
            ❖ الحمد لله رب العالمين ❖
          </p>
          <h2 className="font-serif text-3xl font-bold mb-4">
            Rejoignez la communauté TAALIF
          </h2>
          <p className="text-vert-300 max-w-xl mx-auto mb-8">
            Accédez à l'ensemble des taalifs, téléchargez vos poèmes préférés 
            et restez informé des actualités du mouvement mouridiya.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-or-400 text-vert-950 font-bold rounded-xl hover:bg-or-500 transition-all shadow-lg"
          >
            Créer un compte gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
