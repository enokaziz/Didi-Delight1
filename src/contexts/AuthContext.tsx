//src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { User, onAuthStateChanged, updatePassword as firebaseUpdatePassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { Alert } from "react-native";
import { biometricLogin } from "../services/authService"; // Ajout de l'importation

type UserRole = "admin" | "client" | "livreur" | "invité";

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(true);
  const unsubscribeRoleRef = useRef<() => void>(); // Référence pour le désabonnement

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const userRef = doc(db, "users", user.uid);
          unsubscribeRoleRef.current = onSnapshot(userRef, (doc) => {
            setUserRole(doc.exists() ? doc.data().role : "client");
          });
        } else {
          setUserRole("client");
          if (unsubscribeRoleRef.current) {
            unsubscribeRoleRef.current(); // Désabonne ici aussi
          }
        }
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRoleRef.current) unsubscribeRoleRef.current();
    };
  }, []);

  const loginWithBiometric = async () => {
    try {
      const success = await biometricLogin();
      if (success) {
        // Si la connexion est réussie, vous pouvez mettre à jour l'état de l'utilisateur ici
        setUser(user); // Assurez-vous de récupérer l'utilisateur approprié
      }
    } catch (error: any) { // Spécification du type d'erreur
      console.error("Erreur lors de la connexion biométrique :", error);
      Alert.alert("Erreur", error.message);
    }
  };
  
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserRole("client");
      if (unsubscribeRoleRef.current) {
        unsubscribeRoleRef.current(); // Désabonnement explicite lors du logout
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      Alert.alert("Erreur", "Déconnexion échouée.");
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (user) {
        await firebaseUpdatePassword(user, newPassword);
        Alert.alert("Succès", "Mot de passe mis à jour avec succès.");
      } else {
        throw new Error("Aucun utilisateur connecté.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      Alert.alert("Erreur", "Échec de la mise à jour du mot de passe.");
    }
  };


  const contextValue = useMemo(
    () => ({ user, userRole, loading, logout, updatePassword, loginWithBiometric }),
    [user, userRole, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};