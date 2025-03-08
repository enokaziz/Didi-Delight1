import React, { useMemo, useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "services/authService";
import OrderStatistic from "./OrderStatistic";
import useAdminData from "hooks/useAdminData";
import { AdminStackParamList } from "navigation/types";



const AdminDashboardScreen: React.FC = () => {
    const { orders, products, loading, error } = useAdminData();
    const navigation = useNavigation<StackNavigationProp<AdminStackParamList, "ProductManagement">>();
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (!loading && !error) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        }
    }, [loading, error, fadeAnim]);

    const totalSales = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
    const ordersInProgress = useMemo(() => orders.filter(order => order.status === "En cours").length, [orders]);
    const completedOrders = useMemo(() => orders.filter(order => order.status === "Livrée").length, [orders]);
    const mostSoldProducts = useMemo(() => {
        const productFrequency: { [key: string]: number } = {};
        orders.forEach(order => {
            order.items.forEach(product => {
                productFrequency[product.id] = (productFrequency[product.id] || 0) + 1;
            });
        });
        return Object.entries(productFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([productId, count]) => ({ productId, count }));
    }, [orders]);

    const handleNavigation = useCallback(() => {
        navigation.navigate("ProductManagement");
    }, [navigation]);

    const handleLogout = useCallback(async () => {
        try {
          await logout(); // Déconnecte l'utilisateur
          navigation.navigate("Auth"); // Redirige vers l'écran Auth
        } catch (error) {
          console.error("Erreur lors de la déconnexion :", error);
          Alert.alert("Erreur", "Impossible de se déconnecter. Veuillez réessayer.");
        }
      }, [navigation]);

    const getProductName = useCallback((productId: string) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : "Nom inconnu";
    }, [products]);

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Tableau de Bord Admin</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("AdminChats")}
                    accessibilityLabel="Accéder aux Chats"
                    accessible={true}
                >
                    <Ionicons name="chatbubbles" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Accéder aux Chats</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNavigation}
                    accessibilityLabel="Gérer les Produits"
                    accessible={true}
                >
                    <Ionicons name="cart" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Gérer les Produits</Text>
                </TouchableOpacity>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text>Chargement des commandes...</Text>
                    </View>
                ) : error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : (
                    <>
                        <OrderStatistic label="Ventes totales" value={`${totalSales} FCFA`} />
                        <OrderStatistic label="Commandes en cours" value={ordersInProgress} />
                        <OrderStatistic label="Commandes terminées" value={completedOrders} />

                        <Text style={styles.subtitle}>Produits les plus vendus :</Text>
                        <FlatList
                            data={mostSoldProducts}
                            keyExtractor={item => item.productId}
                            renderItem={({ item }) => (
                                <View style={styles.productItemContainer}>
                                    <Ionicons name="pricetag" size={24} color="#007AFF" />
                                    <Text style={styles.productItem}>
                                        {getProductName(item.productId)} — Ventes : {item.count}
                                    </Text>
                                </View>
                            )}
                            style={{ maxHeight: 300 }}
                        />
                    </>
                )}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    accessibilityLabel="Se Déconnecter"
                    accessible={true}
                >
                    <Ionicons name="log-out" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Se Déconnecter</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
    content: { flex: 1 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333", textAlign: "center" },
    button: { flexDirection: "row", backgroundColor: "#007AFF", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 20, justifyContent: "center" },
    buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    subtitle: { fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: "bold", color: "#333", textAlign: "center" },
    productItemContainer: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
    productItem: { fontSize: 16, marginLeft: 10, color: "#333" },
    error: { color: "red", marginTop: 10, textAlign: "center" },
    logoutButton: { flexDirection: "row", backgroundColor: "#FF3B30", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 20, justifyContent: "center" },
});

export default AdminDashboardScreen;