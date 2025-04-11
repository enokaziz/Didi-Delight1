import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Order, OrderStatus } from "../../types/Order";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AdminStackParamList } from "../../navigation/types";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";
import { formatOrderTime } from "../../utils/orderUtils";
import OrderModal from "../../components/orders/OrderModal";
import { useOrderStatistics } from "../../hooks/useOrderStatistics";

type AdminNavigation = NavigationProp<AdminStackParamList>;

interface OrderListContainerProps {
  orders: Order[];
  statusFilter?: OrderStatus;
}

const OrderListContainer: React.FC<OrderListContainerProps> = ({
  orders,
  statusFilter,
}) => {
  const navigation = useNavigation<AdminNavigation>();
  const { ordersByStatus, updateOrderStatus } = useOrderStatistics();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const filteredOrders = React.useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleOrderPress = React.useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  }, []);

  const handleOrderStatusChange = React.useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        await updateOrderStatus(orderId, newStatus);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
      }
    },
    [updateOrderStatus]
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>Commande #{item.id}</Text>
        <Text style={styles.orderDate}>{formatOrderTime(item.createdAt)}</Text>
        <Text style={styles.userName}>Client: {item.userName}</Text>
        <Text style={styles.orderAmount}>Montant: {item.totalAmount} FCFA</Text>
      </View>
      <OrderStatusBadge status={item.status} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <OrderModal
        visible={isModalVisible}
        order={selectedOrder}
        onClose={() => setIsModalVisible(false)}
        onOrderStatusChange={handleOrderStatusChange}
        isUpdating={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 8,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 14,
    color: "#333",
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#118AB2",
  },
});

export default OrderListContainer;
