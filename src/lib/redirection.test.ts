import { describe, it, expect } from 'vitest'
import { securiserRedirection } from './redirection'

describe('securiserRedirection', () => {
  it('conserve les chemins internes et leur query string', () => {
    expect(securiserRedirection('/taalifs')).toBe('/taalifs')
    expect(securiserRedirection('/taalifs?page=2&q=touba')).toBe('/taalifs?page=2&q=touba')
    expect(securiserRedirection('/')).toBe('/')
  })

  it('ramène une URL absolue externe à son chemin', () => {
    // Cœur de la protection : après connexion, l'utilisateur ne doit jamais
    // pouvoir être expédié hors du domaine.
    expect(securiserRedirection('https://evil.com/phish')).toBe('/phish')
    expect(securiserRedirection('http://evil.com')).toBe('/')
  })

  it('neutralise les URL protocole-relatives', () => {
    // `//evil.com/compte` est interprété comme hôte evil.com + chemin /compte.
    // L'hôte est écarté et seul le chemin subsiste : la redirection reste donc
    // interne au site. La propriété qui compte n'est pas « le résultat vaut / »
    // mais « le résultat ne désigne jamais un autre domaine ».
    expect(securiserRedirection('//evil.com')).toBe('/')
    expect(securiserRedirection('//evil.com/compte')).toBe('/compte')
  })

  it('ne produit jamais autre chose qu\'un chemin interne', () => {
    const hostiles = [
      'https://evil.com/phish',
      '//evil.com/compte',
      'https://evil.com@taalif.sn/',
      'javascript:alert(1)',
      'data:text/html,<script>',
      '\\\\evil.com',
    ]

    for (const url of hostiles) {
      const resultat = securiserRedirection(url)
      expect(resultat.startsWith('/'), `${url} → ${resultat}`).toBe(true)
      expect(resultat.startsWith('//'), `${url} → ${resultat}`).toBe(false)
      expect(resultat, `${url} → ${resultat}`).not.toContain('evil.com')
    }
  })

  it('rejette les schémas opaques', () => {
    expect(securiserRedirection('javascript:alert(1)')).toBe('/')
    expect(securiserRedirection('data:text/html,<script>')).toBe('/')
    expect(securiserRedirection('mailto:x@y.z')).toBe('/')
  })

  it('retombe sur la base fournie', () => {
    expect(securiserRedirection('javascript:void(0)', '/login')).toBe('/login')
  })
})
