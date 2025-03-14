"use client"

import type React from "react"
import { useMemo, useCallback, useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { logout } from "services/authService"
import useAdminData from "hooks/useAdminData"
import type { AdminStackParamList } from "navigation/types"

// Type explicite pour le statut des commandes
type OrderStatus = "En attente" | "En cours" | "Livrée" | "Annulée"

// Typage correct pour la navigation
type AdminDashboardNavigationProp = StackNavigationProp<AdminStackParamList, "AdminDashboard">

const AdminDashboardScreen: React.FC = () => {
  const { orders, products, loading, error } = useAdminData()
  const navigation = useNavigation<AdminDashboardNavigationProp>()
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (!loading && !error) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start()
    }
  }, [loading, error, fadeAnim])

  const totalSales = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders])
  const ordersInProgress = useMemo(
    () => orders.filter((order) => order.status === ("En cours" as OrderStatus)).length,
    [orders],
  )
  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === ("Livrée" as OrderStatus)).length,
    [orders],
  )
  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === ("En attente" as OrderStatus)).length,
    [orders],
  )
  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === ("Annulée" as OrderStatus)).length,
    [orders],
  )
  const mostSoldProducts = useMemo(() => {
    const productFrequency: { [key: string]: number } = {}
    orders.forEach((order) => {
      order.items.forEach((product) => {
        productFrequency[product.id] = (productFrequency[product.id] || 0) + 1
      })
    })
    return Object.entries(productFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, count]) => ({ productId, count }))
  }, [orders])

  const handleNavigation = useCallback(
    (screen: keyof AdminStackParamList) => {
      navigation.navigate(screen as any)
    },
    [navigation],
  )

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigation.navigate("AuthScreen")
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error)
      Alert.alert("Erreur", "Une erreur s'est produite lors de la déconnexion. Veuillez réessayer.")
    }
  }, [navigation])

  const getProductName = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId)
      return product ? product.name : "Nom inconnu"
    },
    [products],
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Bonjour 👋</Text>
              <Text style={styles.title}>Tableau de Bord</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={40} color="#FF6B6B" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.salesCard}>
                <View style={styles.salesCardHeader}>
                  <Ionicons name="trending-up" size={24} color="#FF6B6B" />
                  <Text style={styles.salesCardTitle}>Ventes Totales</Text>
                </View>
                <Text style={styles.salesAmount}>{totalSales.toLocaleString()} FCFA</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: "#4ECDC4" }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.statValue}>{completedOrders}</Text>
                  <Text style={styles.statLabel}>Terminées</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: "#FFD166" }]}>
                  <Ionicons name="time" size={24} color="#fff" />
                  <Text style={styles.statValue}>{ordersInProgress}</Text>
                  <Text style={styles.statLabel}>En cours</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: "#118AB2" }]}>
                  <Ionicons name="hourglass" size={24} color="#fff" />
                  <Text style={styles.statValue}>{pendingOrders}</Text>
                  <Text style={styles.statLabel}>En attente</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: "#FF6B6B" }]}>
                  <Ionicons name="close-circle" size={24} color="#fff" />
                  <Text style={styles.statValue}>{cancelledOrders}</Text>
                  <Text style={styles.statLabel}>Annulées</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Gestion</Text>

              <View style={styles.menuContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.menuScrollContent}
                >
                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("AdminChats")}>
                    <View style={[styles.menuIconContainer, { backgroundColor: "#FF6B6B" }]}>
                      <Ionicons name="chatbubbles" size={22} color="#fff" />
                    </View>
                    <Text style={styles.menuText}>Chats</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("ProductManagement")}>
                    <View style={[styles.menuIconContainer, { backgroundColor: "#4ECDC4" }]}>
                      <Ionicons name="cart" size={22} color="#fff" />
                    </View>
                    <Text style={styles.menuText}>Produits</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("EventManagement")}>
                    <View style={[styles.menuIconContainer, { backgroundColor: "#FFD166" }]}>
                      <Ionicons name="calendar" size={22} color="#fff" />
                    </View>
                    <Text style={styles.menuText}>Événements</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("PromotionManagement")}>
                    <View style={[styles.menuIconContainer, { backgroundColor: "#118AB2" }]}>
                      <Ionicons name="pricetags" size={22} color="#fff" />
                    </View>
                    <Text style={styles.menuText}>Promotions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("InventoryManagement")}>
                    <View style={[styles.menuIconContainer, { backgroundColor: "#073B4C" }]}>
                      <Ionicons name="clipboard" size={22} color="#fff" />
                    </View>
                    <Text style={styles.menuText}>Inventaire</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("LoyaltyPointsManagement")}>
                    <View style={[styles.menuIconContainer, { backgroundColor: "#06D6A0" }]}>
                      <Ionicons name="star" size={22} color="#fff" />
                    </View>
                    <Text style={styles.menuText}>Fidélité</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <View style={styles.productsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Produits Populaires</Text>
                  <TouchableOpacity onPress={() => handleNavigation("ProductManagement")}>
                    <Text style={styles.viewAllText}>Voir tout</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.productsList}>
                  {mostSoldProducts.map((product, index) => (
                    <View key={product.productId} style={styles.productItem}>
                      <View style={[styles.productBadge, { backgroundColor: index === 0 ? "#FFD166" : "#f0f0f0" }]}>
                        <Text style={[styles.badgeText, { color: index === 0 ? "#fff" : "#333" }]}>{index + 1}</Text>
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{getProductName(product.productId)}</Text>
                        <Text style={styles.productCount}>{product.count} vendus</Text>
                      </View>
                      <TouchableOpacity style={styles.productAction}>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={18} color="#fff" />
            <Text style={styles.logoutText}>Se Déconnecter</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: "#6c757d",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6c757d",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
  },
  error: {
    color: "#FF6B6B",
    marginTop: 10,
    textAlign: "center",
  },
  salesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  salesCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  salesCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginLeft: 8,
  },
  salesAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212529",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuScrollContent: {
    paddingRight: 20,
  },
  menuItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  productsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  productsList: {},
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: "#6c757d",
  },
  productAction: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
})

export default AdminDashboardScreen

