import { describe, it, expect } from 'vitest'
import {
  schemaInscription,
  schemaTaalif,
  schemaActualite,
  schemaFiltreTaalif,
} from './validations'

const inscriptionValide = {
  nom: 'Modou Fall',
  email: 'Modou.Fall@Example.SN',
  motDePasse: 'Touba2024',
  confirmationMotDePasse: 'Touba2024',
}

describe('schemaInscription', () => {
  it('accepte une inscription valide et normalise l\'email', () => {
    const r = schemaInscription.safeParse(inscriptionValide)
    expect(r.success).toBe(true)
    // La normalisation compte : la recherche en base se fait en minuscules.
    if (r.success) expect(r.data.email).toBe('modou.fall@example.sn')
  })

  it('exige majuscule, minuscule et chiffre dans le mot de passe', () => {
    const faibles = ['touba2024', 'TOUBA2024', 'ToubaTouba', 'Tb1']
    for (const motDePasse of faibles) {
      const r = schemaInscription.safeParse({
        ...inscriptionValide, motDePasse, confirmationMotDePasse: motDePasse,
      })
      expect(r.success, `« ${motDePasse} » aurait dû être refusé`).toBe(false)
    }
  })

  it('refuse une confirmation divergente', () => {
    const r = schemaInscription.safeParse({
      ...inscriptionValide, confirmationMotDePasse: 'Touba2025',
    })
    expect(r.success).toBe(false)
  })

  it('refuse un email malformé', () => {
    expect(schemaInscription.safeParse({ ...inscriptionValide, email: 'pas-un-email' }).success)
      .toBe(false)
  })
})

describe('schemaTaalif', () => {
  const base = { titreWolof: 'Xam Xam bi', titreFr: 'La Connaissance', format: 'TEXTE' }

  it('applique les valeurs par défaut', () => {
    const r = schemaTaalif.safeParse(base)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.auteur).toBe('Cheikh Ahmadou Kara Mbacké')
      expect(r.data.tags).toEqual([])
      expect(r.data.estTaalifDuJour).toBe(false)
    }
  })

  it('n\'accepte que les trois formats connus', () => {
    expect(schemaTaalif.safeParse({ ...base, format: 'PODCAST' }).success).toBe(false)
    for (const format of ['TEXTE', 'AUDIO', 'VIDEO']) {
      expect(schemaTaalif.safeParse({ ...base, format }).success).toBe(true)
    }
  })

  it('exige les deux titres', () => {
    expect(schemaTaalif.safeParse({ ...base, titreFr: '' }).success).toBe(false)
    expect(schemaTaalif.safeParse({ ...base, titreWolof: 'x' }).success).toBe(false)
  })
})

describe('schemaActualite', () => {
  const base = { titre: 'Magal de Touba', contenu: 'Un contenu suffisamment long.', categorie: 'EVENEMENT' }

  it('accepte une actualité valide', () => {
    expect(schemaActualite.safeParse(base).success).toBe(true)
  })

  it('refuse un contenu trop court', () => {
    expect(schemaActualite.safeParse({ ...base, contenu: 'court' }).success).toBe(false)
  })

  it('refuse une catégorie inconnue', () => {
    expect(schemaActualite.safeParse({ ...base, categorie: 'DIVERS' }).success).toBe(false)
  })
})

describe('schemaFiltreTaalif', () => {
  it('convertit les paramètres d\'URL en nombres', () => {
    const r = schemaFiltreTaalif.safeParse({ page: '3', limite: '20' })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.page).toBe(3)
      expect(r.data.limite).toBe(20)
    }
  })

  it('applique les valeurs par défaut sur une requête vide', () => {
    const r = schemaFiltreTaalif.safeParse({})
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.page).toBe(1)
      expect(r.data.limite).toBe(12)
      expect(r.data.tri).toBe('date_desc')
    }
  })

  it('plafonne la limite, ce qui borne le coût d\'une requête', () => {
    expect(schemaFiltreTaalif.safeParse({ limite: '5000' }).success).toBe(false)
    expect(schemaFiltreTaalif.safeParse({ page: '0' }).success).toBe(false)
    expect(schemaFiltreTaalif.safeParse({ page: '-1' }).success).toBe(false)
  })
})
