-- Recherche textuelle accélérée (optionnel — à appliquer manuellement)
--
-- CONTEXTE
-- La recherche de /taalifs utilise `contains` + `mode: 'insensitive'`, soit un
-- ILIKE '%terme%' en PostgreSQL. Aucun index B-tree ne peut servir un motif
-- commençant par « % » : la requête parcourt toute la table. Sur quelques
-- dizaines de taalifs c'est indolore ; à plusieurs milliers, ça ne l'est plus.
--
-- Les index GIN trigramme (pg_trgm) accélèrent précisément ce motif.
--
-- ⚠ POURQUOI CE FICHIER N'EST PAS UNE MIGRATION PRISMA
-- Prisma ne sait pas déclarer un index GIN gin_trgm_ops dans schema.prisma.
-- Placé dans prisma/migrations/, cet index serait vu comme une dérive et
-- `prisma migrate dev` proposerait de le supprimer. Il doit donc être appliqué
-- hors du cycle Prisma, et réappliqué après une éventuelle réinitialisation.
--
-- ⚠ PRIVILÈGES
-- CREATE EXTENSION demande des droits élevés. Supabase et Neon l'autorisent ;
-- sur d'autres hébergements, l'extension doit être activée par le fournisseur.
--
-- APPLICATION
--   psql "$DATABASE_URL" -f prisma/sql/recherche-trigramme.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Champs réellement interrogés par la recherche (cf. app/(protected)/taalifs)
CREATE INDEX IF NOT EXISTS taalifs_titre_fr_trgm_idx
  ON "taalifs" USING GIN ("titreFr" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS taalifs_titre_wolof_trgm_idx
  ON "taalifs" USING GIN ("titreWolof" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS taalifs_texte_fr_trgm_idx
  ON "taalifs" USING GIN ("texteFr" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS taalifs_texte_wolof_trgm_idx
  ON "taalifs" USING GIN ("texteWolof" gin_trgm_ops);

-- Vérification : le plan doit montrer un Bitmap Index Scan, pas un Seq Scan
--   EXPLAIN ANALYZE SELECT id FROM "taalifs" WHERE "texteFr" ILIKE '%touba%';
