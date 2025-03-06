import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Product } from "../types/Product";

// Fonction pour récupérer tous les produits
export const getProducts = async (): Promise<Product[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Product[];
    } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        throw error;
    }
};

// Fonction pour créer un nouveau produit
export const createProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
    try {
        console.log("Création du produit :", product); // Vérification des données
        await addDoc(collection(db, "products"), {
            ...product,
        });
        console.log("Produit créé avec succès."); // Vérification
    } catch (error) {
        console.error("Erreur lors de la création du produit :", error);
        throw error;
    }
};

// Fonction pour mettre à jour un produit existant
export const updateProduct = async (product: Product): Promise<void> => {
    try {
        console.log("Mise à jour du produit :", product); // Vérification des données
        const productRef = doc(db, "products", product.id!);
        await updateDoc(productRef, {
            ...product,
        });
        console.log("Produit mis à jour avec succès."); // Vérification
    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit :", error);
        throw error;
    }
};

// Fonction pour supprimer un produit
export const deleteProduct = async (productId: string): Promise<void> => {
    try {
        console.log("Suppression du produit avec l'ID :", productId); // Vérification
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        console.log("Produit supprimé avec succès."); // Vérification
    } catch (error) {
        console.error("Erreur lors de la suppression du produit :", error);
        throw error;
    }
};