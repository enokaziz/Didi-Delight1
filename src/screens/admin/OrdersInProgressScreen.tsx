import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { useAdminData } from "../../hooks/useAdminData";
import { OrderStatus } from "../../types/Order";
import OrderListContainer from "../../components/admin/OrderListContainer";

const OrdersInProgressScreen: React.FC = () => {
  const { orders, loading, error, refresh } = useAdminData();

  React.useEffect(() => {
    refresh({ status: "En cours" });
  }, [refresh]);

  const handleFilterOrders = useCallback(
    async (filters?: { status?: OrderStatus }) => {
      console.log(filters);
      await refresh(filters);
    },
    [refresh]
  );

  const handleFilterPress = useCallback(
    (event?: GestureResponderEvent) => {
      // Modifiez la signature pour accepter un GestureResponderEvent optionnel
      handleFilterOrders({ status: "En cours" });
    },
    [handleFilterOrders]
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={(event) => refresh()}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Commandes en cours</Text>
      </View>

      <OrderListContainer orders={orders} statusFilter="En cours" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filterButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
});

export default OrdersInProgressScreen;
