import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Order } from "../../types/Order";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const formattedDate = format(
    new Date(order.createdAt),
    "dd MMMM yyyy HH:mm",
    { locale: fr }
  );
  const totalAmount = order.totalAmount || 0; // Utiliser 0 comme valeur par défaut si totalAmount est undefined

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Commande #{order.id}</Text>
        <Text style={styles.status}>{order.status}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{order.userName}</Text>
        <Text style={styles.userPhone}>{order.userPhone}</Text>
      </View>

      <View style={styles.itemsContainer}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.total}>Total: {totalAmount.toFixed(2)} FCFA</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
  },
  userInfo: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  itemsContainer: {
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
});

export default OrderCard;
