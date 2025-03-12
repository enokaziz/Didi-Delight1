import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, Timestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  usageCount?: number;
  minimumPurchase?: number;
  usageLimit?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  active?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const COLLECTION_NAME = 'promotions';

export const promotionService = {
  async createPromotion(promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Promotion> {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const now = new Date();
      
      const newPromotion: Promotion = {
        ...promotion,
        id: docRef.id,
        usageCount: 0,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(docRef, newPromotion);
      return newPromotion;
    } catch (error) {
      console.error('Erreur lors de la création de la promotion:', error);
      throw error;
    }
  },

  async getPromotion(id: string): Promise<Promotion | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Promotion;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la promotion:', error);
      throw error;
    }
  },

  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('active', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Promotion);
    } catch (error) {
      console.error('Erreur lors de la récupération des promotions actives:', error);
      throw error;
    }
  },

  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la promotion:', error);
      throw error;
    }
  },

  async incrementUsageCount(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        usageCount: increment(1),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur d\'utilisation:', error);
      throw error;
    }
  },

  async getApplicablePromotions(productIds: string[], categoryIds: string[], totalAmount: number): Promise<Promotion[]> {
    try {
      const activePromotions = await this.getActivePromotions();
      
      return activePromotions.filter(promotion => {
        // Vérifier le montant minimum d'achat
        if (promotion.minimumPurchase && totalAmount < promotion.minimumPurchase) {
          return false;
        }

        // Vérifier la limite d'utilisation
        if (promotion.usageLimit && promotion.usageCount !== undefined && promotion.usageCount >= promotion.usageLimit) {
          return false;
        }

        // Si aucun produit ou catégorie n'est spécifié, la promotion s'applique à tout
        if (!promotion.applicableProducts?.length && !promotion.applicableCategories?.length) {
          return true;
        }

        // Vérifier les produits applicables
        if (promotion.applicableProducts?.length) {
          if (productIds.some(id => promotion.applicableProducts?.includes(id))) {
            return true;
          }
        }

        // Vérifier les catégories applicables
        if (promotion.applicableCategories?.length) {
          if (categoryIds.some(id => promotion.applicableCategories?.includes(id))) {
            return true;
          }
        }

        return false;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des promotions applicables:', error);
      throw error;
    }
  }
};

const applyPromotion = async (promotion: Promotion) => {
  if (!promotion) return;
  if (promotion.usageLimit && promotion.usageCount !== undefined && promotion.usageCount >= promotion.usageLimit) {
    alert(`La promotion ${promotion.title} a atteint sa limite d'utilisation.`);
    return;
  }
  if (promotion.usageCount !== undefined && promotion.usageCount >= 1000) {
    alert(`La promotion ${promotion.title} a atteint le nombre maximum d'utilisations.`);
    return;
  }
  await promotionService.incrementUsageCount(promotion.id);
  alert(`Promotion ${promotion.title} appliquée avec succès!`);
};
