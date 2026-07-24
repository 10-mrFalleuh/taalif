// Requêtes Taalif partagées
//
// Les pages Server Components et les routes API interrogeaient la base
// séparément, avec des filtres qui avaient divergé : la page cherchait dans
// texteWolof et theme, l'API non. Deux comportements de recherche pour un même
// produit. Cette construction de requête est désormais l'unique source de
// vérité, consommée par les deux.

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { FormatTaalif, Taalif } from '@prisma/client'

export type TriTaalif = 'date_asc' | 'date_desc' | 'titre_asc'

export interface FiltresTaalifs {
  format?: FormatTaalif
  theme?: string
  q?: string
  tri?: TriTaalif
  page?: number
  limite?: number
}

export interface ListeTaalifs {
  elements: Taalif[]
  total: number
  page: number
  totalPages: number
  limite: number
}

export const LIMITE_TAALIFS_DEFAUT = 12

/** Champs balayés par la recherche plein texte. */
const CHAMPS_RECHERCHE = ['titreFr', 'titreWolof', 'texteFr', 'texteWolof', 'theme'] as const

export function construireFiltre({ format, theme, q }: FiltresTaalifs): Prisma.TaalifWhereInput {
  const where: Prisma.TaalifWhereInput = {}

  if (format) where.format = format
  if (theme) where.theme = { contains: theme, mode: 'insensitive' }
  if (q) {
    where.OR = CHAMPS_RECHERCHE.map((champ) => ({
      [champ]: { contains: q, mode: 'insensitive' },
    }))
  }

  return where
}

export function construireTri(tri: TriTaalif = 'date_desc'): Prisma.TaalifOrderByWithRelationInput {
  if (tri === 'date_asc') return { dateCreation: 'asc' }
  if (tri === 'titre_asc') return { titreFr: 'asc' }
  return { dateCreation: 'desc' }
}

/** Liste paginée, filtrée et triée. */
export async function listerTaalifs(filtres: FiltresTaalifs): Promise<ListeTaalifs> {
  const page = Math.max(1, filtres.page ?? 1)
  const limite = filtres.limite ?? LIMITE_TAALIFS_DEFAUT
  const where = construireFiltre(filtres)

  const [elements, total] = await Promise.all([
    prisma.taalif.findMany({
      where,
      orderBy: construireTri(filtres.tri),
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.taalif.count({ where }),
  ])

  return { elements, total, page, totalPages: Math.ceil(total / limite), limite }
}

/** Thèmes distincts, pour alimenter le filtre de la bibliothèque. */
export async function listerThemes(): Promise<string[]> {
  const lignes = await prisma.taalif.findMany({
    select: { theme: true },
    where: { theme: { not: null } },
    distinct: ['theme'],
    orderBy: { theme: 'asc' },
  })

  return lignes.map((l) => l.theme).filter((t): t is string => Boolean(t))
}
