// Génération et vérification des tokens à usage unique
// (vérification d'email, réinitialisation de mot de passe)
//
// Principe : le token brut n'existe qu'en transit (dans l'email envoyé à
// l'utilisateur). La base ne stocke que son empreinte SHA-256. Une lecture de
// la base ne permet donc plus de prendre le contrôle d'un compte.
//
// SHA-256 sans sel est volontaire ici : contrairement à un mot de passe, le
// token fait 256 bits d'entropie aléatoire — il n'est pas devinable par force
// brute ni par table arc-en-ciel.

import crypto from 'crypto'

export interface TokenGenere {
  /** À envoyer à l'utilisateur, jamais stocké. */
  brut: string
  /** À stocker en base, jamais envoyé. */
  hache: string
}

export function genererToken(): TokenGenere {
  const brut = crypto.randomBytes(32).toString('hex')
  return { brut, hache: hacherToken(brut) }
}

export function hacherToken(brut: string): string {
  return crypto.createHash('sha256').update(brut).digest('hex')
}
