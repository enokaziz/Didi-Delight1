// Taille maximale des fichiers (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Types de fichiers autorisés
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

// Messages d'erreur
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "Le fichier dépasse la taille maximale autorisée (5MB).",
  INVALID_FILE_TYPE: "Type de fichier non supporté. Utilisez JPEG, PNG ou PDF.",
  UPLOAD_FAILED: "Échec de l'envoi du fichier. Veuillez réessayer.",
};