import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Order, OrderStatus } from "../../types/Order";
import OrderStatusBadge from "../common/OrderStatusBadge";
import { formatOrderTime } from "../../utils/orderUtils";

interface OrderTimelineProps {
  orders: Order[];
  status: OrderStatus;
  onOrderPress: (order: Order) => void;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orders,
  status,
  onOrderPress,
}) => {
  const filteredOrders = orders.filter((order: Order) => order.status === status);

  return (
    <ScrollView style={styles.container}>
      {filteredOrders.map((order: Order) => (
        <TouchableOpacity
          key={order.id}
          style={styles.orderItem}
          onPress={() => onOrderPress(order)}
          accessibilityLabel={`Commande ${order.id}`}
          accessibilityHint={`Appuyer pour afficher les détails de la commande ${order.id}`}
        >
          <View style={styles.orderContent}>
            <View style={styles.orderHeader}>
              <OrderStatusBadge status={order.status} size="small" />
              <Text style={styles.orderTime}>
                {formatOrderTime(order.createdAt)}
              </Text>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderNumber}>
                Commande #{order.id}
              </Text>
              <Text style={styles.customerName}>
                {order.customerName}
              </Text>
              <Text style={styles.orderTotal}>
                {order.totalAmount} FCFA
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderContent: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderTime: {
    fontSize: 12,
    color: "#666",
  },
  orderDetails: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
});

export default OrderTimeline;
