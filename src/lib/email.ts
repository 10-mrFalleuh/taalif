// Service d'envoi d'emails avec Nodemailer
// Utilisé pour la vérification d'email et la réinitialisation de mot de passe

import nodemailer from 'nodemailer'

// ─── Configuration du transporteur ──────────────────────────────

const transporteur = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT ?? '587'),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

const emailFrom = process.env.EMAIL_FROM ?? 'TAALIF <no-reply@taalif.sn>'
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Template HTML de base ────────────────────────────────────────

function templateEmail(contenu: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TAALIF</title>
  <style>
    body { font-family: Georgia, serif; background: #f0faf4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a6f47 0%, #2da86c 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 4px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .btn { display: inline-block; background: #2da86c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f0faf4; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
    .ornement { color: #d4af37; font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="ornement">❖</div>
      <h1>TAALIF</h1>
      <p>Plateforme des Poèmes de Cheikh Ahmadou Kara</p>
    </div>
    <div class="content">
      ${contenu}
    </div>
    <div class="footer">
      <p class="ornement">❖</p>
      <p>© ${new Date().getFullYear()} TAALIF - Tous droits réservés</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>
  `
}

// ─── Email de vérification ────────────────────────────────────────

export async function envoyerEmailVerification(
  email: string,
  nom: string,
  token: string
): Promise<void> {
  const lienVerification = `${appUrl}/api/auth/verifier-email?token=${token}`

  const contenu = `
    <h2 style="color: #1a6f47; font-family: Georgia, serif;">Bienvenue sur TAALIF, ${nom} !</h2>
    <p>Merci de vous être inscrit(e) sur la plateforme des taalifs de Cheikh Ahmadou Kara Mbacké.</p>
    <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
    <div style="text-align: center;">
      <a href="${lienVerification}" class="btn" style="display:inline-block;background:#2da86c;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0;">
        ✅ Vérifier mon adresse email
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">Ce lien expire dans <strong>24 heures</strong>.</p>
    <p style="color: #666; font-size: 14px;">Ou copiez ce lien : <br><code style="word-break:break-all;">${lienVerification}</code></p>
  `

  await transporteur.sendMail({
    from: emailFrom,
    to: email,
    subject: '✉️ Vérifiez votre adresse email - TAALIF',
    html: templateEmail(contenu),
  })
}

// ─── Email de réinitialisation ────────────────────────────────────

export async function envoyerEmailReinitialisation(
  email: string,
  nom: string,
  token: string
): Promise<void> {
  const lienReset = `${appUrl}/reinitialiser-mdp?token=${token}`

  const contenu = `
    <h2 style="color: #1a6f47; font-family: Georgia, serif;">Réinitialisation de mot de passe</h2>
    <p>Bonjour ${nom},</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe sur TAALIF.</p>
    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
    <div style="text-align: center;">
      <a href="${lienReset}" class="btn" style="display:inline-block;background:#2da86c;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0;">
        🔑 Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">Ce lien expire dans <strong>1 heure</strong>.</p>
    <p style="color: #666; font-size: 14px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
  `

  await transporteur.sendMail({
    from: emailFrom,
    to: email,
    subject: '🔑 Réinitialisation de mot de passe - TAALIF',
    html: templateEmail(contenu),
  })
}
