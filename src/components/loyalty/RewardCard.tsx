import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LoyaltyReward } from '../../types/loyaltyPoints';
import { FontAwesome5 } from '@expo/vector-icons';

interface RewardCardProps {
  reward: LoyaltyReward;
  onPress: (reward: LoyaltyReward) => void;
}

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'discount': return 'percent';
    case 'freeProduct': return 'birthday-cake';
    case 'freeDelivery': return 'shipping-fast';
    case 'exclusive': return 'crown';
    case 'event': return 'calendar-alt';
    default: return 'gift';
  }
};

const RewardCard: React.FC<RewardCardProps> = ({ reward, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, !reward.active && styles.inactiveContainer]}
      onPress={() => onPress(reward)}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 
          name={getRewardIcon(reward.type)} 
          size={24} 
          color="#F04E98" 
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{reward.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{reward.description}</Text>
        <View style={styles.pointsContainer}>
          <FontAwesome5 name="coins" size={14} color="#F6BE00" />
          <Text style={styles.pointsText}>{reward.pointsCost} points</Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        {!reward.active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveText}>Inactif</Text>
          </View>
        )}
        <FontAwesome5 name="chevron-right" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveContainer: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F6BE00',
    marginLeft: 5,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  inactiveBadge: {
    backgroundColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 5,
  },
  inactiveText: {
    fontSize: 10,
    color: '#777',
  },
});

export default RewardCard;
