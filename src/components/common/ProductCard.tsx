import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Product } from "../../types/Product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  accessibilityLabel?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <View style={styles.card}>
      {product.isPopular && <Text style={styles.badge}>Populaire</Text>}
      {product.isPromotional && <Text style={styles.badge}>Promotion</Text>}
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price} FCFA</Text>
      <TouchableOpacity onPress={() => onAddToCart(product)} style={styles.button}>
        <Text style={styles.buttonText}>Ajouter au panier</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 10, backgroundColor: "#fff", borderRadius: 10, margin: 10, alignItems: "center" },
  image: { width: 100, height: 100, borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, color: "gray", marginBottom: 5 },
  button: { backgroundColor: "#FF6347", padding: 8, borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
  badge: { backgroundColor: "#FFD700", padding: 5, borderRadius: 5, marginBottom: 5, fontWeight: "bold" },
});

export default ProductCard;
