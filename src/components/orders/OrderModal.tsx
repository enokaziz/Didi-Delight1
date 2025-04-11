import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Order, OrderStatus } from "../../types/Order";
import OrderStatusBadge from "../common/OrderStatusBadge";
import { formatOrderTime } from "../../utils/orderUtils";

interface OrderModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onOrderStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  isUpdating: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  order,
  onClose,
  onOrderStatusChange,
  isUpdating,
}) => {
  if (!order) return null;

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus => {
    switch (currentStatus) {
      case "En attente":
        return "En cours";
      case "En cours":
        return "Livrée";
      default:
        return currentStatus;
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "En attente":
        return "#FFD166";
      case "En cours":
        return "#118AB2";
      case "Livrée":
        return "#4ECDC4";
      case "Annulée":
        return "#FF6B6B";
      default:
        return "#6c757d";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Détails de la commande</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderInfo}>
              <Text style={styles.label}>Commande #{order.id}</Text>
              <Text style={styles.label}>
                Date: {formatOrderTime(order.createdAt)}
              </Text>
              <Text style={styles.label}>Client: {order.userName}</Text>
              <Text style={styles.label}>
                Montant: {order.totalAmount} FCFA
              </Text>
            </View>

            <View style={styles.statusSection}>
              <Text style={styles.statusTitle}>Statut de la commande</Text>
              <View style={styles.statusContainer}>
                <OrderStatusBadge status={order.status} size="medium" />
                <Text style={styles.statusText}>{order.status}</Text>
              </View>

              {order.status !== "Livrée" && order.status !== "Annulée" && (
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: getStatusColor(
                        getNextStatus(order.status)
                      ),
                    },
                  ]}
                  onPress={() =>
                    onOrderStatusChange(order.id, getNextStatus(order.status))
                  }
                  disabled={isUpdating}
                >
                  <Text style={styles.statusButtonText}>
                    Marquer comme {getNextStatus(order.status)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Articles</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
              ))}
            </View>

            {order.deliveryAddress && (
              <View style={styles.addressSection}>
                <Text style={styles.sectionTitle}>Adresse de livraison</Text>
                <Text style={styles.addressText}>{order.deliveryAddress}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#333",
  },
  close: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#666",
  },
  orderInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  statusButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  statusButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold" as const,
  },
  itemsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemName: {
    fontSize: 14,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  addressSection: {
    marginTop: 20,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default OrderModal;
