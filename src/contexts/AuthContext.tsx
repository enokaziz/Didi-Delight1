import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

type UserRole = "admin" | "client" | "livreur" | "invité";

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeRole: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const userRef = doc(db, "users", user.uid);
          unsubscribeRole = onSnapshot(userRef, (doc) => {
            setUserRole(doc.exists() ? doc.data().role : "client");
          });
        } else {
          setUserRole("client");
        }
      } catch (error) {
        console.error("Erreur :", error);
        setUserRole("client");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRole) unsubscribeRole();
    };
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserRole("client");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({ user, userRole, loading, logout }),
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