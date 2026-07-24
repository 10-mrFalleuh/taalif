# Déploiement sur Vercel

Guide pas à pas pour mettre TAALIF en production sur **Vercel**, avec
**Neon** (PostgreSQL), **Cloudinary** (fichiers) et **Upstash** (rate limiting).

Le dépôt est déjà préparé pour ce déploiement :

- `postinstall: prisma generate` — régénère le client Prisma à chaque install
- `vercel-build` — lance `prisma migrate deploy` **avant** le build : les
  migrations s'appliquent automatiquement à chaque déploiement
- `schema.prisma` sépare `DATABASE_URL` (pooled, runtime) et `DIRECT_URL`
  (directe, migrations) — indispensable en serverless
- Le stockage bascule seul sur Cloudinary dès que ses variables sont présentes

> Ce que ce guide ne peut pas faire à votre place : créer les comptes et saisir
> les secrets. Ces étapes sont les vôtres.

---

## 0. Comptes nécessaires

| Service | Rôle | Gratuit pour démarrer |
|---------|------|:---:|
| [Vercel](https://vercel.com) | Hébergement de l'app | ✅ |
| [Neon](https://neon.tech) | Base PostgreSQL | ✅ |
| [Cloudinary](https://cloudinary.com) | Stockage audio/vidéo/images | ✅ |
| [Upstash](https://upstash.com) | Redis (rate limiting) | ✅ |
| SMTP (Gmail, Brevo, Resend…) | Emails de vérification / reset | ✅ |

---

## 1. Base de données — Neon

1. Créez un projet Neon (région proche de vos utilisateurs, ex. `aws-eu-central-1`).
2. Dans **Connection Details**, récupérez **deux** chaînes :
   - **Pooled connection** (l'hôte contient `-pooler`) → ce sera `DATABASE_URL`
   - **Direct connection** (le même hôte **sans** `-pooler`) → ce sera `DIRECT_URL`
3. Les deux se terminent par `?sslmode=require` — gardez-le.

```
DATABASE_URL = postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/taalif?sslmode=require
DIRECT_URL   = postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/taalif?sslmode=require
```

> Pourquoi deux URL : le runtime serverless ouvre beaucoup de connexions courtes
> et doit passer par le pooler ; les migrations Prisma ont besoin de verrous
> d'avis que le pooler ne gère pas, d'où la connexion directe.

---

## 2. Stockage — Cloudinary

Sans ceci, **les fichiers uploadés en production sont perdus** : le disque de
Vercel est en lecture seule et éphémère.

1. Dans le **Dashboard** Cloudinary, relevez `Cloud name`, `API Key`, `API Secret`.

```
CLOUDINARY_CLOUD_NAME = votre-cloud-name
CLOUDINARY_API_KEY    = 1234567890
CLOUDINARY_API_SECRET = xxxxxxxx
```

Aucune config de code n'est requise : le pilote de stockage détecte ces
variables et bascule automatiquement sur Cloudinary.

---

## 3. Rate limiting — Upstash

Sans ceci, le limiteur (connexion, inscription, emails) retombe sur un compteur
mémoire, remis à zéro à chaque démarrage et non partagé entre instances : il est
alors contournable.

1. Créez une base **Redis** Upstash.
2. Dans **REST API**, relevez l'URL et le token.

```
UPSTASH_REDIS_REST_URL   = https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN = xxxxxxxx
```

---

## 4. Email (SMTP)

```
EMAIL_SERVER_HOST     = smtp.gmail.com
EMAIL_SERVER_PORT     = 587
EMAIL_SERVER_USER     = votre@gmail.com
EMAIL_SERVER_PASSWORD = mot-de-passe-application   # Gmail : App Password
EMAIL_FROM            = TAALIF <no-reply@votre-domaine>
```

En production, la vérification d'email est **active** : sans SMTP fonctionnel,
les nouveaux inscrits ne peuvent pas activer leur compte (un bouton de renvoi
existe, mais l'email doit finir par partir).

---

## 5. Secret NextAuth

Générez une valeur aléatoire forte :

```bash
openssl rand -base64 32
```

```
NEXTAUTH_SECRET = <la valeur générée>
```

`NEXTAUTH_URL` doit valoir l'URL publique finale (voir étape 7).

---

## 6. Importer le projet sur Vercel

1. **Add New → Project**, importez le dépôt GitHub `taalif`.
2. Vercel détecte Next.js automatiquement. Ne touchez pas au *Build Command* :
   le script `vercel-build` du `package.json` est utilisé tel quel.
3. Dans **Settings → Environment Variables**, ajoutez **toutes** les variables
   du tableau ci-dessous (portée *Production*, et *Preview* si vous voulez des
   déploiements de préversion fonctionnels).

### Récapitulatif des variables

| Variable | Exemple / source | Requis |
|----------|------------------|:---:|
| `DATABASE_URL` | Neon, URL **pooled** | ✅ |
| `DIRECT_URL` | Neon, URL **directe** | ✅ |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | `https://votre-domaine` | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://votre-domaine` | ✅ |
| `NEXT_PUBLIC_APP_NAME` | `TAALIF` | ✅ |
| `EMAIL_SERVER_HOST` | `smtp.gmail.com` | ✅ |
| `EMAIL_SERVER_PORT` | `587` | ✅ |
| `EMAIL_SERVER_USER` | votre identifiant SMTP | ✅ |
| `EMAIL_SERVER_PASSWORD` | mot de passe SMTP | ✅ |
| `EMAIL_FROM` | `TAALIF <no-reply@…>` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | ⚠️ prod |
| `CLOUDINARY_API_KEY` | Cloudinary | ⚠️ prod |
| `CLOUDINARY_API_SECRET` | Cloudinary | ⚠️ prod |
| `UPSTASH_REDIS_REST_URL` | Upstash | ⚠️ prod |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | ⚠️ prod |

⚠️ *prod* = techniquement optionnel (l'app démarre sans), mais requis pour un
fonctionnement correct en production (uploads persistants, rate limiting réel).

---

## 7. Premier déploiement

1. Lancez le déploiement. `vercel-build` va, dans l'ordre :
   `prisma generate` → `prisma migrate deploy` (crée les tables sur Neon via
   `DIRECT_URL`) → `next build`.
2. Une fois l'URL Vercel connue (`https://taalif-xxx.vercel.app` ou votre
   domaine), renseignez **`NEXTAUTH_URL`** et **`NEXT_PUBLIC_APP_URL`** avec
   cette valeur, puis **redéployez** (ces variables doivent correspondre au
   domaine réel, sinon les liens d'email et les redirections d'auth cassent).

---

## 8. Créer le compte administrateur

Les migrations créent les tables mais pas les données. Lancez le seed **une
fois**, depuis votre machine, en pointant sur la base de production :

```bash
DATABASE_URL="<url-pooled-neon>" DIRECT_URL="<url-directe-neon>" npm run db:seed
```

> ⚠️ **Changez le mot de passe admin par défaut.** Le seed crée
> `admin@taalif.sn` avec un mot de passe connu (`prisma/seed.ts`). Avant de
> lancer la commande, remplacez-le dans le fichier, ou faites immédiatement un
> « mot de passe oublié » depuis l'app pour le réinitialiser.

---

## 9. Domaine personnalisé (optionnel)

**Settings → Domains** sur Vercel, ajoutez votre domaine et suivez les
instructions DNS. Pensez ensuite à remettre `NEXTAUTH_URL` et
`NEXT_PUBLIC_APP_URL` sur ce domaine, puis à redéployer.

---

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| Build échoue sur `migrate deploy` | `DIRECT_URL` absente ou pointée sur le pooler |
| `too many connections` au runtime | `DATABASE_URL` pointée sur la connexion directe au lieu du pooler |
| Uploads qui disparaissent | Variables Cloudinary absentes → stockage local éphémère |
| Redirection d'auth ou lien d'email cassé | `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` ≠ domaine réel |
| Inscrit bloqué « vérifiez votre email » | SMTP mal configuré ; utiliser le bouton de renvoi |
| Rate limit inefficace | Variables Upstash absentes (fallback mémoire) |

---

*Vérifié en local : `prisma validate`, `prisma migrate status`, `npm run verifier`
et `next build` passent avec la configuration à double URL.*
