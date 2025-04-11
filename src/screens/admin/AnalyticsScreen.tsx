import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { collection, query, getDocs, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

// Définir les interfaces pour les données
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
}

interface Order {
  id: string;
  createdAt: Timestamp;
  totalAmount: number;
  items: OrderItem[];
  status: "Livrée" | "En attente" | "En cours" | "Annulée";
}

interface ProductStat {
  id: string;
  count: number;
  name: string;
}

interface CategoryStat {
  name: string;
  count: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week"); // "week", "month", "year"
  const [salesData, setSalesData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });
  const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculer la date de début en fonction de la période
      const startDate = new Date();
      if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === "year") {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      // Récupérer les commandes
      const ordersQuery = query(
        collection(db, "orders"),
        where("createdAt", ">=", startDate),
        orderBy("createdAt", "asc")
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      // Préparer les données pour le graphique des ventes
      const salesByDate: Record<string, number> = {};
      const productFrequency: Record<string, { count: number; name: string }> = {};
      const categoryFrequency: Record<string, number> = {};
      let totalOrders = 0;
      let completedOrders = 0;
      let pendingOrders = 0;
      let inProgressOrders = 0;
      let cancelledOrders = 0;

      orders.forEach((order) => {
        // Formater la date selon la période
        let dateKey = "";
        const date = order.createdAt.toDate();
        if (period === "week") {
          dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        } else if (period === "month") {
          dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        } else if (period === "year") {
          dateKey = `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`;
        }

        // Agréger les ventes par date
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = 0;
        }
        salesByDate[dateKey] += order.totalAmount || 0;

        // Compter les produits
        order.items?.forEach((item: OrderItem) => {
          if (!productFrequency[item.id]) {
            productFrequency[item.id] = { count: 0, name: item.name };
          }
          productFrequency[item.id].count += item.quantity || 1;

          // Agréger par catégorie
          const category = item.category || "Autre";
          if (!categoryFrequency[category]) {
            categoryFrequency[category] = 0;
          }
          categoryFrequency[category] += item.quantity || 1;
        });

        // Statistiques des commandes
        totalOrders++;
        if (order.status === "Livrée") completedOrders++;
        else if (order.status === "En attente") pendingOrders++;
        else if (order.status === "En cours") inProgressOrders++;
        else if (order.status === "Annulée") cancelledOrders++;
      });

      // Formater les données pour les graphiques
      const dates = Object.keys(salesByDate);
      const sales = Object.values(salesByDate);

      setSalesData({
        labels: dates,
        datasets: [{ data: sales.length ? sales : [0] }],
      });

      // Top produits
      const topProductsArray = Object.entries(productFrequency)
        .map(([id, { count, name }]) => ({ id, count, name } as ProductStat))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopProducts(topProductsArray);

      // Données des catégories pour le graphique en camembert
      const categoryDataArray = Object.entries(categoryFrequency).map(
        ([name, count], index: number) => ({
          name,
          count,
          color: getColorByIndex(index),
          legendFontColor: "#7F7F7F",
          legendFontSize: 12,
        } as CategoryStat)
      );
      setCategoryData(categoryDataArray);

      // Statistiques des commandes
      setOrderStats({
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        inProgress: inProgressOrders,
        cancelled: cancelledOrders,
      });

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données analytiques:", error);
      setLoading(false);
    }
  };

  const getColorByIndex = (index: number): string => {
    const colors = [
      "#F04E98",
      "#FF9500",
      "#007AFF",
      "#4CD964",
      "#FF3B30",
      "#5856D6",
      "#FF2D55",
      "#8E8E93",
    ];
    return colors[index % colors.length];
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(240, 78, 152, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[styles.periodButton, period === "week" && styles.activePeriod]}
        onPress={() => setPeriod("week")}
      >
        <Text
          style={[
            styles.periodText,
            period === "week" && styles.activePeriodText,
          ]}
        >
          Semaine
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, period === "month" && styles.activePeriod]}
        onPress={() => setPeriod("month")}
      >
        <Text
          style={[
            styles.periodText,
            period === "month" && styles.activePeriodText,
          ]}
        >
          Mois
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, period === "year" && styles.activePeriod]}
        onPress={() => setPeriod("year")}
      >
        <Text
          style={[
            styles.periodText,
            period === "year" && styles.activePeriodText,
          ]}
        >
          Année
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F04E98" />
        <Text style={styles.loadingText}>Chargement des analytiques...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Tableau de Bord Analytique</Text>
          {renderPeriodSelector()}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="chart-line" size={16} color="#F04E98" /> Ventes{" "}
            {period === "week"
              ? "Hebdomadaires"
              : period === "month"
              ? "Mensuelles"
              : "Annuelles"}
          </Text>
          {salesData.datasets[0].data.length > 1 ? (
            <LineChart
              data={salesData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" FCFA"
            />
          ) : (
            <View style={styles.noDataContainer}>
              <FontAwesome5 name="chart-line" size={40} color="#E0E0E0" />
              <Text style={styles.noDataText}>
                Pas assez de données pour cette période
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="shopping-cart" size={16} color="#F04E98" />{" "}
            Statistiques des Commandes
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orderStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#006400" }]}>
                {orderStats.completed}
              </Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#F6BE00" }]}>
                {orderStats.inProgress}
              </Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#9D7BDE" }]}>
                {orderStats.pending}
              </Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#ff0000" }]}>
                {orderStats.cancelled}
              </Text>
              <Text style={styles.statLabel}>Annulées</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="birthday-cake" size={16} color="#F04E98" />{" "}
            Produits les Plus Vendus
          </Text>
          {topProducts.length > 0 ? (
            <BarChart
              data={{
                labels: topProducts.map((p) => p.name.substring(0, 10) + "..."),
                datasets: [
                  {
                    data: topProducts.map((p) => p.count),
                  },
                ],
              }}
              width={width - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                barPercentage: 0.7,
              }}
              style={styles.chart}
              verticalLabelRotation={30}
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <View style={styles.noDataContainer}>
              <FontAwesome5 name="birthday-cake" size={40} color="#E0E0E0" />
              <Text style={styles.noDataText}>
                Pas de données de produits pour cette période
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="chart-pie" size={16} color="#F04E98" />{" "}
            Répartition par Catégorie
          </Text>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.noDataContainer}>
              <FontAwesome5 name="pie-chart" size={40} color="#E0E0E0" />
              <Text style={styles.noDataText}>
                Pas de données de catégories pour cette période
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchAnalyticsData}
          >
            <FontAwesome5 name="sync-alt" size={16} color="#fff" />
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activePeriod: {
    backgroundColor: "#F04E98",
  },
  periodText: {
    color: "#666",
    fontWeight: "500",
  },
  activePeriodText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "18%",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  footer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  refreshButton: {
    flexDirection: "row",
    backgroundColor: "#F04E98",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AnalyticsScreen;
