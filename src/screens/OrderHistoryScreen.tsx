import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  TouchableOpacity,
  ScrollView,
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Order } from "../types/Order";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { subscribeToUserOrders } from "../services/orderService";

const ORDER_STATUSES = {
  PENDING: "En attente",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
} as const;

const FilterBar = ({ selectedFilter, onFilterChange }: { selectedFilter: string | null; onFilterChange: (status: string | null) => void }) => {
  const filters = [null, ORDER_STATUSES.PENDING, ORDER_STATUSES.SHIPPED, ORDER_STATUSES.DELIVERED];
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filtrer par statut :</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter || "Tous"}
            style={[styles.filterButton, selectedFilter === filter && styles.selectedFilterButton]}
            onPress={() => onFilterChange(filter)}
            accessibilityLabel={`Filtrer par ${filter || "tous"}`}
          >
            <Text style={[styles.filterButtonText, selectedFilter === filter && { color: "#fff" }]}>
              {filter || "Tous"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const OrderItem = React.memo(({ item }: { item: Order }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.DELIVERED: return <Ionicons name="checkmark-circle" size={20} color="green" />;
      case ORDER_STATUSES.SHIPPED: return <Ionicons name="time" size={20} color="orange" />;
      default: return <Ionicons name="alert-circle" size={20} color="gray" />;
    }
  };

  function viewOrderDetails(arg0: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <View style={styles.orderItem}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <Text>Montant : {item.total} FCFA</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text>Date : {format(new Date(item.createdAt), "PPpp", { locale: fr })}</Text>
        <TouchableOpacity onPress={() => viewOrderDetails(item.id || "")}>
          <Text style={styles.detailsButton}>Voir Détails</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const OrderHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToUserOrders(
      user.uid,
      (newOrders: Order[]) => {
        setOrders(newOrders);
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
      },
      (error: Error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, fadeAnim]);

  const filterOrders = useCallback((status: string | null) => {
    setSelectedFilter(status);
  }, []);

  const filteredOrders = useMemo(() => {
    return selectedFilter ? orders.filter((order) => order.status === selectedFilter) : orders;
  }, [orders, selectedFilter]);

  const viewOrderDetails = (orderId: string) => {
    if (!orderId) {
      Alert.alert("Erreur", "ID de commande manquant");
      return;
    }
    const selectedOrder = orders.find((order) => order.id === orderId);
    if (selectedOrder) {
      Alert.alert(
        `Détails de la commande ${orderId}`,
        `Articles : ${selectedOrder.items.length}\nMéthode de paiement : ${selectedOrder.paymentMethod || "Non spécifiée"}\nAdresse de livraison : ${selectedOrder.shippingAddress || "Non spécifiée"}`,
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF4952" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Mes Commandes</Text>
      <FilterBar selectedFilter={selectedFilter} onFilterChange={filterOrders} />
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrderText}>Aucune commande trouvée.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id || ""}
          renderItem={({ item }) => <OrderItem item={item} />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f0f0" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15, color: "#333" },
  filterContainer: { marginBottom: 15 },
  filterLabel: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  filterButton: { backgroundColor: "#e0e0e0", padding: 10, borderRadius: 5, marginRight: 10 },
  filterButtonText: { color: "#333" },
  selectedFilterButton: { backgroundColor: "#ff8444" },
  detailsButton: { color: "#007BFF", marginTop: 5 },
  orderItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderId: { fontWeight: "bold", fontSize: 16, color: "#077BFF" },
  noOrderText: { fontSize: 18, color: "#666" },
  statusContainer: { flexDirection: "row", alignItems: "center", marginVertical: 5 },
  statusText: { marginLeft: 8, fontSize: 14 },
  errorText: { color: "red", textAlign: "center", margin: 20 },
});

export default OrderHistoryScreen;