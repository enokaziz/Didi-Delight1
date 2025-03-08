import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderStatisticProps {
    label: string;
    value: string | number;
}

const OrderStatistic: React.FC<OrderStatisticProps> = ({ label, value }) => (
    <View style={styles.statContainer}>
        <Ionicons name="stats-chart" size={24} color="#fff" />
        <Text style={styles.statText}>{label} : {value}</Text>
    </View>
);

const styles = StyleSheet.create({
    statContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    statText: {
        fontSize: 18,
        color: "#fff",
        marginLeft: 10,
    },
});

export default OrderStatistic;