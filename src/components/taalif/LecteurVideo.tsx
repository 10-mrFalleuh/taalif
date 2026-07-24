'use client'
// Composant LecteurVideo
// Lecteur vidéo HTML5 avec bouton de téléchargement MP4

import { useRef, useState } from 'react'
import { Download, Maximize2, Play } from 'lucide-react'
import { nomTelechargement } from '@/lib/fichiers'

interface PropsLecteurVideo {
  src: string
  titre: string
  taalifId: string
  poster?: string
  nbTelechargements?: number
}

export function LecteurVideo({ src, titre, taalifId, poster, nbTelechargements = 0 }: PropsLecteurVideo) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [aCommence, setACommence] = useState(false)
  const [telechargements, setTelechargements] = useState(nbTelechargements)

  // Téléchargement avec compteur
  const telecharger = async () => {
    try {
      const res = await fetch(`/api/taalifs/${taalifId}/telecharger`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json().catch(() => null)
        if (typeof data?.nbTelechargements === 'number') setTelechargements(data.nbTelechargements)
      }
    } catch {}

    // Extension réelle du fichier, et non « .mp4 » systématique
    const lien = document.createElement('a')
    lien.href = src
    lien.download = nomTelechargement(src, titre)
    document.body.appendChild(lien)
    lien.click()
    document.body.removeChild(lien)
  }

  // Plein écran
  const pleinEcran = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
      {/* Zone vidéo */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          preload="metadata"
          className="w-full h-full"
          onPlay={() => setACommence(true)}
        />
        
        {/* Overlay avant lecture */}
        {!aCommence && !poster && (
          <div className="absolute inset-0 flex items-center justify-center bg-vert-950/80 pointer-events-none">
            <div className="text-center text-white">
              <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center mx-auto mb-3">
                <Play className="w-10 h-10 fill-white ml-1" />
              </div>
              <p className="font-serif text-lg">{titre}</p>
            </div>
          </div>
        )}
      </div>

      {/* Barre d'actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-vert-950">
        <p className="text-white/70 text-sm truncate max-w-[60%]">{titre}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={pleinEcran}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg"
            title="Plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={telecharger}
            title={`${telechargements} téléchargement${telechargements > 1 ? 's' : ''}`}
            className="flex items-center gap-2 px-4 py-2 bg-vert-600 text-white text-sm font-medium rounded-lg hover:bg-vert-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Télécharger</span>
            {telechargements > 0 && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{telechargements}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
