// src/components/common/OrderStatusBadge.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus } from "../../types/Order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "small" | "medium" | "large";
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "medium",
}) => {
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

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case "En attente":
        return "En attente";
      case "En cours":
        return "En cours";
      case "Livrée":
        return "Livrée";
      case "Annulée":
        return "Annulée";
      default:
        return "Inconnu";
    }
  };

  const sizes = {
    small: { width: 80, height: 24, fontSize: 12 },
    medium: { width: 100, height: 32, fontSize: 14 },
    large: { width: 120, height: 40, fontSize: 16 },
  };

  const sizeStyle = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getStatusColor(status),
          width: sizeStyle.width,
          height: sizeStyle.height,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {getStatusText(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    color: "#fff",
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
});

export default OrderStatusBadge;
