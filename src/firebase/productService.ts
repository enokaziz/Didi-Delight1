import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Product } from '../types/Product';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '', // Valeur par défaut si `name` est undefined
        description: data.description || '', // Valeur par défaut si `description` est undefined
        price: data.price || 0, // Valeur par défaut si `price` est undefined
        image: data.image || '', // Valeur par défaut si `image` est undefined
        category: data.category || '', // Valeur par défaut si `category` est undefined
        isPopular: data.isPopular || false, // Valeur par défaut pour `isPopular`
        isPromotional: data.isPromotional || false, // Valeur par défaut pour `isPromotional`
      } as Product;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    throw new Error('Échec de la récupération des produits. Veuillez réessayer.');
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  // Validation des champs obligatoires
  if (!product.name || product.name.trim() === "") {
    throw new Error('Le nom du produit ne peut pas être vide.');
  }
  if (product.price <= 0) {
    throw new Error('Le prix doit être supérieur à 0.');
  }

  // Ajoutez des valeurs par défaut pour les champs optionnels
  const productData = {
    ...product,
    description: product.description || '', // Valeur par défaut si `description` est undefined
    image: product.image || '', // Valeur par défaut si `image` est undefined
    isPopular: product.isPopular || false, // Valeur par défaut pour `isPopular`
    isPromotional: product.isPromotional || false, // Valeur par défaut pour `isPromotional`
  };

  try {
    await addDoc(collection(db, 'products'), productData);
  } catch (error) {
    console.error('Erreur lors de la création du produit :', error);
    throw new Error('Échec de la création du produit. Veuillez réessayer.');
  }
};

export const updateProduct = async (product: Product): Promise<void> => {
  // Validation des champs obligatoires
  if (!product.name || product.name.trim() === "") {
    throw new Error('Le nom du produit ne peut pas être vide.');
  }
  if (product.price <= 0) {
    throw new Error('Le prix doit être supérieur à 0.');
  }

  // Ajoutez des valeurs par défaut pour les champs optionnels
  const productData = {
    name: product.name,
    description: product.description || '', // Valeur par défaut si `description` est undefined
    price: product.price,
    image: product.image || '', // Valeur par défaut si `image` est undefined
    category: product.category,
    isPopular: product.isPopular || false, // Valeur par défaut pour `isPopular`
    isPromotional: product.isPromotional || false, // Valeur par défaut pour `isPromotional`
  };

  try {
    const productRef = doc(db, 'products', product.id!);
    await updateDoc(productRef, productData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    throw new Error('Échec de la mise à jour du produit. Veuillez réessayer.');
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  if (!productId || productId.trim() === "") {
    throw new Error('ID du produit invalide.');
  }

  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
    throw new Error('Échec de la suppression du produit. Veuillez réessayer.');
  }
};