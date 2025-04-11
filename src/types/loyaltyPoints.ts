export type LoyaltyLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTransaction {
  id: string;
  date: Date;
  points: number;
  type: 'earn' | 'redeem';
  description: string;
  orderId?: string;
  source: 'purchase' | 'manual' | 'promotion' | 'reward' | 'referral' | 'birthday';
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'freeProduct' | 'freeDelivery' | 'exclusive' | 'event';
  discountValue?: number; // Pour les réductions
  productId?: string; // Pour les produits gratuits
  active: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyPoints {
  id: string;
  userId: string;
  userName?: string; // Nom de l'utilisateur pour l'affichage
  userEmail?: string; // Email de l'utilisateur pour l'affichage
  points: number;
  totalPointsEarned: number; // Total des points gagnés (pour déterminer le niveau)
  totalPointsRedeemed: number; // Total des points utilisés
  level: LoyaltyLevel;
  history: LoyaltyTransaction[];
  lastPurchaseDate?: Date;
  purchaseCount: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltySettings {
  id: string;
  pointsPerCurrency: number; // Nombre de points par unité monétaire (ex: 1 point pour 1000 FCFA)
  levelThresholds: {
    silver: number; // Points nécessaires pour atteindre le niveau argent
    gold: number; // Points nécessaires pour atteindre le niveau or
    platinum: number; // Points nécessaires pour atteindre le niveau platine
  };
  birthdayBonus: number; // Points bonus pour l'anniversaire
  referralBonus: number; // Points bonus pour une recommandation
  firstPurchaseBonus: number; // Points bonus pour le premier achat
  minimumPointsToRedeem: number; // Nombre minimum de points pour une utilisation
  active: boolean;
  updatedAt: Date;
}
