// src/screens/admin/OrderDetailsScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ConfettiCannon from "react-native-confetti-cannon";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";
import type { AdminStackParamList } from "../../navigation/types";
import type { Order, OrderStatus } from "../../types/Order";

const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const route = useRoute<RouteProp<AdminStackParamList, 'OrderDetails'>>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { width, height } = Dimensions.get("window");
  let timeoutId: ReturnType<typeof setTimeout>;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderId = route.params?.orderId;
        if (!orderId) {
          console.error('ID de commande manquant');
          navigation.goBack();
          return;
        }
        
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          const orderData = orderDoc.data() as Order;
          setOrder({ ...orderData, id: orderDoc.id });

          // Vérifier si la commande vient d'être livrée
          if (orderData.status === "Livrée" && !showConfetti) {
            setShowConfetti(true);
          }
        } else {
          console.error('Commande non trouvée');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la commande:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
      } finally {
        setLoading(false);

        // Animation d'entrée
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    fetchOrderDetails();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [route.params?.orderId, navigation]);

  useEffect(() => {
    if (showConfetti) {
      // Attendre que le composant soit monté
      timeoutId = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // Durée approximative de l'animation des confettis
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showConfetti]);

  const getStatusColor = (status: OrderStatus) => {
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "En attente":
        return "time-outline";
      case "En cours":
        return "bicycle-outline";
      case "Livrée":
        return "checkmark-circle-outline";
      case "Annulée":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Date inconnue";

    try {
      // Si c'est un objet Firestore Timestamp
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        return format(timestamp.toDate(), "PPpp", { locale: fr });
      }
      // Si c'est une chaîne ISO
      if (typeof timestamp === "string") {
        return format(new Date(timestamp), "PPpp", { locale: fr });
      }
      // Si c'est déjà un objet Date
      if (timestamp instanceof Date) {
        return format(timestamp, "PPpp", { locale: fr });
      }
      return "Date inconnue";
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "Date inconnue";
    }
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setUpdating(true);

      const orderRef = doc(db, "orders", order.id);
      const now = Timestamp.now();

      // Mettre à jour le statut et l'historique
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: now,
        history: [
          ...(order.history || []),
          {
            status: newStatus,
            timestamp: now,
            note: `Statut mis à jour par l'administrateur`,
          },
        ],
      });

      // Mettre à jour l'état local
      setOrder({
        ...order,
        status: newStatus,
        updatedAt: now,
        history: [
          ...(order.history || []),
          {
            status: newStatus,
            timestamp: now,
            note: `Statut mis à jour par l'administrateur`,
          },
        ],
      });

      // Afficher le confetti si la commande est livrée
      if (newStatus === "Livrée") {
        setShowConfetti(true);
      }

      Alert.alert("Succès", `La commande a été marquée comme ${newStatus}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour le statut de la commande"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCallCustomer = () => {
    if (!order?.userPhone) {
      Alert.alert(
        "Information manquante",
        "Numéro de téléphone du client non disponible"
      );
      return;
    }

    Linking.openURL(`tel:${order.userPhone}`);
  };

  const handleShareOrder = async () => {
    if (!order) return;

    try {
      const message =
        `Détails de la commande #${order.id.slice(-6)}\n` +
        `Client: ${order.userName}\n` +
        `Statut: ${order.status}\n` +
        `Montant: ${order.totalAmount?.toLocaleString() || 0} FCFA\n` +
        `Date: ${formatDate(order.createdAt)}`;

      await Share.share({
        message,
        title: `Commande #${order.id.slice(-6)}`,
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const calculateTotal = () => {
    if (!order?.items) return 0;

    return order.items.reduce((total, item) => {
      return total + item.price * (item.quantity || 1);
    }, 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Commande non trouvée</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: height }}
          autoStart={true}
          fadeOut={true}
          colors={["#FF69B4", "#7A288A", "#FFFFFF"]}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.title}>Commande #{order.id.slice(-6)}</Text>
        <TouchableOpacity onPress={handleShareOrder} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons
              name={getStatusIcon(order.status)}
              size={32}
              color={getStatusColor(order.status)}
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Statut</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>

          {order.status !== "Livrée" && order.status !== "Annulée" && (
            <View style={styles.statusActions}>
              {order.status === "En attente" && (
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: getStatusColor("En cours") },
                  ]}
                  onPress={() => updateOrderStatus("En cours")}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="bicycle"
                        size={18}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.statusButtonText}>
                        Marquer en cours
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {order.status === "En cours" && (
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: getStatusColor("Livrée") },
                  ]}
                  onPress={() => updateOrderStatus("Livrée")}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.statusButtonText}>
                        Marquer comme livrée
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: getStatusColor("Annulée") },
                ]}
                onPress={() => updateOrderStatus("Annulée")}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.statusButtonText}>
                      Annuler la commande
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Client</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>
                {order.userName || "Non spécifié"}
              </Text>
            </View>

            {order.userPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Téléphone:</Text>
                <View style={styles.phoneContainer}>
                  <Text style={styles.value}>{order.userPhone}</Text>
                  <TouchableOpacity
                    onPress={handleCallCustomer}
                    style={styles.callButton}
                  >
                    <Ionicons name="call" size={18} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.deliveryAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Adresse:</Text>
                <Text style={styles.value}>{order.deliveryAddress}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles Commandés</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity || 1}</Text>
                </View>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString()} FCFA
                  </Text>
                  <Text style={styles.itemTotal}>
                    {(item.price * (item.quantity || 1)).toLocaleString()} FCFA
                  </Text>
                </View>
                {item.specialInstructions && (
                  <Text style={styles.specialInstructions}>
                    Note: {item.specialInstructions}
                  </Text>
                )}
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {(order.totalAmount || calculateTotal()).toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique</Text>
          <View style={styles.historyCard}>
            {order.history && order.history.length > 0 ? (
              order.history.map((entry, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyIconContainer}>
                    <View
                      style={[
                        styles.historyIcon,
                        { backgroundColor: getStatusColor(entry.status) },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(entry.status)}
                        size={16}
                        color="#fff"
                      />
                    </View>
                    {order?.history && index < order.history.length - 1 && (
                      <View style={styles.historyLine} />
                    )}
                  </View>
                  <View style={styles.historyContent}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyStatus}>{entry.status}</Text>
                      <Text style={styles.historyTime}>
                        {formatDate(entry.timestamp)}
                      </Text>
                    </View>
                    {entry.note && (
                      <Text style={styles.historyNote}>{entry.note}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Aucun historique disponible</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusActions: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 16,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
  },
  value: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  callButton: {
    marginLeft: 8,
    padding: 4,
  },
  itemsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    marginLeft: 8,
  },
  itemPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#6c757d",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  specialInstructions: {
    fontSize: 12,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  historyIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  historyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  historyLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 4,
    marginLeft: 11,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  historyTime: {
    fontSize: 12,
    color: "#6c757d",
  },
  historyNote: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
  },
  emptyText: {
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default OrderDetailsScreen;
