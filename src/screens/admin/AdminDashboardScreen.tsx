"use client";

import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import {
  useNavigation,
  CommonActions,
  StackActions,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdminData } from "../../hooks/useAdminData";
import type {
  AdminStackParamList,
  RootStackParamList,
} from "../../navigation/types";
import { logout } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import StatusOrdersModal from "../../components/orders/StatusOrdersModal";
import type { OrderStatus } from "../../types/Order";

import { styles } from "./styles/AdminDashboardStyles";

// Typage correct pour la navigation
type AdminDashboardNavigationProp = StackNavigationProp<
  AdminStackParamList,
  "AdminDashboard"
>;

const AdminDashboardPatisserie: React.FC = () => {
  const { orders, products, loading, error, updateOrder } = useAdminData();
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { logout: authLogout } = useAuth(); // Accéder à la fonction logout du contexte d'authentification
  const [fadeAnim] = useState(new Animated.Value(0));

  // États pour gérer le modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );

  useEffect(() => {
    if (!loading && !error) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, error, fadeAnim]);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders]
  );

  const ordersInProgress = useMemo(
    () => orders.filter((order) => order.status === "En cours").length,
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "Livrée").length,
    [orders]
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "En attente").length,
    [orders]
  );

  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === "Annulée").length,
    [orders]
  );

  // Filtrer les commandes en fonction du statut sélectionné
  const filteredOrders = useMemo(() => {
    if (!selectedStatus) return [];
    return orders.filter((order) => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  const mostSoldProducts = useMemo(() => {
    const productFrequency: { [key: string]: number } = {};
    orders.forEach((order) => {
      order.items.forEach((product) => {
        productFrequency[product.id] = (productFrequency[product.id] || 0) + 1;
      });
    });
    return Object.entries(productFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, count]) => ({ productId, count }));
  }, [orders]);

  const handleNavigation = useCallback(
    (screen: keyof AdminStackParamList) => {
      navigation.navigate(screen as any);
    },
    [navigation]
  );

  const handleLogout = useCallback(async () => {
    try {
      // Utiliser la fonction logout du contexte d'authentification
      // qui gère déjà la déconnexion et la mise à jour de l'état
      await authLogout();
      // La redirection se fera automatiquement via le MainNavigator
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la déconnexion. Veuillez réessayer."
      );
    }
  }, [authLogout]);

  const getProductName = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      return product ? product.name : "Nom inconnu";
    },
    [products]
  );

  // Fonction pour ouvrir le modal avec le statut sélectionné
  const handleOpenModal = useCallback((status: OrderStatus) => {
    setSelectedStatus(status);
    setModalVisible(true);
  }, []);

  // Fonction pour fermer le modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Fonction pour gérer le clic sur une commande dans le modal
  const handleOrderPress = useCallback((order: any) => {
    Alert.alert("Détails de la commande", `Commande #${order.id.slice(-6)}`);
  }, []);

  // Fonction pour changer le statut d'une commande
  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        await updateOrder(orderId, { status: newStatus });
        Alert.alert(
          "Succès",
          `La commande a été marquée comme ${newStatus.toLowerCase()}`
        );
      } catch (error) {
        Alert.alert(
          "Erreur",
          "Une erreur s'est produite lors de la mise à jour du statut"
        );
      }
    },
    [updateOrder]
  );

  const renderIcon = (name: string) => {
    switch (name) {
      case "Chats":
        return <FontAwesome5 name="comments" size={22} color="#fff" />;
      case "Produits":
        return <FontAwesome5 name="birthday-cake" size={22} color="#fff" />;
      case "Événements":
        return <FontAwesome5 name="calendar-alt" size={22} color="#fff" />;
      case "Promotions":
        return <FontAwesome5 name="tags" size={22} color="#fff" />;
      case "Inventaire":
        return <FontAwesome5 name="clipboard-list" size={22} color="#fff" />;
      case "Fidélité":
        return <FontAwesome5 name="crown" size={22} color="#fff" />;
      default:
        return <FontAwesome5 name="circle" size={22} color="#fff" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F04E98" />
      <ImageBackground
        source={{ uri: "https://i.imgur.com/JpQpIQN.jpg" }}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.15 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>Bonjour Didi 👋</Text>
                <Text style={styles.title}>Tableau de Bord</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => handleNavigation("AnalyticsScreen")}
              >
                <FontAwesome5 name="chart-bar" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F04E98" />
                <Text style={styles.loadingText}>Préparation en cours...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={40} color="#FF6B6B" />
                <Text style={styles.error}>
                  {error instanceof Error ? error.message : String(error)}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.salesCard}>
                  <View style={styles.salesCardHeader}>
                    <FontAwesome5 name="coins" size={24} color="#F04E98" />
                    <Text style={styles.salesCardTitle}>Ventes Totales</Text>
                  </View>
                  <Text style={styles.salesAmount}>
                    {totalSales.toLocaleString()} FCFA
                  </Text>
                  <View style={styles.cardDecoration}></View>
                </View>

                <Text style={styles.sectionTitle}>
                  <FontAwesome5
                    name="clipboard-check"
                    size={18}
                    color="#F04E98"
                  />{" "}
                  Commandes
                </Text>
                <View style={styles.statsGrid}>
                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleOpenModal("Livrée")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "#006400" },
                      ]}
                    >
                      <FontAwesome5
                        name="check-circle"
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <Text style={styles.statValue}>{completedOrders}</Text>
                    <Text style={styles.statLabel}>Terminées</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleOpenModal("En cours")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "#F6BE00" },
                      ]}
                    >
                      <FontAwesome5
                        name="hourglass-half"
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <Text style={styles.statValue}>{ordersInProgress}</Text>
                    <Text style={styles.statLabel}>En cours</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleOpenModal("En attente")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "#9D7BDE" },
                      ]}
                    >
                      <FontAwesome5 name="clock" size={20} color="#fff" />
                    </View>
                    <Text style={styles.statValue}>{pendingOrders}</Text>
                    <Text style={styles.statLabel}>En attente</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleOpenModal("Annulée")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "#ff0000" },
                      ]}
                    >
                      <FontAwesome5
                        name="times-circle"
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <Text style={styles.statValue}>{cancelledOrders}</Text>
                    <Text style={styles.statLabel}>Annulées</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>
                  <FontAwesome5 name="th-large" size={18} color="#F04E98" />{" "}
                  Gestion
                </Text>

                <View style={styles.menuContainer}>
                  {[
                    "Chats",
                    "Produits",
                    "Événements",
                    "Promotions",
                    "Inventaire",
                    "Fidélité",
                  ].map((item, index) => {
                    const screens: Record<string, keyof AdminStackParamList> = {
                      Chats: "AdminChats",
                      Produits: "ProductManagement",
                      Événements: "EventManagement",
                      Promotions: "PromotionManagement",
                      Inventaire: "InventoryManagement",
                      Fidélité: "LoyaltyPointsManagement",
                    };

                    return (
                      <TouchableOpacity
                        key={item}
                        style={styles.menuItem}
                        onPress={() => handleNavigation(screens[item])}
                      >
                        <View style={styles.menuIconContainer}>
                          {renderIcon(item)}
                        </View>
                        <Text style={styles.menuText}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.productsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.productsSectionTitle}>
                      <FontAwesome5 name="star" size={18} color="#81312F" />{" "}
                      Produits Populaires
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleNavigation("ProductManagement")}
                    >
                      <Text style={styles.viewAllText}>Voir tout</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.productsList}>
                    {mostSoldProducts.map((product, index) => (
                      <TouchableOpacity
                        key={product.productId}
                        style={styles.productItem}
                        onPress={() =>
                          Alert.alert(
                            "Détails du produit",
                            getProductName(product.productId)
                          )
                        }
                      >
                        <View style={styles.productBadge}>
                          <Text style={styles.badgeText}>{index + 1}</Text>
                        </View>
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>
                            {getProductName(product.productId)}
                          </Text>
                          <Text style={styles.productCount}>
                            {product.count} vendus
                          </Text>
                        </View>
                        <FontAwesome5
                          name="chevron-right"
                          size={16}
                          color="#F04E98"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color="#fff" />
              <Text style={styles.logoutText}>Se Déconnecter</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ImageBackground>

      {/* Modal pour afficher les commandes par statut */}
      {selectedStatus && (
        <StatusOrdersModal
          visible={modalVisible}
          onClose={handleCloseModal}
          orders={filteredOrders}
          status={selectedStatus}
          onOrderPress={handleOrderPress}
          onStatusChange={handleStatusChange}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminDashboardPatisserie;
