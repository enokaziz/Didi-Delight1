import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Animated, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { subscribeToUserOrders } from '../services/orderService';
import { FilterBar, ORDER_STATUSES } from '@components/orders/FilterBar';
import { OrderItem } from '@components/orders/OrderItem';
import { styles } from '@styles/orderHistory.styles';
import type { Order } from '../types/Order';

type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

const OrderHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | null>(null);

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

  const filterOrders = useCallback((status: OrderStatus | null) => {
    setSelectedFilter(status);
  }, []);

  const filteredOrders = useMemo(() => {
    return selectedFilter ? orders.filter((order) => order.status === selectedFilter) : orders;
  }, [orders, selectedFilter]);

  const viewOrderDetails = useCallback((orderId: string) => {
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
  }, [orders]);

  const renderItem = useCallback(({ item }: { item: Order }) => (
    <OrderItem item={item} onViewDetails={viewOrderDetails} />
  ), [viewOrderDetails]);

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
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </Animated.View>
  );
};

export default OrderHistoryScreen;