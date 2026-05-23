// Dashboard Admin - Server Component
// Vue d'ensemble avec statistiques et accès rapide aux CRUD

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Music, Video, Newspaper, Users, Settings, ArrowRight, TrendingUp, Download } from 'lucide-react'

async function getStats() {
  const [nbTaalifs, nbAudio, nbVideo, nbTexte, nbActualites, nbUsers, totalTelechargements] = await Promise.all([
    prisma.taalif.count(),
    prisma.taalif.count({ where: { format: 'AUDIO' } }),
    prisma.taalif.count({ where: { format: 'VIDEO' } }),
    prisma.taalif.count({ where: { format: 'TEXTE' } }),
    prisma.actualite.count(),
    prisma.user.count(),
    prisma.taalif.aggregate({ _sum: { nbTelechargements: true } }),
  ])
  return { nbTaalifs, nbAudio, nbVideo, nbTexte, nbActualites, nbUsers, totalTelechargements: totalTelechargements._sum.nbTelechargements ?? 0 }
}

export default async function PageAdmin() {
  const stats = await getStats()

  const cartes = [
    {
      titre: 'Taalifs Texte',
      valeur: stats.nbTexte,
      icone: BookOpen,
      couleur: 'bg-vert-50 text-vert-600 border-vert-100',
      href: '/admin/taalifs?format=TEXTE',
    },
    {
      titre: 'Taalifs Audio',
      valeur: stats.nbAudio,
      icone: Music,
      couleur: 'bg-blue-50 text-blue-600 border-blue-100',
      href: '/admin/taalifs?format=AUDIO',
    },
    {
      titre: 'Taalifs Vidéo',
      valeur: stats.nbVideo,
      icone: Video,
      couleur: 'bg-purple-50 text-purple-600 border-purple-100',
      href: '/admin/taalifs?format=VIDEO',
    },
    {
      titre: 'Actualités',
      valeur: stats.nbActualites,
      icone: Newspaper,
      couleur: 'bg-amber-50 text-amber-600 border-amber-100',
      href: '/admin/actualites',
    },
    {
      titre: 'Utilisateurs',
      valeur: stats.nbUsers,
      icone: Users,
      couleur: 'bg-gray-50 text-gray-600 border-gray-100',
      href: '/admin/utilisateurs',
    },
    {
      titre: 'Téléchargements',
      valeur: stats.totalTelechargements,
      icone: Download,
      couleur: 'bg-rose-50 text-rose-600 border-rose-100',
      href: '/admin/taalifs',
    },
  ]

  const actions = [
    { label: 'Gérer les Taalifs', desc: 'Ajouter, modifier, supprimer des taalifs', href: '/admin/taalifs', icone: BookOpen, couleur: 'border-vert-200 hover:bg-vert-50' },
    { label: 'Gérer les Actualités', desc: 'Articles, événements, annonces', href: '/admin/actualites', icone: Newspaper, couleur: 'border-amber-200 hover:bg-amber-50' },
    { label: 'Gérer les Utilisateurs', desc: 'Comptes, rôles, accès', href: '/admin/utilisateurs', icone: Users, couleur: 'border-gray-200 hover:bg-gray-50' },
    { label: 'Paramètres du site', desc: 'Mouvement, taalif du jour', href: '/admin/parametres', icone: Settings, couleur: 'border-purple-200 hover:bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête admin */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-vert-600 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div className="text-vert-500 text-sm font-medium uppercase tracking-widest">Administration</div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Tableau de bord</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Statistiques */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-vert-500" />
            Vue d'ensemble
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cartes.map((c) => {
              const Icone = c.icone
              return (
                <Link
                  key={c.titre}
                  href={c.href}
                  className={`bg-white rounded-xl border p-5 flex flex-col gap-3 carte-hover ${c.couleur}`}
                >
                  <Icone className="w-6 h-6" />
                  <div>
                    <div className="font-serif text-2xl font-bold text-gray-900">{c.valeur}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.titre}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Actions rapides */}
        <section>
          <h2 className="font-serif text-lg font-semibold text-gray-700 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((a) => {
              const Icone = a.icone
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`bg-white rounded-xl border p-6 flex items-center justify-between transition-colors group ${a.couleur}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{a.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{a.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* Lien retour site */}
        <div className="pt-2">
          <Link href="/" className="text-sm text-vert-600 hover:text-vert-800 font-medium transition-colors">
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  )
}
