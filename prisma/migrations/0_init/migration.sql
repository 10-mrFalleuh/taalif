-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FormatTaalif" AS ENUM ('TEXTE', 'AUDIO', 'VIDEO');

-- CreateEnum
CREATE TYPE "CategorieActualite" AS ENUM ('ARTICLE', 'EVENEMENT', 'ANNONCE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "tokenVerification" TEXT,
    "tokenExpiration" TIMESTAMP(3),
    "tokenReset" TEXT,
    "tokenResetExp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "taalifs" (
    "id" TEXT NOT NULL,
    "titreWolof" TEXT NOT NULL,
    "titreFr" TEXT NOT NULL,
    "texteWolof" TEXT,
    "texteFr" TEXT,
    "format" "FormatTaalif" NOT NULL,
    "fichierUrl" TEXT,
    "imageUrl" TEXT,
    "auteur" TEXT NOT NULL DEFAULT 'Cheikh Ahmadou Kara Mbacké',
    "theme" TEXT,
    "tags" TEXT[],
    "nbTelechargements" INTEGER NOT NULL DEFAULT 0,
    "estTaalifDuJour" BOOLEAN NOT NULL DEFAULT false,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taalifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actualites" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "imageUrl" TEXT,
    "categorie" "CategorieActualite" NOT NULL DEFAULT 'ARTICLE',
    "publiee" BOOLEAN NOT NULL DEFAULT false,
    "dateEvent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actualites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres" (
    "id" TEXT NOT NULL,
    "nomMouvement" TEXT NOT NULL DEFAULT 'Mouvement Mondial Mame Cheikh',
    "descriptionMouvement" TEXT NOT NULL DEFAULT 'Un mouvement spirituel dédié à la diffusion de l''enseignement de Serigne Touba',
    "imageMouvement" TEXT,
    "taalifDuJourId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tokenVerification_key" ON "users"("tokenVerification");

-- CreateIndex
CREATE UNIQUE INDEX "users_tokenReset_key" ON "users"("tokenReset");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

