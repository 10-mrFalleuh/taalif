import { describe, it, expect } from 'vitest'
import { genererToken, hacherToken } from './tokens'

describe('genererToken', () => {
  it('produit un token de 32 octets en hexadécimal', () => {
    const { brut } = genererToken()
    expect(brut).toMatch(/^[0-9a-f]{64}$/)
  })

  it('ne stocke jamais la valeur envoyée par email', () => {
    // C'est toute la protection : une lecture de la base ne doit pas
    // permettre de reconstituer le lien reçu par l'utilisateur.
    const { brut, hache } = genererToken()
    expect(hache).not.toBe(brut)
    expect(hache).toMatch(/^[0-9a-f]{64}$/)
  })

  it('génère un token différent à chaque appel', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => genererToken().brut))
    expect(tokens.size).toBe(50)
  })
})

describe('hacherToken', () => {
  it('est déterministe, ce qui permet la comparaison à la vérification', () => {
    const { brut, hache } = genererToken()
    expect(hacherToken(brut)).toBe(hache)
    expect(hacherToken(brut)).toBe(hacherToken(brut))
  })

  it('ne fait correspondre aucun autre token', () => {
    const { brut, hache } = genererToken()
    expect(hacherToken(brut + 'x')).not.toBe(hache)
    expect(hacherToken('')).not.toBe(hache)
  })
})
