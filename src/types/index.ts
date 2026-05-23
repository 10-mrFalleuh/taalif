// Types TypeScript partagés dans l'application

import type { Taalif, Actualite, User, Parametre, FormatTaalif, CategorieActualite, Role } from '@prisma/client'

// ─── Re-exports Prisma ─────────────────────────────────────────────
export type { FormatTaalif, CategorieActualite, Role }

// ─── Types d'entités ───────────────────────────────────────────────

export type TaalifAvecRelations = Taalif

export type ActualiteAvecRelations = Actualite

export type UtilisateurPublic = Omit<User, 'motDePasse' | 'tokenVerification' | 'tokenReset' | 'tokenResetExp' | 'tokenExpiration'>

// ─── Types de réponse API ──────────────────────────────────────────

export interface ReponseApi<T> {
  succes: boolean
  donnees?: T
  erreur?: string
  message?: string
}

export interface ReponseListePaginee<T> {
  elements: T[]
  total: number
  page: number
  totalPages: number
  limite: number
}

// ─── Types de formulaires ──────────────────────────────────────────

export interface FormulaireTaalif {
  titreWolof: string
  titreFr: string
  texteWolof?: string
  texteFr?: string
  format: FormatTaalif
  fichierUrl?: string
  imageUrl?: string
  auteur: string
  theme?: string
  tags: string[]
  estTaalifDuJour: boolean
}

export interface FormulaireActualite {
  titre: string
  contenu: string
  imageUrl?: string
  categorie: CategorieActualite
  publiee: boolean
  dateEvent?: string
}

// ─── Types de Session NextAuth étendue ────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// ─── Types de filtres ─────────────────────────────────────────────

export interface FiltresTaalif {
  format?: FormatTaalif
  theme?: string
  q?: string
  page?: number
  limite?: number
  tri?: 'date_asc' | 'date_desc' | 'titre_asc'
}

export interface FiltresActualite {
  categorie?: CategorieActualite
  q?: string
  page?: number
  limite?: number
}

// ─── Types de navigation ──────────────────────────────────────────

export interface LienNavigation {
  label: string
  href: string
  icone?: string
  actif?: boolean
}

// ─── Types de composants ──────────────────────────────────────────

export interface PropsBadge {
  format: FormatTaalif
  taille?: 'sm' | 'md'
}

export interface PropsCarteActualite {
  actualite: Actualite
  compact?: boolean
}

export interface PropsPagination {
  page: number
  totalPages: number
  baseUrl: string
}
