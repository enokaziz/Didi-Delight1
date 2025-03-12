import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { LoyaltyPoints } from '../../types/loyaltyPoints';

const COLLECTION_NAME = 'loyalty_points';

export const loyaltyPointsService = {
  async getUserPoints(userId: string): Promise<LoyaltyPoints | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LoyaltyPoints;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des points:', error);
      throw error;
    }
  },

  async initializeUserPoints(userId: string): Promise<LoyaltyPoints> {
    try {
      const newPoints: LoyaltyPoints = {
        id: userId,
        userId,
        points: 0,
        history: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, COLLECTION_NAME, userId), newPoints);
      return newPoints;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des points:', error);
      throw error;
    }
  },

  async addPoints(userId: string, points: number, description: string): Promise<void> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints) {
        await this.initializeUserPoints(userId);
      }

      const docRef = doc(db, COLLECTION_NAME, userId);
      const now = new Date();

      await updateDoc(docRef, {
        points: (userPoints?.points || 0) + points,
        history: [...(userPoints?.history || []), {
          date: now,
          points,
          type: 'earn',
          description
        }],
        updatedAt: now
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout des points:', error);
      throw error;
    }
  },

  async redeemPoints(userId: string, points: number, description: string): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints || userPoints.points < points) {
        return false;
      }

      const docRef = doc(db, COLLECTION_NAME, userId);
      const now = new Date();

      await updateDoc(docRef, {
        points: userPoints.points - points,
        history: [...userPoints.history, {
          date: now,
          points: -points,
          type: 'redeem',
          description
        }],
        updatedAt: now
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'utilisation des points:', error);
      throw error;
    }
  },

  async getPointsHistory(userId: string): Promise<LoyaltyPoints['history']> {
    try {
      const userPoints = await this.getUserPoints(userId);
      return userPoints?.history || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }
};
