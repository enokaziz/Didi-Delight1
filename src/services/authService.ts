import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import * as LocalAuthentication from 'expo-local-authentication';
import { sendPasswordResetEmail } from "firebase/auth";

export const register = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    const errorMessage = error.code === "auth/email-already-in-use"
      ? "Cet email est déjà utilisé."
      : error.code === "auth/invalid-email"
      ? "Email invalide."
      : "Erreur lors de l'inscription: " + error.message;
    throw new Error(errorMessage);
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    const errorMessage = error.code === "auth/wrong-password"
      ? "Mot de passe incorrect."
      : error.code === "auth/user-not-found"
      ? "Utilisateur non trouvé."
      : "Erreur lors de la connexion: " + error.message;
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error("Erreur lors de la déconnexion: " + error.message);
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    throw new Error("Erreur lors de la réinitialisation du mot de passe: " + error.message);
  }
}
 
export const biometricLogin = async () => {
  // Commenter pour désactiver temporairement
  /*
  try {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
    if (!isBiometricAvailable) {
      throw new Error("L'authentification biométrique n'est pas disponible sur cet appareil.");
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authentifiez-vous pour accéder à votre compte',
    });

    if (!result.success) {
      throw new Error("Échec de l'authentification biométrique.");
    }

    return true;
  } catch (error: any) {
    throw new Error("Erreur lors de la connexion biométrique: " + error.message);
  }
  */
  return false; // Retourne false par défaut pour désactiver
};