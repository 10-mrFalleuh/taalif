// Configuration NextAuth.js
// Authentification email/mot de passe avec vérification email

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifierLimite, reinitialiserLimite, extraireIp } from '@/lib/rate-limit'
import { MSG_EMAIL_NON_VERIFIE, MSG_IDENTIFIANTS_INVALIDES } from '@/lib/messages'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schéma de validation des identifiants
const schemaConnexion = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Mot de passe trop court'),
})

// ─── Limites de connexion ──────────────────────────────────────────
// Deux garde-fous complémentaires : par couple IP+compte (ciblage d'un compte
// précis) et par IP seule (balayage de nombreux comptes depuis une machine).
const FENETRE_LOGIN_MS = 15 * 60 * 1000
const LIMITE_PAR_COMPTE = 5
const LIMITE_PAR_IP = 30

const MSG_TROP_DE_TENTATIVES =
  'Trop de tentatives de connexion. Réessayez dans 15 minutes.'

// Délai au-delà duquel le rôle porté par le JWT est revalidé depuis la base.
const INTERVALLE_REVALIDATION_MS = 5 * 60 * 1000

export const authOptions: NextAuthOptions = {
  // Utilisation de JWT (pas de table sessions en DB par défaut)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        motDePasse: { label: 'Mot de passe', type: 'password' },
      },

      async authorize(credentials, req) {
        // 1. Validation des données reçues
        const validation = schemaConnexion.safeParse(credentials)
        if (!validation.success) {
          throw new Error('Données de connexion invalides')
        }

        const { motDePasse } = validation.data
        const email = validation.data.email.toLowerCase()

        // 2. Limitation du débit avant toute requête en base
        const ip = extraireIp(req?.headers)
        const cleCompte = `login:${ip}:${email}`
        const [limiteCompte, limiteIp] = await Promise.all([
          verifierLimite(cleCompte, LIMITE_PAR_COMPTE, FENETRE_LOGIN_MS),
          verifierLimite(`login:ip:${ip}`, LIMITE_PAR_IP, FENETRE_LOGIN_MS),
        ])
        if (!limiteCompte.autorise || !limiteIp.autorise) {
          throw new Error(MSG_TROP_DE_TENTATIVES)
        }

        // 3. Recherche de l'utilisateur en base
        const utilisateur = await prisma.user.findUnique({ where: { email } })

        if (!utilisateur) {
          throw new Error(MSG_IDENTIFIANTS_INVALIDES)
        }

        // 4. Comparaison du mot de passe hashé
        // Effectuée AVANT le contrôle de vérification d'email : sinon le
        // message « vérifiez votre email » confirmerait l'existence du compte
        // à qui ne connaît pas le mot de passe.
        const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse)
        if (!motDePasseValide) {
          throw new Error(MSG_IDENTIFIANTS_INVALIDES)
        }

        // 5. Vérification que l'email est validé
        if (!utilisateur.emailVerifie) {
          throw new Error(MSG_EMAIL_NON_VERIFIE)
        }

        // 6. Connexion réussie : on libère le compteur de ce compte
        await reinitialiserLimite(cleCompte)

        // 7. Retour des données utilisateur (sans le mot de passe)
        return {
          id: utilisateur.id,
          email: utilisateur.email,
          name: utilisateur.nom,
          role: utilisateur.role,
        }
      },
    }),
  ],

  callbacks: {
    // Injection du rôle dans le JWT, puis revalidation périodique.
    //
    // Sans revalidation, le rôle serait figé pour toute la durée du token
    // (30 jours) : un administrateur rétrogradé conserverait ses droits.
    // On relit donc la base au plus toutes les 5 minutes — pas à chaque
    // requête, pour ne pas transformer chaque appel en requête SQL.
    async jwt({ token, user }) {
      // Connexion initiale
      if (user) {
        token.id = user.id
        token.role = user.role
        token.roleActualiseLe = Date.now()
        token.supprime = false
        return token
      }

      const age = Date.now() - (token.roleActualiseLe ?? 0)
      if (age < INTERVALLE_REVALIDATION_MS) return token

      try {
        const actuel = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        })

        if (!actuel) {
          // Compte supprimé pendant la session : le middleware refusera l'accès.
          token.supprime = true
          token.role = 'USER'
        } else {
          token.role = actuel.role
          token.supprime = false
        }
        token.roleActualiseLe = Date.now()
      } catch (err) {
        // Base injoignable : on conserve le token en l'état et on réessaiera
        // au prochain appel plutôt que de déconnecter tout le monde.
        console.error('Revalidation du rôle impossible:', err)
      }

      return token
    },

    // Injection du rôle dans la session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.supprime ? 'USER' : (token.role as string)
      }
      return session
    },
  },

  // Secret pour signer les JWT
  secret: process.env.NEXTAUTH_SECRET,
}
