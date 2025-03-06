import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Button,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Order } from "../types/Order";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getUserOrders ,subscribeToUserOrders } from "../services/orderService"; // Importez la nouvelle fonction

const OrderHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Synchronisation en temps réel
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToUserOrders(
      user.uid,
      (newOrders : Order[]) => {
        setOrders(newOrders);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      },
      (error : Error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [user, fadeAnim]);

  // Filtrer les commandes
  const filterOrders = useCallback((status: string | null) => {
    setSelectedFilter(status);
  }, []);

  const filteredOrders = useMemo(() => {
    return selectedFilter
      ? orders.filter((order) => order.status === selectedFilter)
      : orders;
  }, [orders, selectedFilter]);

  // Afficher les détails d'une commande
  const viewOrderDetails = (orderId: string) => {
    const selectedOrder = orders.find((order) => order.id === orderId);
    if (selectedOrder) {
      Alert.alert(
        `Détails de la commande ${orderId}`,
        `Articles : ${selectedOrder.items.length}\nMéthode de paiement : ${selectedOrder.paymentMethod || "Non spécifiée"}\nAdresse de livraison : ${selectedOrder.shippingAddress || "Non spécifiée"}`,
        [{ text: "OK" }]
      );
    }
  };

  // Icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Livrée":
        return <Ionicons name="checkmark-circle" size={20} color="green" />;
      case "Expédiée":
        return <Ionicons name="time" size={20} color="orange" />;
      default:
        return <Ionicons name="alert-circle" size={20} color="gray" />;
    }
  };

  // Animation d'entrée des éléments
  const renderItem = ({ item, index }: { item: Order; index: number }) => {
    const translateY = new Animated.Value(50);
    const opacity = new Animated.Value(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

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
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Réessayer" onPress={() => setError(null)} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Mes Commandes</Text>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrer par statut :</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === null && styles.selectedFilterButton,
            ]}
            onPress={() => filterOrders(null)}
          >
            <Text style={styles.filterButtonText}>Tous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "En attente" && styles.selectedFilterButton,
            ]}
            onPress={() => filterOrders("En attente")}
          >
            <Text style={styles.filterButtonText}>En attente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "Expédiée" && styles.selectedFilterButton,
            ]}
            onPress={() => filterOrders("Expédiée")}
          >
            <Text style={styles.filterButtonText}>Expédiée</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "Livrée" && styles.selectedFilterButton,
            ]}
            onPress={() => filterOrders("Livrée")}
          >
            <Text style={styles.filterButtonText}>Livrée</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrderText}>Aucune commande trouvée.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id || ""}
          renderItem={renderItem}
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
  filterButton: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
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
  loadingText: { fontSize: 18, color: "#666" },
  noOrderText: { fontSize: 18, color: "#666" },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  statusText: { marginLeft: 8, fontSize: 14 },
  errorText: { color: "red", textAlign: "center", margin: 20 },
});

export default OrderHistoryScreen;