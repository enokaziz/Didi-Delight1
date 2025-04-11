import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LoyaltyLevel } from '../../types/loyaltyPoints';

interface LoyaltyStatsProps {
  stats: {
    totalUsers: number;
    totalPoints: number;
    totalPointsRedeemed: number;
    usersByLevel: Record<LoyaltyLevel, number>;
  };
}

const LoyaltyStatsCard: React.FC<LoyaltyStatsProps> = ({ stats }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistiques du Programme</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="users" size={20} color="#F04E98" />
          </View>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Utilisateurs</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="coins" size={20} color="#F04E98" />
          </View>
          <Text style={styles.statValue}>{stats.totalPoints}</Text>
          <Text style={styles.statLabel}>Points actifs</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="exchange-alt" size={20} color="#F04E98" />
          </View>
          <Text style={styles.statValue}>{stats.totalPointsRedeemed}</Text>
          <Text style={styles.statLabel}>Points utilisés</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>Répartition par niveau</Text>
      
      <View style={styles.levelsContainer}>
        {Object.entries(stats.usersByLevel).map(([level, count]) => (
          <View key={level} style={styles.levelItem}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
              <Text style={styles.levelBadgeText}>{level && typeof level === 'string' ? level.charAt(0).toUpperCase() : 'B'}</Text>
            </View>
            <Text style={styles.levelCount}>{count}</Text>
            <Text style={styles.levelLabel}>{level && typeof level === 'string' ? level.charAt(0).toUpperCase() + level.slice(1) : 'Bronze'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  levelItem: {
    alignItems: 'center',
    flex: 1,
  },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  levelBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  levelCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelLabel: {
    fontSize: 12,
    color: '#777',
  },
});

export default LoyaltyStatsCard;
