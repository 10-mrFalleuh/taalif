// Page de détail d'un taalif - Server Component
// Affiche le contenu complet selon le format (texte/audio/vidéo)

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDate, genererImageCouvertureSvg } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { AccordeonTexte } from '@/components/taalif/AccordeonTexte'
import { LecteurAudio } from '@/components/taalif/LecteurAudio'
import { LecteurVideo } from '@/components/taalif/LecteurVideo'
import { ChevronLeft, Calendar, User, Tag, Hash } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

// Métadonnées dynamiques
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const taalif = await prisma.taalif.findUnique({ where: { id: params.id } })
  if (!taalif) return { title: 'Taalif introuvable' }
  
  return {
    title: taalif.titreFr,
    description: taalif.texteFr?.slice(0, 160) ?? `Taalif de ${taalif.auteur}`,
  }
}

export default async function PageDetailTaalif({ params }: Props) {
  const taalif = await prisma.taalif.findUnique({
    where: { id: params.id },
  })

  if (!taalif) notFound()

  const imageSrc = taalif.imageUrl ?? genererImageCouvertureSvg(taalif.titreFr)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bouton retour */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/taalifs"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-vert-600 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour aux taalifs
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* ─── En-tête du taalif ─────────────────────────────── */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Image de couverture */}
            <div className="relative h-56 sm:h-72">
              <Image
                src={imageSrc}
                alt={taalif.titreFr}
                fill
                className="object-cover"
                unoptimized={imageSrc.startsWith('data:')}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Badge format */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                  taalif.format === 'TEXTE' ? 'bg-vert-600/90 text-white' :
                  taalif.format === 'AUDIO' ? 'bg-blue-600/90 text-white' :
                  'bg-purple-600/90 text-white'
                }`}>
                  {taalif.format === 'TEXTE' ? '📝' : taalif.format === 'AUDIO' ? '🎵' : '🎬'}
                  {taalif.format}
                </span>
              </div>

              {/* Titre en overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-arabic text-white/80 text-lg mb-1" dir="rtl">
                  {taalif.titreWolof}
                </p>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {taalif.titreFr}
                </h1>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="px-6 py-4 border-t border-gray-50">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-vert-500" />
                  <span>{taalif.auteur}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-vert-500" />
                  <span>{formatDate(taalif.dateCreation)}</span>
                </div>
                {taalif.theme && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-vert-500" />
                    <span className="text-vert-600 font-medium">{taalif.theme}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {taalif.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Hash className="w-4 h-4 text-gray-400" />
                  {taalif.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Contenu selon le format ───────────────────────── */}

          {/* FORMAT TEXTE : accordéon */}
          {taalif.format === 'TEXTE' && (
            <AccordeonTexte
              titreWolof={taalif.titreWolof}
              titreFr={taalif.titreFr}
              texteWolof={taalif.texteWolof}
              texteFr={taalif.texteFr}
              imageUrl={imageSrc}
            />
          )}

          {/* FORMAT AUDIO : lecteur audio */}
          {taalif.format === 'AUDIO' && taalif.fichierUrl && (
            <div className="space-y-4">
              <LecteurAudio
                src={taalif.fichierUrl}
                titre={taalif.titreFr}
                auteur={taalif.auteur}
                taalifId={taalif.id}
              />
              {/* Afficher aussi le texte si disponible */}
              {(taalif.texteWolof || taalif.texteFr) && (
                <AccordeonTexte
                  titreWolof={taalif.titreWolof}
                  titreFr="Paroles / Texte"
                  texteWolof={taalif.texteWolof}
                  texteFr={taalif.texteFr}
                />
              )}
            </div>
          )}

          {/* FORMAT VIDÉO : lecteur vidéo */}
          {taalif.format === 'VIDEO' && taalif.fichierUrl && (
            <div className="space-y-4">
              <LecteurVideo
                src={taalif.fichierUrl}
                titre={taalif.titreFr}
                taalifId={taalif.id}
                poster={taalif.imageUrl ?? undefined}
              />
              {/* Afficher aussi le texte si disponible */}
              {(taalif.texteWolof || taalif.texteFr) && (
                <AccordeonTexte
                  titreWolof={taalif.titreWolof}
                  titreFr="Paroles / Texte"
                  texteWolof={taalif.texteWolof}
                  texteFr={taalif.texteFr}
                />
              )}
            </div>
          )}

          {/* Message si le fichier est manquant */}
          {taalif.format !== 'TEXTE' && !taalif.fichierUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-700 font-medium">
                Le fichier {taalif.format === 'AUDIO' ? 'audio' : 'vidéo'} de ce taalif n'est pas encore disponible.
              </p>
            </div>
          )}

          {/* Ornement de fin de page */}
          <div className="flex items-center justify-center py-4">
            <span className="text-or-400 font-arabic text-3xl">❖</span>
          </div>
        </div>
      </div>
    </div>
  )
}
