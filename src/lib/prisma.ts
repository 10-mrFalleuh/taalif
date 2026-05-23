// Singleton Prisma pour éviter les connexions multiples en développement
// Next.js recharge les modules en hot reload, ce singleton évite les fuites de connexions

import { PrismaClient } from '@prisma/client'

// Déclaration globale pour TypeScript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// En développement, on stocke l'instance dans le scope global pour la réutiliser
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
