// Schémas de validation Zod pour toutes les API
// Utilisés côté serveur pour valider les données entrantes

import { z } from 'zod'

// ─── Auth ──────────────────────────────────────────────────────────

export const schemaInscription = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long')
    .trim(),
  email: z
    .string()
    .email('Adresse email invalide')
    .toLowerCase()
    .trim(),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmationMotDePasse: z.string(),
}).refine((data) => data.motDePasse === data.confirmationMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmationMotDePasse'],
})

export const schemaConnexion = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
})

export const schemaMotDePasseOublie = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
})

export const schemaReinitialisationMdp = z.object({
  token: z.string().min(1, 'Token requis'),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmationMotDePasse: z.string(),
}).refine((data) => data.motDePasse === data.confirmationMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmationMotDePasse'],
})

// ─── Taalif ───────────────────────────────────────────────────────

export const schemaTaalif = z.object({
  titreWolof: z
    .string()
    .min(2, 'Le titre en wolof est requis')
    .max(200, 'Le titre est trop long')
    .trim(),
  titreFr: z
    .string()
    .min(2, 'Le titre en français est requis')
    .max(200, 'Le titre est trop long')
    .trim(),
  texteWolof: z.string().optional().nullable(),
  texteFr: z.string().optional().nullable(),
  format: z.enum(['TEXTE', 'AUDIO', 'VIDEO'], {
    errorMap: () => ({ message: 'Format invalide' }),
  }),
  fichierUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  auteur: z.string().default('Cheikh Ahmadou Kara Mbacké'),
  theme: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  estTaalifDuJour: z.boolean().default(false),
})

export type SchemaTaalifType = z.infer<typeof schemaTaalif>

// ─── Actualité ────────────────────────────────────────────────────

export const schemaActualite = z.object({
  titre: z
    .string()
    .min(2, 'Le titre est requis')
    .max(300, 'Le titre est trop long')
    .trim(),
  contenu: z.string().min(10, 'Le contenu est requis'),
  imageUrl: z.string().optional().nullable(),
  categorie: z.enum(['ARTICLE', 'EVENEMENT', 'ANNONCE'], {
    errorMap: () => ({ message: 'Catégorie invalide' }),
  }),
  publiee: z.boolean().default(false),
  dateEvent: z.string().optional().nullable(),
})

export type SchemaActualiteType = z.infer<typeof schemaActualite>

// ─── Paramètres ───────────────────────────────────────────────────

export const schemaParametres = z.object({
  nomMouvement: z.string().min(2, 'Le nom du mouvement est requis').max(200),
  descriptionMouvement: z.string().min(10, 'La description est requise'),
  taalifDuJourId: z.string().optional().nullable(),
})

// ─── Filtres de recherche ─────────────────────────────────────────

export const schemaFiltreTaalif = z.object({
  format: z.enum(['TEXTE', 'AUDIO', 'VIDEO']).optional(),
  theme: z.string().optional(),
  q: z.string().optional(), // Recherche full-text
  page: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(50).default(12),
  tri: z.enum(['date_asc', 'date_desc', 'titre_asc']).default('date_desc'),
})

export const schemaFiltreActualite = z.object({
  categorie: z.enum(['ARTICLE', 'EVENEMENT', 'ANNONCE']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().min(1).max(20).default(9),
})
