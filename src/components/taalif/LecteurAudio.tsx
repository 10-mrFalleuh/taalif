'use client'
// Composant LecteurAudio
// Lecteur HTML5 personnalisé avec bouton de téléchargement et compteur

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Download, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropsLecteurAudio {
  src: string
  titre: string
  auteur?: string
  taalifId: string
}

export function LecteurAudio({ src, titre, auteur, taalifId }: PropsLecteurAudio) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [enLecture, setEnLecture] = useState(false)
  const [progression, setProgression] = useState(0)
  const [duree, setDuree] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muet, setMuet] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [telechargements, setTelechargements] = useState(0)

  // Contrôle lecture/pause
  const basculerLecture = async () => {
    if (!audioRef.current) return
    if (enLecture) {
      audioRef.current.pause()
    } else {
      await audioRef.current.play()
    }
    setEnLecture(!enLecture)
  }

  // Mise à jour de la progression
  const mettreAJourProgression = () => {
    if (!audioRef.current) return
    const { currentTime, duration } = audioRef.current
    if (duration) setProgression((currentTime / duration) * 100)
  }

  // Clic sur la barre de progression
  const changerPosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duree) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pourcentage = x / rect.width
    audioRef.current.currentTime = pourcentage * duree
  }

  // Avancer/reculer de 10 secondes
  const avancer = (secondes: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duree, audioRef.current.currentTime + secondes))
  }

  // Téléchargement avec compteur
  const telecharger = async () => {
    try {
      // Incrémenter le compteur en base
      await fetch(`/api/taalifs/${taalifId}/telecharger`, { method: 'POST' })
      setTelechargements((n) => n + 1)
    } catch {}
    
    // Déclencher le téléchargement
    const lien = document.createElement('a')
    lien.href = src
    lien.download = `${titre}.mp3`
    document.body.appendChild(lien)
    lien.click()
    document.body.removeChild(lien)
  }

  // Formatage du temps en mm:ss
  const formaterTemps = (secondes: number): string => {
    if (isNaN(secondes)) return '0:00'
    const min = Math.floor(secondes / 60)
    const sec = Math.floor(secondes % 60)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Icône musicale animée */}
          <div className={cn(
            'w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-md',
            enLecture && 'animate-pulse'
          )}>
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h3 className="font-serif font-semibold text-gray-900">{titre}</h3>
            {auteur && <p className="text-sm text-gray-500 mt-0.5">{auteur}</p>}
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="space-y-1">
        <div
          className="h-2 bg-gray-100 rounded-full cursor-pointer group relative"
          onClick={changerPosition}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all relative"
            style={{ width: `${progression}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formaterTemps(audioRef.current?.currentTime ?? 0)}</span>
          <span>{formaterTemps(duree)}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-between">
        {/* Contrôles de lecture */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => avancer(-10)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            title="Reculer de 10s"
            disabled={chargement}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={basculerLecture}
            disabled={chargement}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all',
              chargement
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
            )}
          >
            {chargement ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : enLecture ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => avancer(10)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
            title="Avancer de 10s"
            disabled={chargement}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume et téléchargement */}
        <div className="flex items-center gap-3">
          {/* Contrôle volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => {
                if (!audioRef.current) return
                setMuet(!muet)
                audioRef.current.muted = !muet
              }}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              {muet ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={muet ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                setVolume(val)
                if (audioRef.current) audioRef.current.volume = val
                setMuet(val === 0)
              }}
              className="w-20 accent-blue-600"
            />
          </div>

          {/* Bouton téléchargement */}
          <button
            onClick={telecharger}
            className="flex items-center gap-2 px-4 py-2 bg-vert-600 text-white text-sm font-medium rounded-lg hover:bg-vert-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Télécharger MP3</span>
            <span className="sm:hidden">MP3</span>
          </button>
        </div>
      </div>

      {/* Élément audio HTML5 natif (caché) */}
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => {
          setDuree(audioRef.current?.duration ?? 0)
          setChargement(false)
        }}
        onTimeUpdate={mettreAJourProgression}
        onEnded={() => {
          setEnLecture(false)
          setProgression(0)
        }}
        onWaiting={() => setChargement(true)}
        onCanPlay={() => setChargement(false)}
        preload="metadata"
        className="hidden"
      />
    </div>
  )
}
