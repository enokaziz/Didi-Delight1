import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAdminData } from "../../hooks/useAdminData";
import { useOrderStatistics } from "../../hooks/useOrderStatistics";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AdminStackParamList } from "../../navigation/types";

type AdminNavigation = NavigationProp<AdminStackParamList>;

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigation>();
  const { orders, products, users, loading, error, refresh } = useAdminData();
  const { totalOrders, totalSales, ordersByStatus } = useOrderStatistics();
  const [selectedReport, setSelectedReport] = useState("sales");

  const getReportData = () => {
    switch (selectedReport) {
      case "sales":
        return {
          title: "Rapport des Ventes",
          data: [
            { label: "Total des ventes", value: `${totalSales} FCFA` },
            { label: "Nombre de commandes", value: totalOrders.toString() },
            {
              label: "Commandes en attente",
              value: ordersByStatus["En attente"].toString(),
            },
            {
              label: "Commandes en cours",
              value: ordersByStatus["En cours"].toString(),
            },
            {
              label: "Commandes livrées",
              value: ordersByStatus["Livrée"].toString(),
            },
            {
              label: "Commandes annulées",
              value: ordersByStatus["Annulée"].toString(),
            },
          ],
        };
      case "products":
        // Calculer le produit le plus vendu en fonction des commandes
        const productSales = products.reduce(
          (acc, product) => {
            const productOrders = orders.filter((order) =>
              order.items.some((item) => item.id === product.id)
            );
            acc[product.id] = productOrders.length;
            return acc;
          },
          {} as { [key: string]: number }
        );

        const mostSoldProduct = products.reduce((prev, curr) =>
          (productSales[prev.id] || 0) > (productSales[curr.id] || 0)
            ? prev
            : curr
        );

        // Calculer le revenu total par produit
        const totalRevenue = products.reduce((sum, product) => {
          const productOrders = orders.filter((order) =>
            order.items.some((item) => item.id === product.id)
          );
          const revenue = productOrders.reduce((orderSum, order) => {
            const item = order.items.find((i) => i.id === product.id);
            return orderSum + (item?.quantity || 0) * product.price;
          }, 0);
          return sum + revenue;
        }, 0);

        return {
          title: "Rapport des Produits",
          data: [
            {
              label: "Nombre total de produits",
              value: products.length.toString(),
            },
            {
              label: "Produits en stock",
              value: products.filter((p) => p.quantity > 0).length.toString(),
            },
            {
              label: "Produits épuisés",
              value: products.filter((p) => p.quantity === 0).length.toString(),
            },
            {
              label: "Produit le plus vendu",
              value: mostSoldProduct
                ? `${mostSoldProduct.name} (${productSales[mostSoldProduct.id]} ventes)`
                : "Aucun produit vendu",
            },
            {
              label: "Revenu total des produits",
              value: `${totalRevenue} FCFA`,
            },
            {
              label: "Marge moyenne",
              value: "Non disponible (coût non spécifié)",
            },
          ],
        };
      case "users":
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newUsersThisMonth = users.filter((user) => {
          const userDate =
            user.createdAt instanceof Date
              ? user.createdAt
              : new Date(user.createdAt as string);
          return (
            userDate.getMonth() === currentMonth &&
            userDate.getFullYear() === currentYear
          );
        });

        const activeUsers = users.filter((user) => {
          const lastOrder = orders.find((order) => order.userId === user.id);
          if (!lastOrder) return false;
          const lastOrderDate =
            lastOrder.createdAt instanceof Date
              ? lastOrder.createdAt
              : new Date(lastOrder.createdAt as string);
          return (
            lastOrderDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          );
        });

        const averageValuePerUser = totalSales / users.length;

        const loyalUsers = users.filter((user) => {
          const userOrders = orders.filter((order) => order.userId === user.id);
          return userOrders.length >= 3; // Utilisateurs ayant fait au moins 3 commandes
        });

        const retentionRate = (activeUsers.length / users.length) * 100;

        return {
          title: "Rapport des Utilisateurs",
          data: [
            {
              label: "Nombre total d'utilisateurs",
              value: users.length.toString(),
            },
            {
              label: "Nouveaux utilisateurs ce mois",
              value: newUsersThisMonth.length.toString(),
            },
            {
              label: "Utilisateurs actifs",
              value: activeUsers.length.toString(),
            },
            {
              label: "Valeur moyenne par utilisateur",
              value: `${averageValuePerUser.toFixed(2)} FCFA`,
            },
            {
              label: "Utilisateurs fidèles",
              value: loyalUsers.length.toString(),
            },
            {
              label: "Taux de rétention",
              value: `${retentionRate.toFixed(1)}%`,
            },
          ],
        };
      default:
        return { title: "Rapport des Ventes", data: [] };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPressIn={() => refresh()}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { title, data } = getReportData();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedReport === "sales" && styles.filterButtonSelected,
          ]}
          onPress={() => setSelectedReport("sales")}
        >
          <Text style={styles.filterButtonText}>Ventes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedReport === "products" && styles.filterButtonSelected,
          ]}
          onPress={() => setSelectedReport("products")}
        >
          <Text style={styles.filterButtonText}>Produits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedReport === "users" && styles.filterButtonSelected,
          ]}
          onPress={() => setSelectedReport("users")}
        >
          <Text style={styles.filterButtonText}>Utilisateurs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.reportItem}>
            <Text style={styles.reportLabel}>{item.label}</Text>
            <Text style={styles.reportValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f4e8" },
  header: {
    padding: 24,
    backgroundColor: "#6d4c3d",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  filtersContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    marginTop: 16,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    borderRadius: 25,
    backgroundColor: "#e8c4a2",
    borderWidth: 1,
    borderColor: "#d4a373",
  },
  filterButtonSelected: {
    backgroundColor: "#d4a373",
    borderColor: "#a47148",
  },
  filterButtonText: {
    textAlign: "center",
    fontSize: 14,
    color: "#5c3a21",
    fontWeight: "600",
  },
  reportsContainer: {
    padding: 16,
    marginTop: 8,
  },
  reportItem: {
    backgroundColor: "#fff9f0",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#d4a373",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportLabel: {
    fontSize: 15,
    color: "#6d4c3d",
    flexShrink: 1,
    fontFamily: "Montserrat_500Medium",
  },
  reportValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#a47148",
    fontFamily: "Montserrat_700Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f4e8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f4e8",
  },
  errorText: {
    fontSize: 16,
    color: "#c44536",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Montserrat_500Medium",
  },
  retryButton: {
    backgroundColor: "#d4a373",
    padding: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
});

export default ReportsScreen;
