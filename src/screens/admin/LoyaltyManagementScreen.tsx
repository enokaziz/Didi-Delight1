import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useLoyaltyAdmin } from "../../hooks/useLoyaltyAdmin";
import LoyaltyUsersTab from "../../components/loyalty/admin/LoyaltyUsersTab";
import LoyaltyRewardsTab from "../../components/loyalty/admin/LoyaltyRewardsTab";
import LoyaltyStatsTab from "../../components/loyalty/admin/LoyaltyStatsTab";
import LoyaltySettingsTab from "../../components/loyalty/admin/LoyaltySettingsTab";
import UserPointsModal from "../../components/loyalty/admin/UserPointsModal";
import RewardFormModal from "../../components/loyalty/admin/RewardFormModal";
import { LoyaltyPoints, LoyaltyReward } from "../../types/loyaltyPoints";
import { Header } from "../../components/common/Header";

const Tab = createMaterialTopTabNavigator();

const LoyaltyManagementScreen: React.FC = () => {
  const {
    users,
    rewards,
    settings,
    stats,
    loading,
    error,
    loadUsers,
    loadRewards,
    loadSettings,
    loadStats,
    addPointsToUser,
    createReward,
    updateReward,
    deleteReward,
    updateLoyaltySettings,
  } = useLoyaltyAdmin();

  // États pour les modales
  const [selectedUser, setSelectedUser] = useState<LoyaltyPoints | null>(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(
    null
  );
  const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);

  // Gestionnaires pour les modales
  const handleOpenUserModal = (user: LoyaltyPoints) => {
    setSelectedUser(user);
    setIsUserModalVisible(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalVisible(false);
    setSelectedUser(null);
  };

  const handleOpenRewardModal = (reward?: LoyaltyReward) => {
    setSelectedReward(reward || null);
    setIsRewardModalVisible(true);
  };

  const handleCloseRewardModal = () => {
    setIsRewardModalVisible(false);
    setSelectedReward(null);
  };

  // Gestionnaires pour les actions
  const handleAddPoints = async (
    userId: string,
    points: number,
    description: string
  ) => {
    const success = await addPointsToUser(userId, points, description);
    if (success) {
      handleCloseUserModal();
    }
    return success;
  };

  const handleSaveReward = async (
    reward: Omit<LoyaltyReward, "id" | "createdAt" | "updatedAt">
  ) => {
    let success = false;

    if (selectedReward) {
      // Mise à jour d'une récompense existante
      success = await updateReward(selectedReward.id, reward);
    } else {
      // Création d'une nouvelle récompense
      success = await createReward(reward);
    }

    if (success) {
      handleCloseRewardModal();
    }

    return success;
  };

  const handleDeleteReward = async (rewardId: string) => {
    const success = await deleteReward(rewardId);
    if (success) {
      handleCloseRewardModal();
    }
    return success;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Gestion de la Fidélité" showBackButton />

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#F04E98",
          tabBarInactiveTintColor: "#666",
          tabBarIndicatorStyle: { backgroundColor: "#F04E98" },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: "#fff" },
        }}
      >
        <Tab.Screen name="Utilisateurs">
          {() => (
            <LoyaltyUsersTab
              users={users}
              loading={loading.users}
              onRefresh={loadUsers}
              onSelectUser={handleOpenUserModal}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Récompenses">
          {() => (
            <LoyaltyRewardsTab
              rewards={rewards}
              loading={loading.rewards}
              onRefresh={loadRewards}
              onAddReward={() => handleOpenRewardModal()}
              onEditReward={handleOpenRewardModal}
              onDeleteReward={handleDeleteReward}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Statistiques">
          {() => (
            <LoyaltyStatsTab
              stats={stats}
              loading={loading.stats}
              onRefresh={loadStats}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Paramètres">
          {() => (
            <LoyaltySettingsTab
              settings={settings}
              loading={loading.settings}
              onRefresh={loadSettings}
              onSaveSettings={updateLoyaltySettings}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Modales */}
      <UserPointsModal
        visible={isUserModalVisible}
        user={selectedUser}
        onClose={handleCloseUserModal}
        onAddPoints={handleAddPoints}
      />

      <RewardFormModal
        visible={isRewardModalVisible}
        reward={selectedReward}
        onClose={handleCloseRewardModal}
        onSave={handleSaveReward}
        onDelete={
          selectedReward
            ? () => handleDeleteReward(selectedReward.id)
            : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
});

export default LoyaltyManagementScreen;
