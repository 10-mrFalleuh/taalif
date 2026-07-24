import { describe, it, expect } from 'vitest'
import {
  cn,
  tronquer,
  creerSlug,
  formatTailleFichier,
  getExtension,
  estAudio,
  estVideo,
  tempsLecture,
  genererImageCouvertureSvg,
} from './utils'

describe('cn', () => {
  it('déduplique les classes Tailwind en conflit', () => {
    // tailwind-merge doit garder la dernière : sinon les surcharges de style
    // des composants ne prennent pas.
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('gère les classes conditionnelles', () => {
    expect(cn('base', false && 'absente', 'presente')).toBe('base presente')
  })
})

describe('tronquer', () => {
  it('laisse intact un texte plus court que la limite', () => {
    expect(tronquer('Touba', 10)).toBe('Touba')
  })

  it('coupe et suffixe au-delà de la limite', () => {
    expect(tronquer('Khadimou Rassoul', 8)).toBe('Khadimou...')
  })
})

describe('creerSlug', () => {
  it('retire accents, ponctuation et espaces', () => {
    expect(creerSlug('Médina Baye – La Connaissance')).toBe('medina-baye-la-connaissance')
  })

  it('réduit les tirets consécutifs', () => {
    expect(creerSlug('Touba   ///   Cité')).toBe('touba-cite')
  })
})

describe('formatTailleFichier', () => {
  it('choisit l\'unité lisible', () => {
    expect(formatTailleFichier(512)).toBe('512 o')
    expect(formatTailleFichier(2048)).toBe('2.0 Ko')
    expect(formatTailleFichier(5 * 1024 * 1024)).toBe('5.0 Mo')
    expect(formatTailleFichier(3 * 1024 * 1024 * 1024)).toBe('3.0 Go')
  })
})

describe('getExtension / estAudio / estVideo', () => {
  it('extrait l\'extension en minuscules', () => {
    expect(getExtension('Taalif.MP3')).toBe('mp3')
    expect(getExtension('sans-extension')).toBe('sans-extension')
  })

  it('classe les médias', () => {
    expect(estAudio('poeme.mp3')).toBe(true)
    expect(estAudio('poeme.mp4')).toBe(false)
    expect(estVideo('poeme.mp4')).toBe(true)
    expect(estVideo('poeme.txt')).toBe(false)
  })
})

describe('tempsLecture', () => {
  it('arrondit au nombre de minutes supérieur', () => {
    expect(tempsLecture('un mot')).toBe('1 min de lecture')
    expect(tempsLecture(Array(401).fill('mot').join(' '))).toBe('3 min de lecture')
  })
})

describe('genererImageCouvertureSvg', () => {
  it('produit un data-URI SVG en base64', () => {
    const url = genererImageCouvertureSvg('La Connaissance')
    expect(url.startsWith('data:image/svg+xml;base64,')).toBe(true)
  })

  it('est déterministe pour un même titre', () => {
    // La couverture est régénérée à chaque rendu : elle ne doit pas changer
    // d'aspect d'une page à l'autre.
    expect(genererImageCouvertureSvg('Touba')).toBe(genererImageCouvertureSvg('Touba'))
  })

  it('incorpore le titre dans le SVG', () => {
    const svg = Buffer.from(
      genererImageCouvertureSvg('Touba').replace('data:image/svg+xml;base64,', ''),
      'base64'
    ).toString()
    expect(svg).toContain('Touba')
  })
})
