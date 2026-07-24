// Requêtes Actualité partagées entre la page publique et la route API.
// Même motivation que lib/requetes/taalifs : une seule construction de requête.

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { Actualite, CategorieActualite } from '@prisma/client'

export interface FiltresActualites {
  categorie?: CategorieActualite
  page?: number
  limite?: number
  /** Inclure les brouillons — réservé à l'administration. */
  inclureNonPubliees?: boolean
}

export interface ListeActualites {
  elements: Actualite[]
  total: number
  page: number
  totalPages: number
  limite: number
}

export const LIMITE_ACTUALITES_DEFAUT = 9

const CATEGORIES_VALIDES: CategorieActualite[] = ['ARTICLE', 'EVENEMENT', 'ANNONCE']

/** Valide une catégorie venue de l'URL ; retourne undefined si elle est inconnue. */
export function normaliserCategorie(valeur?: string | null): CategorieActualite | undefined {
  if (!valeur) return undefined
  return CATEGORIES_VALIDES.includes(valeur as CategorieActualite)
    ? (valeur as CategorieActualite)
    : undefined
}

export function construireFiltre({
  categorie,
  inclureNonPubliees,
}: FiltresActualites): Prisma.ActualiteWhereInput {
  const where: Prisma.ActualiteWhereInput = {}

  // Par défaut, seules les actualités publiées sont visibles
  if (!inclureNonPubliees) where.publiee = true
  if (categorie) where.categorie = categorie

  return where
}

export async function listerActualites(filtres: FiltresActualites): Promise<ListeActualites> {
  const page = Math.max(1, filtres.page ?? 1)
  const limite = filtres.limite ?? LIMITE_ACTUALITES_DEFAUT
  const where = construireFiltre(filtres)

  const [elements, total] = await Promise.all([
    prisma.actualite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.actualite.count({ where }),
  ])

  return { elements, total, page, totalPages: Math.ceil(total / limite), limite }
}
