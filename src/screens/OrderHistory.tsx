import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import {
  Text,
  Appbar,
  Card,
  Chip,
  Divider,
  ActivityIndicator,
  useTheme,
  Button,
  Searchbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";

// Types pour les commandes
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type Order = {
  id: string;
  date: Date;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  address: string;
  paymentMethod: string;
  trackingNumber?: string;
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
  const navigation = useNavigation();
  const { user } = useAuth();
  const theme = useTheme();

  // Fonction pour récupérer les commandes depuis Firestore
  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const ordersList: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersList.push({
          id: doc.id,
          date: data.date.toDate(),
          status: data.status,
          total: data.total,
          items: data.items,
          address: data.address,
          paymentMethod: data.paymentMethod,
          trackingNumber: data.trackingNumber,
        });
      });

      setOrders(ordersList);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Filtrer les commandes par statut et recherche
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    const matchesSearch = searchQuery
      ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true;
    return matchesStatus && matchesSearch;
  });

  // Obtenir la couleur en fonction du statut de la commande
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "#FFC107"; // Jaune
      case "processing":
        return "#2196F3"; // Bleu
      case "shipped":
        return "#9C27B0"; // Violet
      case "delivered":
        return "#4CAF50"; // Vert
      case "cancelled":
        return "#F44336"; // Rouge
      default:
        return "#757575"; // Gris
    }
  };

  // Traduire le statut en français
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "processing":
        return "En traitement";
      case "shipped":
        return "Expédiée";
      case "delivered":
        return "Livrée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  // Formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Rendu d'un élément de commande
  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Commande #{item.id.slice(-6)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          </View>
          <Chip
            mode="outlined"
            style={[
              styles.statusChip,
              { borderColor: getStatusColor(item.status) },
            ]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderItems}>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={{ uri: orderItem.imageUrl }}
                style={styles.itemImage}
                defaultSource={require("../assets/icons/splash-icon.png")}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{orderItem.name}</Text>
                <Text style={styles.itemPrice}>
                  {orderItem.price} FCFA × {orderItem.quantity}
                </Text>
              </View>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} autres articles
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{item.total} FCFA</Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            style={styles.detailsButton}
            onPress={() => {
              // Navigation vers les détails de la commande
              // navigation.navigate('OrderDetails', { orderId: item.id });
              console.log("Voir les détails de la commande", item.id);
            }}
          >
            Détails
          </Button>
          {item.status === "delivered" && (
            <Button
              mode="outlined"
              style={styles.reorderButton}
              onPress={() => {
                // Logique pour commander à nouveau
                console.log("Commander à nouveau", item.id);
              }}
            >
              Commander à nouveau
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  // Rendu de l'en-tête avec les filtres
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Searchbar
        placeholder="Rechercher une commande"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <Text style={styles.filterLabel}>Filtrer par statut</Text>
      <View style={styles.filterChips}>
        <TouchableOpacity
          onPress={() => setFilterStatus(null)}
          style={[styles.filterChip, !filterStatus && styles.activeFilterChip]}
        >
          <Text
            style={[
              styles.filterChipText,
              !filterStatus && styles.activeFilterChipText,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {(
          [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ] as OrderStatus[]
        ).map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilterStatus(status)}
            style={[
              styles.filterChip,
              filterStatus === status && styles.activeFilterChip,
              { borderColor: getStatusColor(status) },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === status && styles.activeFilterChipText,
                {
                  color:
                    filterStatus === status ? "#fff" : getStatusColor(status),
                },
              ]}
            >
              {getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Rendu de l'état vide
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../assets/icons/splash-icon.png")}
        style={styles.emptyImage}
        defaultSource={require("../assets/icons/splash-icon.png")}
      />
      <Text style={styles.emptyTitle}>Aucune commande trouvée</Text>
      <Text style={styles.emptyText}>
        {searchQuery || filterStatus
          ? "Aucune commande ne correspond à vos critères de recherche."
          : "Vous n'avez pas encore passé de commande."}
      </Text>
      {(searchQuery || filterStatus) && (
        <Button
          mode="contained"
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery("");
            setFilterStatus(null);
          }}
        >
          Réinitialiser les filtres
        </Button>
      )}
      <Button
        mode="contained"
        style={styles.shopButton}
        onPress={() => navigation.navigate("ClientApp" as never)}
      >
        Parcourir les produits
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Historique des commandes" />
      </Appbar.Header>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: "#f0f0f0",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderColor: "#757575",
  },
  activeFilterChip: {
    backgroundColor: "#FF4952",
    borderColor: "#FF4952",
  },
  filterChipText: {
    fontSize: 14,
  },
  activeFilterChipText: {
    color: "#fff",
    fontWeight: "500",
  },
  listContainer: {
    padding: 8,
    paddingBottom: 24,
  },
  orderCard: {
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  moreItems: {
    fontSize: 14,
    color: "#757575",
    fontStyle: "italic",
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4952",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsButton: {
    flex: 1,
    marginRight: 8,
  },
  reorderButton: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: 400,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 24,
  },
  resetButton: {
    marginBottom: 16,
  },
  shopButton: {
    backgroundColor: "#FF4952",
  },
});

export default OrderHistory;
