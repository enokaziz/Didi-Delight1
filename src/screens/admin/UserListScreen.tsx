import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useAdminData } from "../../hooks/useAdminData";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AdminStackParamList } from "../../navigation/types";
import { User } from "../../types/User";

type AdminNavigation = NavigationProp<AdminStackParamList>;

const UserListScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigation>();
  const { users, loading, error, refresh } = useAdminData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh().finally(() => setRefreshing(false));
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      style={styles.userItem}
      onPress={() => navigation.navigate("UserDetails", { userId: item.id })}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        <Text style={styles.userOrders}>
          Commandes: {item.ordersCount || 0}
        </Text>
      </View>
      <View style={styles.userStats}>
        <Text style={styles.statValue}>{item.totalSpent || 0} FCFA</Text>
        <Text style={styles.statLabel}>Total dépensé</Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error.message}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {users.map((user) => (
        <View key={user.id}>{renderUserItem({ item: user })}</View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  userOrders: {
    fontSize: 14,
    color: "#666",
  },
  userStats: {
    alignItems: "flex-end",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UserListScreen;
