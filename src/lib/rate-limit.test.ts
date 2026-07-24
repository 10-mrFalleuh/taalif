import { describe, it, expect } from 'vitest'
import { verifierLimite, reinitialiserLimite, extraireIp } from './rate-limit'

// Sans variables Upstash, le module utilise son compteur mémoire : c'est ce
// chemin qui est testé ici.

describe('verifierLimite', () => {
  it('autorise jusqu\'à la limite puis refuse', async () => {
    const cle = `test-limite-${Math.random()}`

    for (let i = 0; i < 3; i++) {
      const r = await verifierLimite(cle, 3, 60_000)
      expect(r.autorise).toBe(true)
      expect(r.restant).toBe(2 - i)
    }

    const refuse = await verifierLimite(cle, 3, 60_000)
    expect(refuse.autorise).toBe(false)
    expect(refuse.restant).toBe(0)
  })

  it('isole les clés les unes des autres', async () => {
    const a = `test-a-${Math.random()}`
    const b = `test-b-${Math.random()}`

    await verifierLimite(a, 1, 60_000)
    expect((await verifierLimite(a, 1, 60_000)).autorise).toBe(false)
    // Épuiser un compte ne doit pas bloquer les autres
    expect((await verifierLimite(b, 1, 60_000)).autorise).toBe(true)
  })

  it('libère le compteur après réinitialisation', async () => {
    const cle = `test-reset-${Math.random()}`

    await verifierLimite(cle, 1, 60_000)
    expect((await verifierLimite(cle, 1, 60_000)).autorise).toBe(false)

    // C'est ce que fait une connexion réussie
    await reinitialiserLimite(cle)
    expect((await verifierLimite(cle, 1, 60_000)).autorise).toBe(true)
  })

  it('repart à zéro une fois la fenêtre écoulée', async () => {
    const cle = `test-fenetre-${Math.random()}`
    const fenetre = 20

    await verifierLimite(cle, 1, fenetre)
    expect((await verifierLimite(cle, 1, fenetre)).autorise).toBe(false)

    // Il faut réellement laisser la fenêtre s'écouler : deux appels dans la
    // même milliseconde tombent forcément dans la même tranche.
    await new Promise((r) => setTimeout(r, fenetre + 5))
    expect((await verifierLimite(cle, 1, fenetre)).autorise).toBe(true)
  })
})

describe('extraireIp', () => {
  it('retient le premier maillon de x-forwarded-for', () => {
    // Une liste « client, proxy1, proxy2 » : seule la tête identifie le client.
    // Prendre l'en-tête entier créerait une clé différente par chaîne de proxy.
    expect(extraireIp({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1, 10.0.0.2' })).toBe('203.0.113.7')
  })

  it('accepte aussi bien un objet simple qu\'un Headers', () => {
    expect(extraireIp({ 'x-forwarded-for': '203.0.113.7' })).toBe('203.0.113.7')
    expect(extraireIp(new Headers({ 'x-forwarded-for': '203.0.113.9' }))).toBe('203.0.113.9')
  })

  it('retombe sur x-real-ip puis sur une valeur par défaut', () => {
    expect(extraireIp({ 'x-real-ip': '198.51.100.4' })).toBe('198.51.100.4')
    expect(extraireIp({})).toBe('inconnue')
    expect(extraireIp(undefined)).toBe('inconnue')
  })
})
