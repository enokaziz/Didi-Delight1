import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LoyaltyPoints } from '../../types/loyaltyPoints';
import { FontAwesome5 } from '@expo/vector-icons';

interface UserLoyaltyCardProps {
  user: LoyaltyPoints;
  onPress: (user: LoyaltyPoints) => void;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'platinum': return '#E5E4E2';
    default: return '#CD7F32';
  }
};

const UserLoyaltyCard: React.FC<UserLoyaltyCardProps> = ({ user, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(user)}
    >
      <View style={styles.userInfo}>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(user.level) }]}>
          <Text style={styles.levelText}>{user.level && typeof user.level === 'string' ? user.level.charAt(0).toUpperCase() : 'B'}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{user.userName || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user.userEmail || user.userId}</Text>
        </View>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsValue}>{user.points}</Text>
        <Text style={styles.pointsLabel}>points</Text>
      </View>
      <FontAwesome5 name="chevron-right" size={16} color="#999" />
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
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#777',
  },
  pointsContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F04E98',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#777',
  },
});

export default UserLoyaltyCard;
