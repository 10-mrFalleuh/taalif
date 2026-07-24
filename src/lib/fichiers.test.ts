import { describe, it, expect } from 'vitest'
import { detecterType } from './fichiers'

/** Construit un tampon à partir d'octets, complété pour dépasser les décalages lus. */
function entete(...octets: number[]): Buffer {
  return Buffer.concat([Buffer.from(octets), Buffer.alloc(32)])
}

/** Conteneur ISO-BMFF : 4 octets de taille, « ftyp », puis la marque. */
function isoBmff(marque: string): Buffer {
  return Buffer.concat([
    Buffer.from([0, 0, 0, 0x20]),
    Buffer.from('ftyp'),
    Buffer.from(marque),
    Buffer.alloc(16),
  ])
}

describe('detecterType – formats acceptés', () => {
  it('reconnaît les images', () => {
    expect(detecterType(entete(0xff, 0xd8, 0xff))).toMatchObject({
      mime: 'image/jpeg', extension: 'jpg', famille: 'image',
    })
    expect(detecterType(entete(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toMatchObject({
      mime: 'image/png', extension: 'png', famille: 'image',
    })
    expect(detecterType(Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(16)]))).toMatchObject({
      mime: 'image/gif', famille: 'image',
    })
  })

  it('distingue WEBP et WAV, qui partagent le conteneur RIFF', () => {
    const riff = (tag: string) =>
      Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from(tag), Buffer.alloc(16)])

    expect(detecterType(riff('WEBP'))).toMatchObject({ mime: 'image/webp', famille: 'image' })
    expect(detecterType(riff('WAVE'))).toMatchObject({ mime: 'audio/wav', famille: 'audio' })
  })

  it('reconnaît les audios', () => {
    // Opus est encapsulé dans Ogg : même signature
    expect(detecterType(Buffer.concat([Buffer.from('OggS'), Buffer.alloc(16)]))).toMatchObject({
      mime: 'audio/ogg', extension: 'ogg', famille: 'audio',
    })
    expect(detecterType(Buffer.concat([Buffer.from('ID3'), Buffer.alloc(16)]))).toMatchObject({
      mime: 'audio/mpeg', famille: 'audio',
    })
    // Synchronisation de trame MP3 sans tag ID3
    expect(detecterType(entete(0xff, 0xfb))).toMatchObject({ mime: 'audio/mpeg', famille: 'audio' })
  })

  it('sépare audio et vidéo dans les conteneurs ISO-BMFF', () => {
    expect(detecterType(isoBmff('M4A '))).toMatchObject({ mime: 'audio/mp4', famille: 'audio' })
    expect(detecterType(isoBmff('qt  '))).toMatchObject({ mime: 'video/quicktime', famille: 'video' })
    expect(detecterType(isoBmff('isom'))).toMatchObject({ mime: 'video/mp4', famille: 'video' })
  })

  it('reconnaît le WebM', () => {
    expect(detecterType(entete(0x1a, 0x45, 0xdf, 0xa3))).toMatchObject({
      mime: 'video/webm', famille: 'video',
    })
  })
})

describe('detecterType – contenus rejetés', () => {
  // Ces cas sont le cœur de la protection : un fichier écrit sous une
  // extension exécutable par le navigateur et servi sur le même domaine
  // constituerait une XSS stockée.
  it('rejette le HTML déguisé en image', () => {
    expect(detecterType(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull()
  })

  it('rejette le SVG, vecteur de script', () => {
    expect(detecterType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script/>'))).toBeNull()
  })

  it('rejette un RIFF de conteneur inconnu', () => {
    const riffInconnu = Buffer.concat([
      Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('AVI '), Buffer.alloc(16),
    ])
    expect(detecterType(riffInconnu)).toBeNull()
  })

  it('rejette un contenu vide ou tronqué', () => {
    expect(detecterType(Buffer.alloc(0))).toBeNull()
    expect(detecterType(Buffer.from([0xff]))).toBeNull()
  })
})
