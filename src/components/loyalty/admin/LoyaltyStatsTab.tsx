import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { LoyaltyLevel } from '../../../types/loyaltyPoints';
import { FontAwesome5 } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface LoyaltyStatsTabProps {
  stats: {
    totalUsers: number;
    totalPoints: number;
    totalPointsRedeemed: number;
    usersByLevel: Record<LoyaltyLevel, number>;
  } | null;
  loading: boolean;
  onRefresh: () => void;
}

const LoyaltyStatsTab: React.FC<LoyaltyStatsTabProps> = ({
  stats,
  loading,
  onRefresh,
}) => {
  const screenWidth = Dimensions.get('window').width - 32;

  const getLevelColor = (level: LoyaltyLevel) => {
    switch (level) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#CD7F32';
    }
  };

  const getLevelName = (level: LoyaltyLevel) => {
    switch (level) {
      case 'bronze':
        return 'Bronze';
      case 'silver':
        return 'Argent';
      case 'gold':
        return 'Or';
      case 'platinum':
        return 'Platine';
      default:
        return 'Bronze';
    }
  };

  const getPieChartData = () => {
    if (!stats) return [];

    return Object.entries(stats.usersByLevel).map(([level, count]) => ({
      name: getLevelName(level as LoyaltyLevel),
      population: count,
      color: getLevelColor(level as LoyaltyLevel),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F04E98" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={['#F04E98']}
        />
      }
    >
      {stats ? (
        <>
          <View style={styles.statsCardsContainer}>
            <View style={styles.statsCard}>
              <FontAwesome5 name="users" size={24} color="#F04E98" />
              <Text style={styles.statsValue}>{stats.totalUsers}</Text>
              <Text style={styles.statsLabel}>Utilisateurs</Text>
            </View>

            <View style={styles.statsCard}>
              <FontAwesome5 name="coins" size={24} color="#F04E98" />
              <Text style={styles.statsValue}>{stats.totalPoints}</Text>
              <Text style={styles.statsLabel}>Points actifs</Text>
            </View>

            <View style={styles.statsCard}>
              <FontAwesome5 name="exchange-alt" size={24} color="#F04E98" />
              <Text style={styles.statsValue}>{stats.totalPointsRedeemed}</Text>
              <Text style={styles.statsLabel}>Points utilisés</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Répartition des niveaux</Text>
            {getPieChartData().length > 0 ? (
              <PieChart
                data={getPieChartData()}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Aucune donnée disponible</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Détails par niveau</Text>
            {Object.entries(stats.usersByLevel).map(([level, count]) => (
              <View key={level} style={styles.levelDetailRow}>
                <View style={styles.levelNameContainer}>
                  <View
                    style={[
                      styles.levelColorDot,
                      { backgroundColor: getLevelColor(level as LoyaltyLevel) },
                    ]}
                  />
                  <Text style={styles.levelName}>
                    {getLevelName(level as LoyaltyLevel)}
                  </Text>
                </View>
                <Text style={styles.levelCount}>
                  {count} utilisateur{count > 1 ? 's' : ''}
                </Text>
                <Text style={styles.levelPercentage}>
                  {stats.totalUsers > 0
                    ? `${Math.round((count / stats.totalUsers) * 100)}%`
                    : '0%'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Taux d'utilisation</Text>
            <View style={styles.usageRateContainer}>
              <View style={styles.usageRateItem}>
                <Text style={styles.usageRateValue}>
                  {stats.totalPoints + stats.totalPointsRedeemed > 0
                    ? `${Math.round(
                        (stats.totalPointsRedeemed /
                          (stats.totalPoints + stats.totalPointsRedeemed)) *
                          100
                      )}%`
                    : '0%'}
                </Text>
                <Text style={styles.usageRateLabel}>Taux d'utilisation</Text>
              </View>
              <View style={styles.usageRateItem}>
                <Text style={styles.usageRateValue}>
                  {stats.totalUsers > 0
                    ? Math.round(
                        (stats.totalPoints + stats.totalPointsRedeemed) /
                          stats.totalUsers
                      )
                    : 0}
                </Text>
                <Text style={styles.usageRateLabel}>Points par utilisateur</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.noStatsContainer}>
          <FontAwesome5 name="chart-pie" size={50} color="#ddd" />
          <Text style={styles.noStatsText}>
            Aucune statistique disponible
          </Text>
          <Text style={styles.noStatsSubtext}>
            Les statistiques seront disponibles une fois que des utilisateurs auront commencé à accumuler des points
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  noStatsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  noStatsSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
  },
  levelDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  levelNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  levelName: {
    fontSize: 14,
    color: '#333',
  },
  levelCount: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  levelPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  usageRateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageRateItem: {
    alignItems: 'center',
    padding: 8,
  },
  usageRateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F04E98',
  },
  usageRateLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default LoyaltyStatsTab;
