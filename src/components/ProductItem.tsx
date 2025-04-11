import React, { memo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { IconButton } from "react-native-paper";
import type { Product } from "../types/Product";
import { styles } from "./ProductItem.styles";

interface ProductItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = memo(
  ({ product, onEdit, onDelete }) => {
    return (
      <View style={styles.productCard}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price} FCFA</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        <View style={styles.productActions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(product)}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDelete(product.id)}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  }
);

export default ProductItem;
