import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { loyaltyPointsService } from '../../services/loyalty/loyaltyPointsService';
import { useAuth } from '../../contexts/AuthContext';
import { LoyaltyPoints } from '../../types/loyaltyPoints';

const LoyaltyPointsManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      if (user) {
        try {
          const points = await loyaltyPointsService.getUserPoints(user.uid);
          if (!points) {
            // Initialiser les points si l'utilisateur n'en a pas
            const newPoints = await loyaltyPointsService.initializeUserPoints(user.uid);
            setLoyaltyData(newPoints);
          } else {
            setLoyaltyData(points);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des points de fidélité:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPoints();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Points de Fidélité</Text>
      <Text style={styles.pointsText}>
        Points actuels : {loyaltyData?.points || 0}
      </Text>
      
      {loyaltyData?.history && loyaltyData.history.length > 0 && (
        <>
          <Text style={styles.subtitle}>Historique des points</Text>
          <FlatList
            data={loyaltyData.history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyText}>
                  {item.type === 'earn' ? '+' : '-'}{item.points} points
                </Text>
                <Text style={styles.historyDescription}>{item.description}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  pointsText: {
    fontSize: 20,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  historyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default LoyaltyPointsManagementScreen;