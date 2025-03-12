import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { InventoryItem, InventoryMovement } from '../../types/inventory';

const ITEMS_COLLECTION = 'inventory';
const MOVEMENTS_COLLECTION = 'inventory_movements';

export const inventoryService = {
  // Gestion des articles d'inventaire
  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    try {
      const docRef = doc(collection(db, ITEMS_COLLECTION));
      const now = new Date();
      
      const newItem: InventoryItem = {
        ...item,
        id: docRef.id,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(docRef, newItem);
      return newItem;
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error);
      throw error;
    }
  },

  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    try {
      const docRef = doc(db, ITEMS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error);
      throw error;
    }
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      const docRef = doc(db, ITEMS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      throw error;
    }
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, ITEMS_COLLECTION),
        where('status', '==', 'low_stock')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryItem);
    } catch (error) {
      console.error('Erreur lors de la récupération des articles en stock faible:', error);
      throw error;
    }
  },

  // Gestion des mouvements d'inventaire
  async recordMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    try {
      const docRef = doc(collection(db, MOVEMENTS_COLLECTION));
      const now = new Date();
      
      const newMovement: InventoryMovement = {
        ...movement,
        id: docRef.id,
        createdAt: now
      };

      // Enregistrer le mouvement
      await setDoc(docRef, newMovement);

      // Mettre à jour la quantité de l'article
      const item = await this.getInventoryItem(movement.itemId);
      if (item) {
        const quantityChange = movement.type === 'restock' ? movement.quantity : -movement.quantity;
        const newQuantity = item.quantity + quantityChange;
        
        // Mettre à jour la quantité et le statut
        const status = this.determineStatus(newQuantity, item.minimumQuantity);
        await this.updateInventoryItem(item.id, {
          quantity: newQuantity,
          status,
          lastRestockDate: movement.type === 'restock' ? movement.date : item.lastRestockDate
        });
      }

      return newMovement;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du mouvement:', error);
      throw error;
    }
  },

  async getMovementHistory(itemId: string): Promise<InventoryMovement[]> {
    try {
      const q = query(
        collection(db, MOVEMENTS_COLLECTION),
        where('itemId', '==', itemId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InventoryMovement);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des mouvements:', error);
      throw error;
    }
  },

  // Utilitaires
  determineStatus(quantity: number, minimumQuantity: number): InventoryItem['status'] {
    if (quantity <= 0) {
      return 'out_of_stock';
    } else if (quantity <= minimumQuantity) {
      return 'low_stock';
    } else {
      return 'in_stock';
    }
  }
};
