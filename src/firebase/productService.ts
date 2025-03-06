import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Product } from '../types/Product';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  if (product.price <= 0) {
    throw new Error('Le prix doit être supérieur à 0.');
  }
  try {
    await addDoc(collection(db, 'products'), product);
  } catch (error) {
    console.error('Erreur lors de la création du produit :', error);
    throw error;
  }
};

export const updateProduct = async (product: Product): Promise<void> => {
  try {
    const productRef = doc(db, 'products', product.id!);
    await updateDoc(productRef, {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      isPopular: product.isPopular,
      isPromotional: product.isPromotional,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
    throw error;
  }
};