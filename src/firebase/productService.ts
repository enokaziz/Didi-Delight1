import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { Product } from '../types/Product';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        imageUrl: data.imageUrl || '',
        category: data.category || '',
        stock: data.stock || 0,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        isPopular: data.isPopular || false,
        isPromotional: data.isPromotional || false,
      } as Product;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    throw new Error('Échec de la récupération des produits. Veuillez réessayer.');
  }
};

export const uploadImage = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = ref(storage, `products/${filename}`);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image :', error);
    throw new Error('Échec de l\'upload de l\'image. Veuillez réessayer.');
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  if (!product.name || product.name.trim() === "") {
    throw new Error('Le nom du produit ne peut pas être vide.');
  }
  if (product.price <= 0) {
    throw new Error('Le prix doit être supérieur à 0.');
  }

  const productData = {
    ...product,
    description: product.description || '',
    imageUrl: product.imageUrl || '',
    stock: product.stock || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    isPopular: product.isPopular || false,
    isPromotional: product.isPromotional || false,
  };

  try {
    await addDoc(collection(db, 'products'), productData);
  } catch (error) {
    console.error('Erreur lors de la création du produit :', error);
    throw new Error('Échec de la création du produit. Veuillez réessayer.');
  }
};

export const updateProduct = async (product: Product): Promise<void> => {
  if (!product.name || product.name.trim() === "") {
    throw new Error('Le nom du produit ne peut pas être vide.');
  }
  if (product.price <= 0) {
    throw new Error('Le prix doit être supérieur à 0.');
  }

  const productData = {
    name: product.name,
    description: product.description || '',
    price: product.price,
    imageUrl: product.imageUrl || '',
    category: product.category,
    stock: product.stock || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    isPopular: product.isPopular || false,
    isPromotional: product.isPromotional || false,
  };

  try {
    const productRef = doc(db, 'products', product.id);
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

export type { Product };
