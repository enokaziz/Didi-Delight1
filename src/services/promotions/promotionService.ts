import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, Timestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

// Interface complète pour les promotions
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType?: 'percentage' | 'fixed'; // Type de réduction (optionnel)
  discountValue?: number; // Valeur de la réduction (optionnel)
  usageCount: number; // Nombre d'utilisations
  minimumPurchase?: number; // Montant minimum d'achat requis
  usageLimit?: number; // Limite maximale d'utilisations
  applicableProducts?: string[]; // IDs des produits applicables
  applicableCategories?: string[]; // IDs des catégories applicables
  active: boolean; // Statut actif/inactif
  startDate: Date; // Date de début
  endDate: Date; // Date de fin
  createdAt: Date; // Date de création
  updatedAt: Date; // Date de mise à jour
  conditions?: string; // Conditions supplémentaires (texte libre)
}

// Constantes pour les noms et messages
const COLLECTION_NAME = 'promotions';
const ERRORS = {
  CREATE_PROMO: 'Erreur lors de la création de la promotion :',
  GET_PROMO: 'Erreur lors de la récupération de la promotion :',
  GET_ACTIVE_PROMOS: 'Erreur lors de la récupération des promotions actives :',
  UPDATE_PROMO: 'Erreur lors de la mise à jour de la promotion :',
  INCREMENT_USAGE: 'Erreur lors de l\'incrémentation du compteur d\'utilisation :',
  GET_APPLICABLE_PROMOS: 'Erreur lors de la récupération des promotions applicables :',
};

export const promotionService = {
  /**
   * Crée une nouvelle promotion dans Firestore
   * @param promotion Données de la promotion sans id, createdAt, updatedAt, usageCount
   * @returns La promotion créée
   */
  async createPromotion(promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Promotion> {
    try {
      // Validation des champs obligatoires
      if (!promotion.title) throw new Error('Le titre est requis');
      if (!promotion.startDate || !promotion.endDate) throw new Error('Les dates de début et de fin sont requises');
      if (promotion.startDate > promotion.endDate) throw new Error('La date de début doit être antérieure à la date de fin');

      const docRef = doc(collection(db, COLLECTION_NAME));
      const now = new Date();

      // Création d'un objet de base avec les champs obligatoires
      const newPromotion: any = {
        id: docRef.id,
        title: promotion.title,
        description: promotion.description || "",
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
        active: promotion.active ?? true, // Par défaut actif si non spécifié
      };
      
      // Ajout des champs optionnels seulement s'ils ont des valeurs
      if (promotion.discountType) {
        newPromotion.discountType = promotion.discountType;
      }
      
      if (promotion.discountValue) {
        newPromotion.discountValue = promotion.discountValue;
      }
      
      if (promotion.minimumPurchase && promotion.minimumPurchase > 0) {
        newPromotion.minimumPurchase = promotion.minimumPurchase;
      }
      
      if (promotion.usageLimit && promotion.usageLimit > 0) {
        newPromotion.usageLimit = promotion.usageLimit;
      }
      
      if (promotion.conditions && promotion.conditions.trim() !== "") {
        newPromotion.conditions = promotion.conditions.trim();
      }
      
      if (promotion.applicableProducts && promotion.applicableProducts.length > 0) {
        newPromotion.applicableProducts = promotion.applicableProducts;
      }
      
      if (promotion.applicableCategories && promotion.applicableCategories.length > 0) {
        newPromotion.applicableCategories = promotion.applicableCategories;
      }

      await setDoc(docRef, newPromotion);
      return newPromotion;
    } catch (error) {
      console.error(ERRORS.CREATE_PROMO, error);
      throw error;
    }
  },

  /**
   * Récupère une promotion par son ID
   * @param id ID de la promotion
   * @returns La promotion ou null si elle n'existe pas
   */
  async getPromotion(id: string): Promise<Promotion | null> {
    try {
      if (!id) throw new Error('L\'ID est requis');
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Promotion;
      }
      return null;
    } catch (error) {
      console.error(ERRORS.GET_PROMO, error);
      throw error;
    }
  },

  /**
   * Récupère toutes les promotions actives
   * @returns Liste des promotions actives
   */
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, COLLECTION_NAME),
        where('active', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        orderBy('startDate', 'desc') // Tri par date de début
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
    } catch (error) {
      console.error(ERRORS.GET_ACTIVE_PROMOS, error);
      throw error;
    }
  },

  /**
   * Met à jour une promotion existante
   * @param id ID de la promotion
   * @param updates Champs à mettre à jour
   */
  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<void> {
    try {
      if (!id) throw new Error('L\'ID est requis');
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(ERRORS.UPDATE_PROMO, error);
      throw error;
    }
  },

  /**
   * Incrémente le compteur d'utilisation d'une promotion
   * @param id ID de la promotion
   * @returns true si l'incrémentation réussit
   */
  async incrementUsageCount(id: string): Promise<boolean> {
    try {
      if (!id) throw new Error('L\'ID est requis');
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        usageCount: increment(1),
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error(ERRORS.INCREMENT_USAGE, error);
      throw error;
    }
  },

  /**
   * Récupère les promotions applicables selon les produits, catégories et montant total
   * @param productIds Liste des IDs de produits
   * @param categoryIds Liste des IDs de catégories
   * @param totalAmount Montant total de l'achat
   * @returns Liste des promotions applicables
   */
  async getApplicablePromotions(productIds: string[], categoryIds: string[], totalAmount: number): Promise<Promotion[]> {
    try {
      const activePromotions = await this.getActivePromotions();

      const isPromotionApplicable = (promotion: Promotion): boolean => {
        // Vérifier le montant minimum
        if (promotion.minimumPurchase && totalAmount < promotion.minimumPurchase) return false;

        // Vérifier la limite d'utilisation
        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) return false;

        // Si aucune restriction produit/catégorie, applicable à tout
        if (!promotion.applicableProducts?.length && !promotion.applicableCategories?.length) return true;

        // Vérifier les produits ou catégories applicables
        const appliesToProducts = promotion.applicableProducts?.some(id => productIds.includes(id)) || false;
        const appliesToCategories = promotion.applicableCategories?.some(id => categoryIds.includes(id)) || false;
        return appliesToProducts || appliesToCategories;
      };

      return activePromotions.filter(isPromotionApplicable);
    } catch (error) {
      console.error(ERRORS.GET_APPLICABLE_PROMOS, error);
      throw error;
    }
  },
};

/**
 * Applique une promotion en vérifiant ses conditions et en incrémentant son usage
 * @param promotion La promotion à appliquer
 */
export const applyPromotion = async (promotion: Promotion): Promise<boolean> => {
  try {
    if (!promotion) throw new Error('Aucune promotion fournie');
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      throw new Error(`La promotion ${promotion.title} a atteint sa limite d'utilisation`);
    }
    if (promotion.usageCount >= 1000) { // Limite arbitraire, ajustable
      throw new Error(`La promotion ${promotion.title} a atteint le nombre maximum d'utilisations`);
    }

    const success = await promotionService.incrementUsageCount(promotion.id);
    if (success) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'application de la promotion :', error);
    throw error;
  }
};