import { loyaltyPointsService } from '../services/loyalty/loyaltyPointsService';
import { Alert } from 'react-native';

/**
 * Formate une date en chaîne de caractères lisible
 * @param date Date à formater
 * @returns string
 */
export const formatDate = (date: Date): string => {
  if (!date) return '';
  
  // Convertir en objet Date si c'est un timestamp ou une chaîne
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) return 'Date invalide';
  
  // Options de formatage
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  return dateObj.toLocaleDateString('fr-FR', options);
};

/**
 * Ajoute des points de fidélité pour un achat et affiche une alerte à l'utilisateur
 * @param userId ID de l'utilisateur
 * @param orderAmount Montant de la commande
 * @param orderId ID de la commande
 * @returns Promise<void>
 */
export const addLoyaltyPointsForPurchase = async (
  userId: string,
  orderAmount: number,
  orderId: string
): Promise<void> => {
  try {
    // Vérifier si l'utilisateur existe
    if (!userId) {
      console.error('Impossible d\'ajouter des points: ID utilisateur manquant');
      return;
    }
    
    // Ajouter les points pour l'achat
    const pointsAdded = await loyaltyPointsService.addPointsForPurchase(
      userId,
      orderAmount,
      orderId
    );
    
    // Si des points ont été ajoutés, afficher une alerte à l'utilisateur
    if (pointsAdded > 0) {
      Alert.alert(
        'Points de fidélité',
        `Félicitations ! Vous avez gagné ${pointsAdded} points de fidélité pour votre achat.`,
        [{ text: 'Super !' }]
      );
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout des points de fidélité:', error);
  }
};

/**
 * Vérifie le niveau de fidélité de l'utilisateur et retourne un message personnalisé
 * @param userId ID de l'utilisateur
 * @returns Promise<string | null>
 */
export const getLoyaltyLevelMessage = async (
  userId: string
): Promise<string | null> => {
  try {
    // Vérifier si l'utilisateur existe
    if (!userId) {
      return null;
    }
    
    // Récupérer les points de l'utilisateur
    const userPoints = await loyaltyPointsService.getUserPoints(userId);
    
    if (!userPoints) {
      return null;
    }
    
    // Générer un message en fonction du niveau
    switch (userPoints.level) {
      case 'bronze':
        return 'Continuez vos achats pour atteindre le niveau Argent et débloquer plus d\'avantages !';
      case 'silver':
        return 'En tant que membre Argent, vous avez accès à des récompenses exclusives !';
      case 'gold':
        return 'Profitez de vos avantages Or et découvrez nos meilleures offres !';
      case 'platinum':
        return 'Merci pour votre fidélité ! En tant que membre Platine, vous bénéficiez de nos offres les plus exclusives.';
      default:
        return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du niveau de fidélité:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a suffisamment de points pour une récompense
 * @param userId ID de l'utilisateur
 * @param pointsRequired Points nécessaires
 * @returns Promise<boolean>
 */
export const hasEnoughPoints = async (
  userId: string,
  pointsRequired: number
): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur existe
    if (!userId) {
      return false;
    }
    
    // Récupérer les points de l'utilisateur
    const userPoints = await loyaltyPointsService.getUserPoints(userId);
    
    if (!userPoints) {
      return false;
    }
    
    // Vérifier si l'utilisateur a suffisamment de points
    return userPoints.points >= pointsRequired;
  } catch (error) {
    console.error('Erreur lors de la vérification des points:', error);
    return false;
  }
};
