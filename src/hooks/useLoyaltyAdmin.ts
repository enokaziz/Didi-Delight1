import { useState, useEffect, useCallback } from 'react';
import { loyaltyPointsService } from '../services/loyalty/loyaltyPointsService';
import { LoyaltyPoints, LoyaltyReward, LoyaltySettings, LoyaltyLevel } from '../types/loyaltyPoints';
import { Alert } from 'react-native';

export const useLoyaltyAdmin = () => {
  // États
  const [users, setUsers] = useState<LoyaltyPoints[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalPoints: number;
    totalPointsRedeemed: number;
    usersByLevel: Record<LoyaltyLevel, number>;
  } | null>(null);
  const [loading, setLoading] = useState({
    users: true,
    rewards: true,
    settings: true,
    stats: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<LoyaltyPoints | null>(null);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);

  // Chargement des données
  const loadUsers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const usersData = await loyaltyPointsService.getAllUsersPoints();
      setUsers(usersData);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  const loadRewards = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, rewards: true }));
      const rewardsData = await loyaltyPointsService.getAllRewards();
      setRewards(rewardsData);
    } catch (err) {
      setError('Erreur lors du chargement des récompenses');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, rewards: false }));
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, settings: true }));
      const settingsData = await loyaltyPointsService.getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const statsData = await loyaltyPointsService.getLoyaltyStats();
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadUsers();
    loadRewards();
    loadSettings();
    loadStats();
  }, [loadUsers, loadRewards, loadSettings, loadStats]);

  // Fonctions de gestion des points
  const addPointsToUser = useCallback(async (userId: string, points: number, description: string) => {
    try {
      await loyaltyPointsService.addPoints(userId, points, description, 'manual');
      loadUsers(); // Recharger les utilisateurs après modification
      loadStats(); // Mettre à jour les statistiques
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d\'ajouter les points');
      return false;
    }
  }, [loadUsers, loadStats]);

  // Fonctions de gestion des récompenses
  const createReward = useCallback(async (reward: Omit<LoyaltyReward, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await loyaltyPointsService.createReward(reward);
      loadRewards(); // Recharger les récompenses après création
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de créer la récompense');
      return false;
    }
  }, [loadRewards]);

  const updateReward = useCallback(async (rewardId: string, updates: Partial<LoyaltyReward>) => {
    try {
      await loyaltyPointsService.updateReward(rewardId, updates);
      loadRewards(); // Recharger les récompenses après modification
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de mettre à jour la récompense');
      return false;
    }
  }, [loadRewards]);

  const deleteReward = useCallback(async (rewardId: string) => {
    try {
      await loyaltyPointsService.deleteReward(rewardId);
      loadRewards(); // Recharger les récompenses après suppression
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de supprimer la récompense');
      return false;
    }
  }, [loadRewards]);

  // Fonctions de gestion des paramètres
  const updateLoyaltySettings = useCallback(async (updates: Partial<LoyaltySettings>) => {
    try {
      await loyaltyPointsService.updateSettings(updates);
      loadSettings(); // Recharger les paramètres après modification
      return true;
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres');
      return false;
    }
  }, [loadSettings]);

  return {
    // Données
    users,
    rewards,
    settings,
    stats,
    loading,
    error,
    selectedUser,
    selectedReward,
    
    // Fonctions de sélection
    setSelectedUser,
    setSelectedReward,
    
    // Fonctions de rechargement
    loadUsers,
    loadRewards,
    loadSettings,
    loadStats,
    
    // Fonctions de gestion des points
    addPointsToUser,
    
    // Fonctions de gestion des récompenses
    createReward,
    updateReward,
    deleteReward,
    
    // Fonctions de gestion des paramètres
    updateLoyaltySettings,
  };
};
