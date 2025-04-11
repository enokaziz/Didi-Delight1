import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LoyaltyReward } from '../../../types/loyaltyPoints';

interface RewardDetailsModalProps {
  visible: boolean;
  reward: LoyaltyReward | null;
  userPoints: number;
  onClose: () => void;
  onRedeem: (rewardId: string) => Promise<boolean>;
}

const RewardDetailsModal: React.FC<RewardDetailsModalProps> = ({
  visible,
  reward,
  userPoints,
  onClose,
  onRedeem,
}) => {
  const [loading, setLoading] = useState(false);

  if (!reward) return null;

  const canRedeem = userPoints >= reward.pointsCost;

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <FontAwesome5 name="percent" size={20} color="#F04E98" />;
      case 'freeProduct':
        return <FontAwesome5 name="gift" size={20} color="#F04E98" />;
      case 'freeDelivery':
        return <FontAwesome5 name="shipping-fast" size={20} color="#F04E98" />;
      case 'exclusive':
        return <FontAwesome5 name="star" size={20} color="#F04E98" />;
      case 'event':
        return <FontAwesome5 name="calendar-alt" size={20} color="#F04E98" />;
      default:
        return <FontAwesome5 name="gift" size={20} color="#F04E98" />;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Réduction';
      case 'freeProduct':
        return 'Produit gratuit';
      case 'freeDelivery':
        return 'Livraison gratuite';
      case 'exclusive':
        return 'Offre exclusive';
      case 'event':
        return 'Événement';
      default:
        return 'Autre';
    }
  };

  const handleRedeem = () => {
    if (!canRedeem) {
      Alert.alert(
        'Points insuffisants',
        `Vous avez besoin de ${reward.pointsCost} points pour obtenir cette récompense. Il vous manque ${reward.pointsCost - userPoints} points.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Échanger des points',
      `Êtes-vous sûr de vouloir échanger ${reward.pointsCost} points contre cette récompense ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Échanger',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await onRedeem(reward.id);
              if (success) {
                Alert.alert(
                  'Félicitations !',
                  'Vous avez échangé vos points avec succès. Votre récompense est maintenant disponible.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Erreur',
                  'Une erreur est survenue lors de l\'échange des points. Veuillez réessayer.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Erreur lors de l\'échange des points:', error);
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'échange des points. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome5 name="times" size={20} color="#666" />
          </TouchableOpacity>

          <ScrollView style={styles.scrollContent}>
            {reward.imageUrl ? (
              <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} resizeMode="cover" />
            ) : (
              <View style={styles.rewardImagePlaceholder}>
                {getRewardTypeIcon(reward.type)}
              </View>
            )}

            <View style={styles.rewardHeader}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <View style={styles.typeContainer}>
                {getRewardTypeIcon(reward.type)}
                <Text style={styles.typeText}>{getRewardTypeLabel(reward.type)}</Text>
              </View>
            </View>

            <Text style={styles.rewardDescription}>{reward.description}</Text>

            {reward.type === 'discount' && reward.discountValue && (
              <View style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>Détails de la réduction</Text>
                <Text style={styles.detailCardText}>
                  Cette récompense vous donne droit à une réduction de {reward.discountValue}% sur votre prochain achat.
                </Text>
              </View>
            )}

            <View style={styles.pointsCostContainer}>
              <View style={styles.pointsCostHeader}>
                <FontAwesome5 name="coins" size={16} color="#F04E98" />
                <Text style={styles.pointsCostTitle}>Coût en points</Text>
              </View>
              <Text style={styles.pointsCost}>{reward.pointsCost}</Text>
            </View>

            <View style={styles.userPointsContainer}>
              <Text style={styles.userPointsLabel}>Vos points actuels:</Text>
              <Text style={styles.userPoints}>{userPoints}</Text>
            </View>

            {!canRedeem && (
              <View style={styles.insufficientPointsContainer}>
                <FontAwesome5 name="exclamation-circle" size={16} color="#f44336" />
                <Text style={styles.insufficientPointsText}>
                  Il vous manque {reward.pointsCost - userPoints} points pour obtenir cette récompense
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.redeemButton,
                !canRedeem && styles.disabledButton,
                loading && styles.loadingButton,
              ]}
              onPress={handleRedeem}
              disabled={!canRedeem || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <FontAwesome5 name="exchange-alt" size={16} color="white" />
                  <Text style={styles.redeemButtonText}>
                    {canRedeem ? 'Échanger mes points' : 'Points insuffisants'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                En échangeant vos points, vous acceptez les conditions d'utilisation du programme de fidélité.
                Les récompenses sont soumises à disponibilité et peuvent être modifiées sans préavis.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  rewardImage: {
    width: '100%',
    height: 200,
  },
  rewardImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  rewardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  rewardDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 16,
  },
  detailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailCardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  pointsCostContainer: {
    backgroundColor: '#FEE7F2',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  pointsCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsCostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F04E98',
    marginLeft: 8,
  },
  pointsCost: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F04E98',
  },
  userPointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userPointsLabel: {
    fontSize: 16,
    color: '#666',
  },
  userPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  insufficientPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  insufficientPointsText: {
    fontSize: 14,
    color: '#f44336',
    marginLeft: 8,
  },
  redeemButton: {
    backgroundColor: '#F04E98',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  loadingButton: {
    backgroundColor: '#F04E98',
    opacity: 0.7,
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  termsContainer: {
    padding: 16,
    marginBottom: 30,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default RewardDetailsModal;
