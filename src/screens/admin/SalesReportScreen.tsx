import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAdminData } from "../../hooks/useAdminData";
import { useOrderStatistics } from "../../hooks/useOrderStatistics";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Order, OrderStatus } from "../../types/Order";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationProp } from "@react-navigation/native";
import { AdminStackParamList } from "navigation/types";
import { getStatusColor, formatOrderTime } from "../../utils/orderUtils";

type AdminNavigation = NavigationProp<AdminStackParamList>;

// Fonction utilitaire pour la conversion sécurisée des dates
const safeToDate = (dateLike: unknown): Date => {
  if (dateLike instanceof Date) return dateLike;
  if (typeof dateLike === "string") return new Date(dateLike);
  if (typeof dateLike === "number") return new Date(dateLike);
  if (dateLike && typeof (dateLike as any)?.toDate === "function")
    return (dateLike as any).toDate();
  if (dateLike && typeof (dateLike as any)?.seconds === "number")
    return new Date((dateLike as any).seconds * 1000);
  return new Date(); // Fallback à la date actuelle
};

const SalesReportScreen: React.FC = () => {
  const {
    orders,
    loading,
    error,
    refresh: refreshData,
    filterOrders,
  } = useAdminData();
  const { totalOrders, totalSales, ordersByStatus } = useOrderStatistics();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "En attente":
        return "#FFD166";
      case "En cours":
        return "#118AB2";
      case "Livrée":
        return "#4ECDC4";
      case "Annulée":
        return "#FF6B6B";
      default:
        return "#6c757d";
    }
  };

  const getFilteredOrders = useCallback(() => {
    return filterOrders(orders, {
      status:
        selectedStatus === "all" ? undefined : (selectedStatus as OrderStatus),
      date: selectedDate,
    });
  }, [orders, selectedStatus, selectedDate, filterOrders]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>Commande #{item.id}</Text>
        <Text style={styles.orderDate}>{formatOrderTime(item.createdAt)}</Text>
        <Text style={styles.userName}>Client: {item.userName}</Text>
        <Text style={styles.orderAmount}>Montant: {item.totalAmount} FCFA</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const refresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

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
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Rapport des ventes</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total des commandes</Text>
            <Text style={styles.statValue}>{totalOrders}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total des ventes</Text>
            <Text style={styles.statValue}>{totalSales} FCFA</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Statut:</Text>
          <View style={styles.statusFilters}>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  selectedStatus === status && styles.selectedStatusButton,
                ]}
                onPress={() => setSelectedStatus(status as OrderStatus | "all")}
              >
                <Text
                  style={[
                    styles.statusText,
                    selectedStatus === status && styles.selectedStatusText,
                  ]}
                >
                  {status === "all" ? "Tous" : status}
                </Text>
                <Text style={styles.statusCount}>({count})</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Date:</Text>
          <TouchableOpacity
            style={styles.dateFilter}
            onPress={() => {
              // Ouvrir le sélecteur de date
            }}
          >
            <Text style={styles.dateText}>
              {format(selectedDate, "dd/MM/yyyy", { locale: fr })}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.ordersContainer}>
        {filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Commande #{order.id}</Text>
              <Text style={styles.orderDate}>
                {formatOrderTime(order.createdAt)}
              </Text>
              <Text style={styles.userName}>Client: {order.userName}</Text>
              <Text style={styles.orderAmount}>
                Montant: {order.totalAmount} FCFA
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filtersContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  filterItem: {
    flex: 1,
    marginRight: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedStatusButton: {
    backgroundColor: "#4ECDC4",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  selectedStatusText: {
    color: "#fff",
  },
  statusCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  dateFilter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  ordersContainer: {
    padding: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userName: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  orderAmount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 16,
    alignItems: "center",
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
});

export default SalesReportScreen;
