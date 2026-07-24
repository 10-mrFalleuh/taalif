// Identification du type réel d'un fichier uploadé
//
// Le type MIME d'un formulaire multipart est déclaré par le client : il ne
// prouve rien. Le nom du fichier non plus. On identifie donc le contenu par sa
// signature binaire (« magic bytes ») et c'est cette identification — jamais
// les données fournies par le client — qui détermine l'extension écrite sur
// le disque et l'URL publique servie ensuite.

export type FamilleFichier = 'image' | 'audio' | 'video'

export interface TypeDetecte {
  mime: string
  extension: string
  famille: FamilleFichier
}

function commencePar(buffer: Buffer, octets: number[], decalage = 0): boolean {
  if (buffer.length < decalage + octets.length) return false
  return octets.every((o, i) => buffer[decalage + i] === o)
}

function texteA(buffer: Buffer, debut: number, longueur: number): string {
  return buffer.subarray(debut, debut + longueur).toString('ascii')
}

/**
 * Retourne le type réel du fichier, ou null si la signature est inconnue.
 * Une signature inconnue doit toujours entraîner un rejet.
 */
export function detecterType(buffer: Buffer): TypeDetecte | null {
  // ─── Images ────────────────────────────────────────────────────
  if (commencePar(buffer, [0xff, 0xd8, 0xff])) {
    return { mime: 'image/jpeg', extension: 'jpg', famille: 'image' }
  }
  if (commencePar(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: 'image/png', extension: 'png', famille: 'image' }
  }
  if (texteA(buffer, 0, 4) === 'GIF8') {
    return { mime: 'image/gif', extension: 'gif', famille: 'image' }
  }

  // RIFF sert de conteneur à WEBP comme à WAV : c'est le tag suivant qui tranche
  if (texteA(buffer, 0, 4) === 'RIFF') {
    const conteneur = texteA(buffer, 8, 4)
    if (conteneur === 'WEBP') {
      return { mime: 'image/webp', extension: 'webp', famille: 'image' }
    }
    if (conteneur === 'WAVE') {
      return { mime: 'audio/wav', extension: 'wav', famille: 'audio' }
    }
    return null
  }

  // ─── Audio ─────────────────────────────────────────────────────
  // OggS couvre .ogg comme .opus (Opus est encapsulé dans Ogg)
  if (texteA(buffer, 0, 4) === 'OggS') {
    return { mime: 'audio/ogg', extension: 'ogg', famille: 'audio' }
  }
  // MP3 : tag ID3 en tête, ou synchronisation de trame directe (0xFF 0xEx/0xFx)
  if (texteA(buffer, 0, 3) === 'ID3') {
    return { mime: 'audio/mpeg', extension: 'mp3', famille: 'audio' }
  }
  if (buffer.length > 1 && buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { mime: 'audio/mpeg', extension: 'mp3', famille: 'audio' }
  }

  // ─── Conteneurs ISO-BMFF (MP4 / MOV / M4A) ─────────────────────
  // La signature « ftyp » est au décalage 4 ; la marque qui suit distingue
  // l'audio de la vidéo.
  if (texteA(buffer, 4, 4) === 'ftyp') {
    const marque = texteA(buffer, 8, 4)
    if (marque === 'M4A ' || marque === 'M4B ') {
      return { mime: 'audio/mp4', extension: 'm4a', famille: 'audio' }
    }
    if (marque.startsWith('qt')) {
      return { mime: 'video/quicktime', extension: 'mov', famille: 'video' }
    }
    return { mime: 'video/mp4', extension: 'mp4', famille: 'video' }
  }

  // ─── Vidéo ─────────────────────────────────────────────────────
  // EBML : WebM et Matroska partagent l'en-tête
  if (commencePar(buffer, [0x1a, 0x45, 0xdf, 0xa3])) {
    return { mime: 'video/webm', extension: 'webm', famille: 'video' }
  }

  return null
}
