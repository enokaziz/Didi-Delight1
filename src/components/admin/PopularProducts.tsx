import { useAdminData } from "@hooks/useAdminData";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PopularProducts: React.FC = () => {
  const { products } = useAdminData();

  // Logique pour déterminer les produits populaires
  const popularProducts = products
    .filter((product: any) => product.isPopular)

    .slice(0, 5); // Limiter à 5 produits populaires

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produits Populaires</Text>
      {popularProducts.map((product: any) => (
        <View key={product.id} style={styles.productItem}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSales}>Ventes: {product.sales}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productItem: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    color: "#333",
  },
  productSales: {
    fontSize: 14,
    color: "#666",
  },
});

export default PopularProducts;
