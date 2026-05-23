# TAALIF – Plateforme des Poèmes de Cheikh Ahmadou Kara Mbacké

> **TAALIF** (ط) signifie « poème » en wolof. Cette plateforme regroupe les taalifs en 3 formats — texte, audio, vidéo — dédiés à l'enseignement de Khadimou Rassoul.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Base de données | PostgreSQL + Prisma ORM |
| Authentification | NextAuth.js (credentials + JWT) |
| Email | Nodemailer (SMTP) |
| Upload fichiers | Local (dev) → Cloudinary/S3 (prod) |
| Déploiement | Vercel-ready |

---

## Prérequis

- **Node.js** ≥ 18.17
- **PostgreSQL** ≥ 14 (local ou cloud ex. Supabase, Railway, Neon)
- **npm** ou **pnpm**

---

## Installation

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd taalif
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplissez `.env` avec vos valeurs :

```env
# Base de données
DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/taalif_db"

# NextAuth (générer avec : openssl rand -base64 32)
NEXTAUTH_SECRET="votre-secret-tres-long"
NEXTAUTH_URL="http://localhost:3000"

# Email SMTP (Gmail, Brevo, Resend, etc.)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="votre@gmail.com"
EMAIL_SERVER_PASSWORD="votre-app-password"
EMAIL_FROM="TAALIF <no-reply@taalif.sn>"

# URLs publiques
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="TAALIF"
```

### 3. Créer la base de données PostgreSQL

```bash
# Avec psql
createdb taalif_db

# Ou avec Docker
docker run -d \
  --name taalif-postgres \
  -e POSTGRES_PASSWORD=motdepasse \
  -e POSTGRES_DB=taalif_db \
  -p 5432:5432 \
  postgres:16
```

### 4. Initialiser le schéma Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma en base (dev)
npm run db:push

# Ou créer une migration (prod recommandé)
npx prisma migrate dev --name init
```

### 5. Seed – Créer l'admin et les données d'exemple

```bash
npm run db:seed
```

Ceci crée :
- **Admin** : `admin@taalif.sn` / `Admin@Taalif2024!`
- 3 taalifs d'exemple (texte, audio, vidéo)
- 1 actualité d'exemple
- Les paramètres du site

### 6. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## Commandes disponibles

```bash
npm run dev          # Serveur de développement (hot reload)
npm run build        # Build de production
npm run start        # Démarrer en production
npm run lint         # ESLint
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma en DB (dev, sans migration)
npm run db:seed      # Insérer les données initiales
npm run db:studio    # Interface graphique Prisma Studio
```

---

## Structure du projet

```
taalif/
├── prisma/
│   ├── schema.prisma          # Modèles de base de données
│   └── seed.ts                # Script de données initiales
├── public/
│   └── uploads/               # Fichiers audio/vidéo/images (dev)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Pages publiques (login, register, etc.)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (protected)/       # Pages privées (après connexion)
│   │   │   ├── page.tsx       # Accueil
│   │   │   ├── taalifs/       # Liste + détail des taalifs
│   │   │   ├── actualites/    # Actualités
│   │   │   └── admin/         # Dashboard admin (ADMIN only)
│   │   │       ├── taalifs/
│   │   │       ├── actualites/
│   │   │       ├── utilisateurs/
│   │   │       └── parametres/
│   │   └── api/               # API Routes Next.js
│   │       ├── auth/          # NextAuth + inscription + email
│   │       ├── taalifs/       # CRUD taalifs + compteur DL
│   │       ├── actualites/    # CRUD actualités
│   │       ├── upload/        # Upload fichiers
│   │       └── admin/         # Routes admin (paramètres, users)
│   ├── components/
│   │   ├── layout/            # Navigation, Footer, Providers
│   │   ├── taalif/            # CardTaalif, AccordeonTexte, LecteurAudio, LecteurVideo
│   │   ├── admin/             # Formulaires admin, boutons CRUD
│   │   └── ui/                # Pagination, Toaster
│   ├── lib/
│   │   ├── prisma.ts          # Singleton Prisma
│   │   ├── auth.ts            # Configuration NextAuth
│   │   ├── email.ts           # Service Nodemailer
│   │   ├── utils.ts           # Fonctions utilitaires
│   │   └── validations.ts     # Schémas Zod
│   ├── middleware.ts           # Protection des routes
│   └── types/
│       └── index.ts           # Types TypeScript partagés
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL au format `postgresql://user:pass@host:port/db` |
| `NEXTAUTH_SECRET` | ✅ | Secret JWT (min 32 chars, générer avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | URL de base de l'app (`http://localhost:3000` en dev) |
| `EMAIL_SERVER_HOST` | ✅ | Serveur SMTP (ex: `smtp.gmail.com`) |
| `EMAIL_SERVER_PORT` | ✅ | Port SMTP (`587` pour TLS, `465` pour SSL) |
| `EMAIL_SERVER_USER` | ✅ | Utilisateur SMTP |
| `EMAIL_SERVER_PASSWORD` | ✅ | Mot de passe SMTP (App Password pour Gmail) |
| `EMAIL_FROM` | ✅ | Expéditeur des emails |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL publique de l'app |
| `CLOUDINARY_CLOUD_NAME` | ☐ | Cloud name Cloudinary (prod) |
| `CLOUDINARY_API_KEY` | ☐ | API key Cloudinary (prod) |
| `CLOUDINARY_API_SECRET` | ☐ | API secret Cloudinary (prod) |

---

## Fonctionnalités

### Pour les utilisateurs
- ✅ **Authentification** complète (inscription, connexion, vérification email, mot de passe oublié)
- ✅ **Lecture** des taalifs en texte (accordéon), audio (lecteur HTML5), vidéo (lecteur HTML5)
- ✅ **Téléchargement** des fichiers audio (MP3) et vidéo (MP4) avec compteur
- ✅ **Recherche** full-text sur titres et contenus
- ✅ **Filtres** par format, thème, date
- ✅ **Pagination** sur toutes les listes
- ✅ **Actualités** du mouvement (articles, événements, annonces)

### Pour les admins
- ✅ **CRUD complet** sur les taalifs (texte, audio, vidéo)
- ✅ **CRUD complet** sur les actualités
- ✅ **Gestion des utilisateurs** (rôles USER/ADMIN)
- ✅ **Paramètres du site** (nom du mouvement, description, taalif du jour)
- ✅ **Upload** de fichiers audio/vidéo
- ✅ **Génération automatique** d'image de couverture SVG si aucune image fournie

### Sécurité
- ✅ Middleware de protection des routes (auth + rôle)
- ✅ Validation Zod sur toutes les API
- ✅ Hash bcrypt (coût 12) pour les mots de passe
- ✅ Rate limiting sur l'inscription
- ✅ Tokens cryptographiques pour email/reset (crypto.randomBytes)
- ✅ Headers de sécurité (X-Frame-Options, X-Content-Type-Options)

---

## Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Variables d'environnement à configurer dans le dashboard Vercel :
# - DATABASE_URL (utiliser Supabase, Neon, ou Railway pour PostgreSQL)
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL (votre domaine de production)
# - Variables email
```

Pour le stockage de fichiers en production, décommenter et configurer dans `.env` :
- **Cloudinary** : idéal pour images et vidéos
- **AWS S3** : alternative robuste pour tous types de fichiers

---

## Email – Configuration Gmail

1. Activer la validation en 2 étapes sur votre compte Google
2. Aller dans **Paramètres** → **Sécurité** → **Mots de passe des applications**
3. Générer un mot de passe pour « Application personnalisée »
4. Utiliser ce mot de passe comme `EMAIL_SERVER_PASSWORD`

---

## Prisma Studio (interface graphique)

```bash
npm run db:studio
# Ouvre http://localhost:5555
```

---

## Licence

Projet dédié à la communauté mouridiya. Usage non commercial.

---

*بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ*
