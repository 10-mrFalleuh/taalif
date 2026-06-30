'use client'
// Formulaire Admin – Créer / Modifier un Taalif
// Gère tous les formats : TEXTE, AUDIO, VIDEO

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X, Save, Trash2 } from 'lucide-react'
import { afficherToast } from '@/components/ui/toaster'
import type { Taalif } from '@prisma/client'

interface PropsFormulaire {
  taalif?: Taalif // Si fourni : mode édition, sinon : mode création
}

const THEMES_SUGGERES = [
  'Connaissance et Spiritualité',
  'Éloge du Prophète',
  'Touba – Cité Sainte',
  'Éducation Islamique',
  'Dévotion et Prière',
  'Mouridisme',
]

export function FormulaireTaalifAdmin({ taalif }: PropsFormulaire) {
  const router = useRouter()
  const modeEdition = !!taalif

  const [formulaire, setFormulaire] = useState({
    titreWolof: taalif?.titreWolof ?? '',
    titreFr: taalif?.titreFr ?? '',
    texteWolof: taalif?.texteWolof ?? '',
    texteFr: taalif?.texteFr ?? '',
    format: taalif?.format ?? 'TEXTE',
    fichierUrl: taalif?.fichierUrl ?? '',
    auteur: taalif?.auteur ?? 'Cheikh Ahmadou Kara Mbacké',
    theme: taalif?.theme ?? '',
    tags: taalif?.tags.join(', ') ?? '',
    estTaalifDuJour: taalif?.estTaalifDuJour ?? false,
  })

  const [chargement, setChargement] = useState(false)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [uploadImageEnCours, setUploadImageEnCours] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const mettreAJour = (champ: string, valeur: string | boolean) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }))
    // Effacer l'erreur du champ modifié
    if (erreurs[champ]) setErreurs((prev) => { const e = { ...prev }; delete e[champ]; return e })
  }

  // Upload de fichier audio/vidéo
  const gererUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setUploadEnCours(true)
    const data = new FormData()
    data.append('fichier', fichier)
    data.append('type', formulaire.format.toLowerCase())

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data })
      const json = await res.json()
      if (res.ok) {
        mettreAJour('fichierUrl', json.url)
        afficherToast('Fichier uploadé avec succès', 'succes')
      } else {
        afficherToast(json.erreur ?? 'Échec de l\'upload', 'erreur')
      }
    } catch {
      afficherToast('Erreur réseau lors de l\'upload', 'erreur')
    } finally {
      setUploadEnCours(false)
    }
  }

  // Upload d'image de couverture
const gererUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const fichier = e.target.files?.[0]
  if (!fichier) return

  setUploadImageEnCours(true)
  const data = new FormData()
  data.append('fichier', fichier)
  data.append('type', 'image')

  try {
    const res = await fetch('/api/upload', { method: 'POST', body: data })
    const json = await res.json()
    if (res.ok) {
      mettreAJour('imageUrl', json.url)
      afficherToast('Image uploadée avec succès', 'succes')
    } else {
      afficherToast(json.erreur ?? 'Échec de l\'upload', 'erreur')
    }
  } catch {
    afficherToast('Erreur réseau lors de l\'upload', 'erreur')
  } finally {
    setUploadImageEnCours(false)
  }
}

  // Validation côté client
  const valider = (): boolean => {
    const e: Record<string, string> = {}
    if (!formulaire.titreFr.trim()) e.titreFr = 'Le titre en français est requis'
    if (!formulaire.titreWolof.trim()) e.titreWolof = 'Le titre en wolof est requis'
    if (formulaire.format === 'TEXTE' && !formulaire.texteFr.trim() && !formulaire.texteWolof.trim()) {
      e.texteFr = 'Au moins un texte est requis pour le format TEXTE'
    }
    setErreurs(e)
    return Object.keys(e).length === 0
  }

  // Soumission du formulaire
  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valider()) return
    setChargement(true)

    const payload = {
      ...formulaire,
      tags: formulaire.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    try {
      const url = modeEdition ? `/api/taalifs/${taalif.id}` : '/api/taalifs'
      const method = modeEdition ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        afficherToast(data.erreur ?? 'Erreur lors de la sauvegarde', 'erreur')
      } else {
        afficherToast(
          modeEdition ? 'Taalif modifié avec succès' : 'Taalif créé avec succès',
          'succes'
        )
        router.push('/admin/taalifs')
        router.refresh()
      }
    } catch {
      afficherToast('Erreur réseau', 'erreur')
    } finally {
      setChargement(false)
    }
  }

  const champClass = (nom: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${erreurs[nom]
      ? 'border-red-300 focus:ring-red-300'
      : 'border-gray-200 focus:ring-vert-500 focus:border-vert-500'
    }`

  return (
    <form onSubmit={soumettre} className="space-y-6">

      {/* ─── Titres ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Titres</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Titre en français <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formulaire.titreFr}
            onChange={(e) => mettreAJour('titreFr', e.target.value)}
            className={champClass('titreFr')}
            placeholder="Le Chemin de la Connaissance"
          />
          {erreurs.titreFr && <p className="text-red-500 text-xs">{erreurs.titreFr}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Titre en wolof / arabe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formulaire.titreWolof}
            onChange={(e) => mettreAJour('titreWolof', e.target.value)}
            className={champClass('titreWolof')}
            placeholder="Xam Xam bi – Yoon wi"
            dir="rtl"
          />
          {erreurs.titreWolof && <p className="text-red-500 text-xs">{erreurs.titreWolof}</p>}
        </div>
      </div>

      {/* ─── Format et fichier ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Format</h2>

        <div className="flex gap-3">
          {(['TEXTE', 'AUDIO', 'VIDEO'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => mettreAJour('format', fmt)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${formulaire.format === fmt
                  ? 'bg-vert-600 text-white border-vert-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-vert-300'
                }`}
            >
              {fmt === 'TEXTE' ? '📝 Texte' : fmt === 'AUDIO' ? '🎵 Audio' : '🎬 Vidéo'}
            </button>
          ))}
        </div>

        {/* Upload fichier audio/vidéo */}
        {(formulaire.format === 'AUDIO' || formulaire.format === 'VIDEO') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fichier {formulaire.format === 'AUDIO' ? 'MP3' : 'MP4'}
            </label>
            {formulaire.fichierUrl ? (
              <div className="flex items-center gap-3 p-3 bg-vert-50 rounded-lg border border-vert-200">
                <span className="text-sm text-vert-700 truncate flex-1">{formulaire.fichierUrl}</span>
                <button
                  type="button"
                  onClick={() => mettreAJour('fichierUrl', '')}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadEnCours ? 'border-vert-400 bg-vert-50' : 'border-gray-200 hover:border-vert-300 hover:bg-gray-50'
                }`}>
                {uploadEnCours ? (
                  <><Loader2 className="w-8 h-8 text-vert-500 animate-spin" /><span className="text-sm text-vert-600">Upload en cours...</span></>
                ) : (
                  <><Upload className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">Cliquez pour sélectionner un fichier {formulaire.format === 'AUDIO' ? 'MP3' : 'MP4'}</span></>
                )}
                <input
                  type="file"
                  accept={formulaire.format === 'AUDIO' ? 'audio/*' : 'video/*'}
                  onChange={gererUpload}
                  className="hidden"
                  disabled={uploadEnCours}
                />
              </label>
            )}
            {/* Ou URL manuelle */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">URL</span>
              <input
                type="text"
                value={formulaire.fichierUrl}
                onChange={(e) => mettreAJour('fichierUrl', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500"
                placeholder="Ou collez l'URL directement"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Textes ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Textes</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Texte en français {formulaire.format === 'TEXTE' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={8}
            value={formulaire.texteFr}
            onChange={(e) => mettreAJour('texteFr', e.target.value)}
            className={champClass('texteFr')}
            placeholder="Saisissez le texte du taalif en français..."
          />
          {erreurs.texteFr && <p className="text-red-500 text-xs">{erreurs.texteFr}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Texte original (wolof / arabe)</label>
          <textarea
            rows={8}
            value={formulaire.texteWolof}
            onChange={(e) => mettreAJour('texteWolof', e.target.value)}
            className={`${champClass('texteWolof')} font-arabic`}
            placeholder="Saisissez le texte original..."
            dir="rtl"
          />
        </div>
      </div>

      {/* ─── Métadonnées ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Métadonnées</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Auteur</label>
            <input
              type="text"
              value={formulaire.auteur}
              onChange={(e) => mettreAJour('auteur', e.target.value)}
              className={champClass('auteur')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Thème</label>
            <input
              type="text"
              list="themes-liste"
              value={formulaire.theme}
              onChange={(e) => mettreAJour('theme', e.target.value)}
              className={champClass('theme')}
              placeholder="Ex : Connaissance et Spiritualité"
            />
            <datalist id="themes-liste">
              {THEMES_SUGGERES.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
        </div>

        {/* Upload image de couverture */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Image de couverture
          </label>
          {formulaire.imageUrl ? (
            <div className="relative">
              <img
                src={formulaire.imageUrl}
                alt="Aperçu"
                className="w-full h-40 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={() => mettreAJour('imageUrl', '')}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-vert-300 hover:bg-gray-50 transition-colors">
              {uploadImageEnCours ? (
                <>
                  <Loader2 className="w-8 h-8 text-vert-500 animate-spin" />
                  <span className="text-sm text-vert-600">Upload en cours...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Cliquez pour uploader une image</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WEBP – max 5 Mo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={gererUploadImage}
                className="hidden"
                disabled={uploadImageEnCours}
              />
            </label>
          )}
          {/* Ou URL manuelle */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">URL</span>
            <input
              type="text"
              value={formulaire.imageUrl}
              onChange={(e) => mettreAJour('imageUrl', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vert-500"
              placeholder="Ou collez une URL d'image directement"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Tags <span className="text-gray-400 text-xs">(séparés par des virgules)</span>
          </label>
          <input
            type="text"
            value={formulaire.tags}
            onChange={(e) => mettreAJour('tags', e.target.value)}
            className={champClass('tags')}
            placeholder="Touba, khassida, connaissance"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => mettreAJour('estTaalifDuJour', !formulaire.estTaalifDuJour)}
            className={`w-10 h-6 rounded-full transition-colors relative ${formulaire.estTaalifDuJour ? 'bg-vert-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formulaire.estTaalifDuJour ? 'left-5' : 'left-1'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Sélectionner comme Taalif du Jour</span>
        </label>
      </div>

      {/* ─── Actions ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={chargement || uploadEnCours}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-vert-600 text-white font-semibold rounded-xl hover:bg-vert-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {chargement ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde...</>
          ) : (
            <><Save className="w-4 h-4" />{modeEdition ? 'Enregistrer les modifications' : 'Créer le taalif'}</>
          )}
        </button>
      </div>
    </form>
  )
}
