// Sécurisation des URL de redirection
//
// Module volontairement isolé de lib/utils : il est importé par des composants
// clients, et utils embarque genererImageCouvertureSvg() qui dépend de Buffer
// (≈15 ko de polyfill inutiles dans le bundle navigateur).

/**
 * Ramène une URL de redirection à un chemin interne au site.
 *
 * Neutralise les redirections ouvertes : une URL absolue
 * (`https://evil.com/x`) ou protocole-relative (`//evil.com`) est réduite à
 * son chemin, ce qui interdit d'envoyer l'utilisateur hors du domaine après
 * une authentification réussie.
 */
export function securiserRedirection(url: string, base: string = '/'): string {
  try {
    // La base est arbitraire : seuls pathname et search sont conservés.
    const parsed = new URL(url, 'http://localhost')
    const chemin = parsed.pathname + parsed.search

    // Les schémas opaques (javascript:, data:, mailto:) produisent un pathname
    // qui ne commence pas par « / » : on les rejette.
    return chemin.startsWith('/') ? chemin : base
  } catch {
    return base
  }
}
