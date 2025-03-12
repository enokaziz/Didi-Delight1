import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

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