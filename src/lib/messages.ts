// Messages d'erreur partagés entre le serveur et l'interface.
// Ce module ne doit dépendre de rien : il est importé aussi bien par les
// routes serveur que par des composants clients.

/** Renvoyé au login quand le compte existe mais n'est pas encore activé. */
export const MSG_EMAIL_NON_VERIFIE =
  'Veuillez vérifier votre adresse email avant de vous connecter'

/** Message unique pour identifiants invalides (évite l'énumération de comptes). */
export const MSG_IDENTIFIANTS_INVALIDES = 'Email ou mot de passe incorrect'

/** Réponse générique des parcours email (inscription, mot de passe oublié). */
export const MSG_VERIFIEZ_VOS_EMAILS =
  'Si cette adresse correspond à un compte, un email vient d\'être envoyé.'
