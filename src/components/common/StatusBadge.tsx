import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatusBadgeProps {
  status: string;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, color, icon }) => {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      {icon && <Ionicons name={icon} size={16} color="#fff" style={styles.icon} />}
      <Text style={[styles.text, { color: "#fff" }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});

export default StatusBadge;
