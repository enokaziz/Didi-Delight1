import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { Order, OrderItem as OrderItemType } from "../types/Order"; // Assurez-vous que OrderItem est défini
import { useAuth } from "../contexts/AuthContext";
import { getOrderById } from "../services/orderService"; // Nouvelle fonction à créer
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const OrderDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) {
        setError("Utilisateur ou ID de commande manquant");
        setLoading(false);
        return;
      }

      try {
        const fetchedOrder = await getOrderById(user.uid, orderId); // Fonction à implémenter
        setOrder(fetchedOrder);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        setError((err as Error).message || "Erreur lors du chargement de la commande");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Livrée": return <Ionicons name="checkmark-circle" size={24} color="green" />;
      case "Expédiée": return <Ionicons name="time" size={24} color="orange" />;
      default: return <Ionicons name="alert-circle" size={24} color="gray" />;
    }
  };

  const viewOrderDetails = (orderId: string) => {
    if (!orderId) {
      Alert.alert("Erreur", "ID de commande manquant");
      return;
    }
    navigation.navigate("OrderDetails", { orderId });
  };
  
  const renderOrderItem = ({ item }: { item: OrderItemType }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>
        {item.quantity} x {item.price} FCFA = {item.quantity * item.price} FCFA
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF4952" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || "Commande introuvable"}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Retour à l'historique des commandes"
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Détails de la commande #{order.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(order.status)}
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <Text style={styles.sectionContent}>
            {format(new Date(order.createdAt), "PPpp", { locale: fr })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles</Text>
          <FlatList
            data={order.items}
            keyExtractor={(item) => item.id || item.name}
            renderItem={renderOrderItem}
            scrollEnabled={false}
          />
          <Text style={styles.totalText}>Total : {order.total} FCFA</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Méthode de paiement</Text>
          <Text style={styles.sectionContent}>{order.paymentMethod || "Non spécifiée"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <Text style={styles.sectionContent}>{order.shippingAddress || "Non spécifiée"}</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  scrollContent: { padding: 15 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backIcon: { marginRight: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  section: { marginBottom: 20, backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#343a40", marginBottom: 10 },
  sectionContent: { fontSize: 16, color: "#495057" },
  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusText: { fontSize: 16, marginLeft: 8, color: "#495057" },
  itemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemName: { fontSize: 16, fontWeight: "500", color: "#212529" },
  itemDetails: { fontSize: 14, color: "#666" },
  totalText: { fontSize: 16, fontWeight: "bold", color: "#212529", marginTop: 10 },
  errorText: { color: "red", textAlign: "center", margin: 20, fontSize: 16 },
  backButton: {
    backgroundColor: "#FF4952",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default OrderDetailsScreen;