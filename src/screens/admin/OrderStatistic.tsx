// src/components/orders/OrderStatistic.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderStatisticProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap; // Correction du type d'icône
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

const OrderStatistic: React.FC<OrderStatisticProps> = ({
  label,
  value,
  icon = "stats-chart",
  color = "#007AFF",
  trend,
  onPress,
}) => {
  const containerStyle = [
    styles.statContainer,
    { backgroundColor: color },
    onPress && styles.pressable,
  ];

  const renderTrend = () => {
    if (!trend) return null;

    const trendIcon = trend.isPositive ? "trending-up" : "trending-down";
    const trendColor = trend.isPositive ? "#4ECDC4" : "#FF6B6B";

    return (
      <View style={styles.trendContainer}>
        <Ionicons name={trendIcon} size={14} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {trend.value}%
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.statValue}>{value}</Text>
          {renderTrend()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  pressable: {
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
});

export default OrderStatistic;
