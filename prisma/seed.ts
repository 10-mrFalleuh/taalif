// Script de seed Prisma
// Crée l'admin initial et insère des taalifs d'exemple

import { PrismaClient, FormatTaalif, CategorieActualite } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Identifiants de l'administrateur initial.
//
// En production, ils DOIVENT venir de l'environnement : aucun mot de passe
// n'est codé en dur dans un dépôt public. Les valeurs de repli ne servent
// qu'au développement local, pour ne pas alourdir le démarrage.
function lireIdentifiantsAdmin() {
  const enProd = process.env.NODE_ENV === 'production'
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@taalif.sn'
  const motDePasse = process.env.SEED_ADMIN_PASSWORD ?? (enProd ? '' : 'Admin@Taalif2024!')

  if (enProd && !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      'SEED_ADMIN_PASSWORD est requis pour seeder en production. ' +
        'Définissez SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD avant de lancer le seed.'
    )
  }
  if (motDePasse.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD doit contenir au moins 8 caractères.')
  }

  return { email: email.toLowerCase(), motDePasse }
}

async function main() {
  console.log('🌱 Démarrage du seed...')

  // ─── Création de l'administrateur ───────────────────────────────
  const identifiants = lireIdentifiantsAdmin()
  const motDePasseHashe = await bcrypt.hash(identifiants.motDePasse, 12)

  const admin = await prisma.user.upsert({
    where: { email: identifiants.email },
    update: {},
    create: {
      nom: 'Administrateur TAALIF',
      email: identifiants.email,
      motDePasse: motDePasseHashe,
      role: 'ADMIN',
      emailVerifie: true, // Admin directement vérifié
    },
  })

  console.log('✅ Admin créé:', admin.email)

  // ─── Paramètres de la plateforme ────────────────────────────────
  await prisma.parametre.upsert({
    where: { id: 'parametres-uniques' },
    update: {},
    create: {
      id: 'parametres-uniques',
      nomMouvement: 'Mouvement Mondial Mame Cheikh',
      descriptionMouvement:
        "Fondé dans la pure tradition mouride, notre mouvement se consacre à la diffusion de l'enseignement lumineux de Khadimou Rassoul, Cheikh Ahmadou Bamba Mbacké, à travers les khassidas et taalifs composés par ses disciples éclairés.",
    },
  })

  console.log('✅ Paramètres initialisés')

  // ─── Taalif 1 : Format Texte ────────────────────────────────────
  const taalif1 = await prisma.taalif.upsert({
    where: { id: 'taalif-exemple-1' },
    update: {},
    create: {
      id: 'taalif-exemple-1',
      titreWolof: 'Médina Baye – Xam Xam bi',
      titreFr: 'Médina Baye – La Connaissance',
      texteWolof: `Bismillaahi Rahmaani Rahiim
Al hamdu lillaahi Rabbil 'aalamiin
Wassalaatu wassalaamu 'alaa Sayyidinaa Muhammadin

Xam xam bi dafa mel ni dëkk bu baax,
Ku dem ci kanam, dañu ko lekkal ak xam-xam,
Serigne Touba mu'o tax nu xam Yàlla,
Mu ngi dem ci Làkk bi, mu ngi jënd dëkk,
Bu ñàkk xam-xam, ñëpp ñàkk bàkku.

Jëkër bu baax moo ci waax: "Xam sa boppam",
Benn penku xamal la ci ay marse,
Xam xam bi dafa ngi ci aduna bi,
Ku ko xam, dafay sàmm sa doom.`,
      texteFr: `Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
Louange à Allah, Seigneur des mondes
Que la prière et le salut soient sur notre Maître Muhammad

La connaissance ressemble à une belle cité,
Celui qui avance, elle le nourrit de savoir,
C'est Serigne Touba qui nous a fait connaître Allah,
Il est allé au Lac, il a fondé une cité,
Sans connaissance, tous manquent de refuge.

Le sage dit : "Connais-toi toi-même",
Une seule leçon t'enseignera mille marchés,
La connaissance est la lumière de ce monde,
Celui qui la possède guide ses enfants.`,
      format: FormatTaalif.TEXTE,
      auteur: 'Cheikh Ahmadou Kara Mbacké',
      theme: 'Connaissance et Spiritualité',
      tags: ['connaissance', 'xam-xam', 'Serigne Touba', 'Médina Baye'],
      estTaalifDuJour: true,
      dateCreation: new Date('2024-01-15'),
    },
  })

  console.log('✅ Taalif 1 créé:', taalif1.titreFr)

  // ─── Taalif 2 : Format Audio ─────────────────────────────────────
  const taalif2 = await prisma.taalif.upsert({
    where: { id: 'taalif-exemple-2' },
    update: {},
    create: {
      id: 'taalif-exemple-2',
      titreWolof: 'Khadimou Rassoul – Médou Koor',
      titreFr: 'Le Serviteur du Prophète – Hymne au Maître',
      texteWolof: 'Khadimou Rassoul yi ngi dem ci kaw...',
      texteFr: 'Les serviteurs du Prophète s\'élèvent...',
      format: FormatTaalif.AUDIO,
      fichierUrl: '/uploads/audio/exemple-taalif-2.mp3',
      auteur: 'Cheikh Ahmadou Kara Mbacké',
      theme: 'Éloge du Prophète',
      tags: ['Khadimou Rassoul', 'médou', 'audio', 'khassida'],
      dateCreation: new Date('2024-02-20'),
    },
  })

  console.log('✅ Taalif 2 créé:', taalif2.titreFr)

  // ─── Taalif 3 : Format Vidéo ─────────────────────────────────────
  const taalif3 = await prisma.taalif.upsert({
    where: { id: 'taalif-exemple-3' },
    update: {},
    create: {
      id: 'taalif-exemple-3',
      titreWolof: 'Touba – Xaritu Jàng bi',
      titreFr: 'Touba – Le Chemin de l\'Étude',
      texteWolof: 'Touba dëkk bu sedd, bu nëbb...',
      texteFr: 'Touba, cité sainte et ombragée...',
      format: FormatTaalif.VIDEO,
      fichierUrl: '/uploads/video/exemple-taalif-3.mp4',
      auteur: 'Cheikh Ahmadou Kara Mbacké',
      theme: 'Touba – Cité Sainte',
      tags: ['Touba', 'jàng', 'vidéo', 'éducation'],
      dateCreation: new Date('2024-03-10'),
    },
  })

  console.log('✅ Taalif 3 créé:', taalif3.titreFr)

  // ─── Actualité d'exemple ─────────────────────────────────────────
  await prisma.actualite.upsert({
    where: { id: 'actualite-exemple-1' },
    update: {},
    create: {
      id: 'actualite-exemple-1',
      titre: 'Grand Magal de Touba 2024 : Appel à la Communauté Mouride',
      contenu: `Le Grand Magal de Touba, célébration commémorant le départ en exil de Cheikh Ahmadou Bamba, rassemble chaque année des millions de fidèles à Touba.

Cette année, la communauté est invitée à se préparer spirituellement par la récitation des khassidas et la méditation sur les enseignements du Cheikh.

La plateforme TAALIF mettra à disposition une sélection spéciale de taalifs pour cette occasion bénie. Restez connectés.`,
      categorie: CategorieActualite.EVENEMENT,
      publiee: true,
      dateEvent: new Date('2024-08-30'),
    },
  })

  console.log('✅ Actualité exemple créée')
  console.log('')
  console.log('🎉 Seed terminé avec succès!')
  console.log('')
  console.log('📋 Identifiants Admin:')
  console.log(`   Email       : ${identifiants.email}`)
  console.log('   Mot de passe: celui fourni via SEED_ADMIN_PASSWORD')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
