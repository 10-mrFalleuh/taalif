// Configuration NextAuth.js
// Authentification email/mot de passe avec vérification email

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schéma de validation des identifiants
const schemaConnexion = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Mot de passe trop court'),
})

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

      async authorize(credentials) {
        // 1. Validation des données reçues
        const validation = schemaConnexion.safeParse(credentials)
        if (!validation.success) {
          throw new Error('Données de connexion invalides')
        }

        const { email, motDePasse } = validation.data

        // 2. Recherche de l'utilisateur en base
        const utilisateur = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!utilisateur) {
          throw new Error('Email ou mot de passe incorrect')
        }

        // 3. Vérification que l'email est validé
        if (!utilisateur.emailVerifie) {
          throw new Error('Veuillez vérifier votre adresse email avant de vous connecter')
        }

        // 4. Comparaison du mot de passe hashé
        const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse)
        if (!motDePasseValide) {
          throw new Error('Email ou mot de passe incorrect')
        }

        // 5. Retour des données utilisateur (sans le mot de passe)
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
    // Injection du rôle dans le JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },

    // Injection du rôle dans la session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  // Secret pour signer les JWT
  secret: process.env.NEXTAUTH_SECRET,
}
