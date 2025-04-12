import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../../theme/theme";
import { Product } from "../../types/Product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  accessibilityLabel?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <View style={styles.card}>
      {product.isPopular && <Text style={styles.badgePopular}>Populaire</Text>}
      {product.isPromotional && <Text style={styles.badgePromo}>Promo</Text>}
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price} FCFA</Text>
        <TouchableOpacity
          onPress={() => onAddToCart(product)}
          style={styles.button}
          accessibilityLabel={`Ajouter ${product.name} au panier`}
        >
          <Text style={styles.buttonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.sm,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  content: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  price: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary.main,
    fontWeight: "bold",
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: "#FFF",
    fontWeight: "600",
  },
  badgePopular: {
    position: "absolute",
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.secondary.main,
    color: "#FFF",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: 12,
    fontWeight: "700",
  },
  badgePromo: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.secondary.main,
    color: "#FFF",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: 12,
    fontWeight: "700",
  },
});

export default ProductCard;
