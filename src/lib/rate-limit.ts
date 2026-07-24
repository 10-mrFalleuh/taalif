// Limiteur de débit partagé
// Utilise Upstash Redis via son API REST si les variables d'environnement sont
// présentes, sinon retombe sur un compteur en mémoire.
//
// ⚠ Le fallback mémoire n'est PAS partagé entre instances serverless et est
// remis à zéro à chaque démarrage à froid : il protège en développement et sur
// un serveur unique, pas sur un déploiement multi-instance. En production,
// définir UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN.

const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL
const TOKEN_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN
const redisActif = Boolean(URL_REDIS && TOKEN_REDIS)

export interface ResultatLimite {
  autorise: boolean
  restant: number
}

// ─── Backend Redis (Upstash REST, sans dépendance externe) ─────────

async function pipelineRedis(commandes: (string | number)[][]): Promise<unknown[]> {
  const reponse = await fetch(`${URL_REDIS}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN_REDIS}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commandes),
    cache: 'no-store',
  })

  if (!reponse.ok) throw new Error(`Upstash a répondu ${reponse.status}`)

  const resultats = (await reponse.json()) as { result?: unknown; error?: string }[]
  return resultats.map((r) => r.result)
}

async function verifierAvecRedis(
  cle: string,
  limite: number,
  fenetreMs: number
): Promise<ResultatLimite> {
  // INCR crée la clé à 1 si absente ; PEXPIRE ... NX ne pose le TTL qu'au
  // premier appel, ce qui donne une fenêtre glissante par tranche.
  const [compteBrut] = await pipelineRedis([
    ['INCR', cle],
    ['PEXPIRE', cle, fenetreMs, 'NX'],
  ])

  const compte = Number(compteBrut)
  return { autorise: compte <= limite, restant: Math.max(0, limite - compte) }
}

// ─── Backend mémoire (développement / instance unique) ─────────────

interface Entree {
  compte: number
  expireLe: number
}

const compteurs = new Map<string, Entree>()
let dernierNettoyage = 0
const INTERVALLE_NETTOYAGE_MS = 60_000

// Purge les entrées expirées au plus une fois par minute : sans cela la Map
// grossit indéfiniment (une entrée par IP vue depuis le démarrage).
function nettoyer(maintenant: number) {
  if (maintenant - dernierNettoyage < INTERVALLE_NETTOYAGE_MS) return
  dernierNettoyage = maintenant
  const expirees: string[] = []
  compteurs.forEach((entree, cle) => {
    if (entree.expireLe <= maintenant) expirees.push(cle)
  })
  expirees.forEach((cle) => compteurs.delete(cle))
}

function verifierEnMemoire(cle: string, limite: number, fenetreMs: number): ResultatLimite {
  const maintenant = Date.now()
  nettoyer(maintenant)

  const entree = compteurs.get(cle)
  if (!entree || entree.expireLe <= maintenant) {
    compteurs.set(cle, { compte: 1, expireLe: maintenant + fenetreMs })
    return { autorise: true, restant: limite - 1 }
  }

  entree.compte++
  return { autorise: entree.compte <= limite, restant: Math.max(0, limite - entree.compte) }
}

// ─── API publique ──────────────────────────────────────────────────

/**
 * Incrémente le compteur associé à `cle` et indique si l'appel est autorisé.
 *
 * En cas de panne Redis, on laisse passer (fail-open) : bloquer toutes les
 * connexions parce que le limiteur est indisponible serait pire que la
 * fenêtre d'abus que cela ouvre. L'incident est journalisé.
 */
export async function verifierLimite(
  cle: string,
  limite: number,
  fenetreMs: number
): Promise<ResultatLimite> {
  if (!redisActif) return verifierEnMemoire(cle, limite, fenetreMs)

  try {
    return await verifierAvecRedis(cle, limite, fenetreMs)
  } catch (err) {
    console.error('Rate limit – Redis indisponible, appel autorisé par défaut:', err)
    return { autorise: true, restant: limite }
  }
}

/** Remet un compteur à zéro (ex : après une connexion réussie). */
export async function reinitialiserLimite(cle: string): Promise<void> {
  if (!redisActif) {
    compteurs.delete(cle)
    return
  }

  try {
    await pipelineRedis([['DEL', cle]])
  } catch (err) {
    console.error('Rate limit – échec de la réinitialisation:', err)
  }
}

type SourceEntetes = Headers | Record<string, string | string[] | undefined> | undefined

function lireEntete(source: SourceEntetes, nom: string): string | undefined {
  if (!source) return undefined
  // NextRequest expose des Headers ; NextAuth passe un objet simple.
  if (typeof (source as Headers).get === 'function') {
    return (source as Headers).get(nom) ?? undefined
  }
  const valeur = (source as Record<string, string | string[] | undefined>)[nom]
  return Array.isArray(valeur) ? valeur[0] : valeur
}

/**
 * Extrait l'IP cliente des en-têtes.
 * `x-forwarded-for` peut contenir une liste « client, proxy1, proxy2 » :
 * seule la première valeur identifie le client.
 */
export function extraireIp(source: SourceEntetes): string {
  const transmis = lireEntete(source, 'x-forwarded-for')
  if (transmis) return transmis.split(',')[0].trim()
  return lireEntete(source, 'x-real-ip')?.trim() || 'inconnue'
}
