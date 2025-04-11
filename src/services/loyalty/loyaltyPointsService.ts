import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, Timestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { LoyaltyPoints, LoyaltyLevel, LoyaltyReward, LoyaltySettings, LoyaltyTransaction } from '../../types/loyaltyPoints';

const POINTS_COLLECTION = 'loyalty_points';
const REWARDS_COLLECTION = 'loyalty_rewards';
const SETTINGS_COLLECTION = 'loyalty_settings';

// ID du document de paramètres de fidélité (un seul document)
const SETTINGS_DOC_ID = 'loyalty_settings';

export const loyaltyPointsService = {
  // ===== GESTION DES POINTS UTILISATEUR =====
  
  async getUserPoints(userId: string): Promise<LoyaltyPoints | null> {
    try {
      const docRef = doc(db, POINTS_COLLECTION, userId);
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

  async getAllUsersPoints(): Promise<LoyaltyPoints[]> {
    try {
      const q = query(collection(db, POINTS_COLLECTION), orderBy('points', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as LoyaltyPoints);
    } catch (error) {
      console.error('Erreur lors de la récupération des points de tous les utilisateurs:', error);
      throw error;
    }
  },

  async initializeUserPoints(userId: string, userName?: string, userEmail?: string): Promise<LoyaltyPoints> {
    try {
      // Récupérer les paramètres de fidélité pour le bonus de premier achat
      const settings = await this.getSettings();
      
      const now = new Date();
      const transactionId = `init_${userId}_${now.getTime()}`;
      
      const initialTransaction: LoyaltyTransaction = {
        id: transactionId,
        date: now,
        points: 0,
        type: 'earn',
        description: 'Initialisation du compte',
        source: 'manual'
      };
      
      const newPoints: LoyaltyPoints = {
        id: userId,
        userId,
        userName,
        userEmail,
        points: 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        level: 'bronze',
        history: [initialTransaction],
        purchaseCount: 0,
        totalSpent: 0,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, POINTS_COLLECTION, userId), newPoints);
      return newPoints;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des points:', error);
      throw error;
    }
  },

  async addPoints(userId: string, points: number, description: string, source: LoyaltyTransaction['source'] = 'manual', orderId?: string): Promise<void> {
    try {
      let userPoints = await this.getUserPoints(userId);
      if (!userPoints) {
        userPoints = await this.initializeUserPoints(userId);
      }

      const docRef = doc(db, POINTS_COLLECTION, userId);
      const now = new Date();
      const transactionId = `earn_${userId}_${now.getTime()}`;
      
      const transaction: LoyaltyTransaction = {
        id: transactionId,
        date: now,
        points,
        type: 'earn',
        description,
        source,
        orderId
      };

      const newTotalPointsEarned = (userPoints.totalPointsEarned || 0) + points;
      const newLevel = await this.calculateLevel(newTotalPointsEarned);

      await updateDoc(docRef, {
        points: userPoints.points + points,
        totalPointsEarned: newTotalPointsEarned,
        level: newLevel,
        history: [...userPoints.history, transaction],
        updatedAt: now,
        ...(source === 'purchase' ? { 
          lastPurchaseDate: now,
          purchaseCount: (userPoints.purchaseCount || 0) + 1
        } : {})
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout des points:', error);
      throw error;
    }
  },

  async redeemPoints(userId: string, points: number, description: string, rewardId?: string): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      const settings = await this.getSettings();
      
      if (!userPoints || userPoints.points < points || points < settings.minimumPointsToRedeem) {
        return false;
      }

      const docRef = doc(db, POINTS_COLLECTION, userId);
      const now = new Date();
      const transactionId = `redeem_${userId}_${now.getTime()}`;
      
      const transaction: LoyaltyTransaction = {
        id: transactionId,
        date: now,
        points: -points,
        type: 'redeem',
        description,
        source: 'reward',
        orderId: rewardId
      };

      await updateDoc(docRef, {
        points: userPoints.points - points,
        totalPointsRedeemed: (userPoints.totalPointsRedeemed || 0) + points,
        history: [...userPoints.history, transaction],
        updatedAt: now
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'utilisation des points:', error);
      throw error;
    }
  },

  async getPointsHistory(userId: string): Promise<LoyaltyTransaction[]> {
    try {
      const userPoints = await this.getUserPoints(userId);
      return userPoints?.history || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  },

  async calculateLevel(totalPoints: number): Promise<LoyaltyLevel> {
    try {
      const settings = await this.getSettings();
      
      if (totalPoints >= settings.levelThresholds.platinum) {
        return 'platinum';
      } else if (totalPoints >= settings.levelThresholds.gold) {
        return 'gold';
      } else if (totalPoints >= settings.levelThresholds.silver) {
        return 'silver';
      } else {
        return 'bronze';
      }
    } catch (error) {
      console.error('Erreur lors du calcul du niveau:', error);
      return 'bronze'; // Niveau par défaut en cas d'erreur
    }
  },

  async addPointsForPurchase(userId: string, orderAmount: number, orderId: string): Promise<number> {
    try {
      const settings = await this.getSettings();
      if (!settings.active) return 0;
      
      const userPoints = await this.getUserPoints(userId);
      const isFirstPurchase = !userPoints || userPoints.purchaseCount === 0;
      
      // Calculer les points de base pour l'achat
      const basePoints = Math.floor(orderAmount * settings.pointsPerCurrency);
      
      // Ajouter les points de base
      await this.addPoints(
        userId, 
        basePoints, 
        `Achat #${orderId.substring(0, 6)} - ${orderAmount} FCFA`, 
        'purchase',
        orderId
      );
      
      let bonusPoints = 0;
      
      // Bonus pour premier achat
      if (isFirstPurchase && settings.firstPurchaseBonus > 0) {
        await this.addPoints(
          userId,
          settings.firstPurchaseBonus,
          'Bonus premier achat',
          'promotion',
          orderId
        );
        bonusPoints += settings.firstPurchaseBonus;
      }
      
      // Mettre à jour le montant total dépensé
      if (userPoints) {
        const docRef = doc(db, POINTS_COLLECTION, userId);
        await updateDoc(docRef, {
          totalSpent: (userPoints.totalSpent || 0) + orderAmount,
        });
      }
      
      return basePoints + bonusPoints;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des points pour un achat:', error);
      return 0;
    }
  },

  // ===== GESTION DES RÉCOMPENSES =====
  
  async createReward(reward: Omit<LoyaltyReward, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoyaltyReward> {
    try {
      const now = new Date();
      const newReward: Omit<LoyaltyReward, 'id'> = {
        ...reward,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, REWARDS_COLLECTION), newReward);
      return { id: docRef.id, ...newReward } as LoyaltyReward;
    } catch (error) {
      console.error('Erreur lors de la création d\'une récompense:', error);
      throw error;
    }
  },
  
  async updateReward(rewardId: string, updates: Partial<LoyaltyReward>): Promise<void> {
    try {
      const docRef = doc(db, REWARDS_COLLECTION, rewardId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour d\'une récompense:', error);
      throw error;
    }
  },
  
  async deleteReward(rewardId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, REWARDS_COLLECTION, rewardId));
    } catch (error) {
      console.error('Erreur lors de la suppression d\'une récompense:', error);
      throw error;
    }
  },
  
  async getReward(rewardId: string): Promise<LoyaltyReward | null> {
    try {
      const docRef = doc(db, REWARDS_COLLECTION, rewardId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LoyaltyReward;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération d\'une récompense:', error);
      throw error;
    }
  },
  
  async getAllRewards(activeOnly: boolean = false): Promise<LoyaltyReward[]> {
    try {
      let q;
      if (activeOnly) {
        q = query(collection(db, REWARDS_COLLECTION), where('active', '==', true), orderBy('pointsCost', 'asc'));
      } else {
        q = query(collection(db, REWARDS_COLLECTION), orderBy('pointsCost', 'asc'));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as LoyaltyReward);
    } catch (error) {
      console.error('Erreur lors de la récupération des récompenses:', error);
      throw error;
    }
  },
  
  async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    try {
      const reward = await this.getReward(rewardId);
      const userPoints = await this.getUserPoints(userId);
      
      if (!reward || !userPoints || !reward.active || userPoints.points < reward.pointsCost) {
        return false;
      }
      
      return await this.redeemPoints(
        userId, 
        reward.pointsCost, 
        `Récompense : ${reward.name}`, 
        rewardId
      );
    } catch (error) {
      console.error('Erreur lors de l\'utilisation d\'une récompense:', error);
      return false;
    }
  },

  // ===== GESTION DES PARAMÈTRES =====
  
  async initializeSettings(): Promise<LoyaltySettings> {
    try {
      const defaultSettings: LoyaltySettings = {
        id: SETTINGS_DOC_ID,
        pointsPerCurrency: 0.001, // 1 point pour 1000 FCFA
        levelThresholds: {
          silver: 100,
          gold: 500,
          platinum: 1000
        },
        birthdayBonus: 50,
        referralBonus: 25,
        firstPurchaseBonus: 10,
        minimumPointsToRedeem: 50,
        active: true,
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des paramètres:', error);
      throw error;
    }
  },
  
  async getSettings(): Promise<LoyaltySettings> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LoyaltySettings;
      }
      
      // Si les paramètres n'existent pas, les initialiser
      return await this.initializeSettings();
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  },
  
  async updateSettings(updates: Partial<LoyaltySettings>): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  },
  
  // ===== STATISTIQUES =====
  
  async getLoyaltyStats(): Promise<{
    totalUsers: number;
    totalPoints: number;
    totalPointsRedeemed: number;
    usersByLevel: Record<LoyaltyLevel, number>;
  }> {
    try {
      const users = await this.getAllUsersPoints();
      
      const stats = {
        totalUsers: users.length,
        totalPoints: 0,
        totalPointsRedeemed: 0,
        usersByLevel: {
          bronze: 0,
          silver: 0,
          gold: 0,
          platinum: 0
        }
      };
      
      users.forEach(user => {
        stats.totalPoints += user.points || 0;
        stats.totalPointsRedeemed += user.totalPointsRedeemed || 0;
        stats.usersByLevel[user.level || 'bronze']++;
      });
      
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
};
