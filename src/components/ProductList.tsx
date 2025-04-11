import React, { memo } from "react";
import { View, FlatList, Text } from "react-native";
import type { ProductListProps } from "../types/productManagement";
import type { Product } from "../types/Product";
import ProductItem from "./ProductItem";
import { productStyles } from "@styles/product.styles";

const ProductList: React.FC<ProductListProps> = memo(
  ({ products, onEdit, onDelete }) => {
    const renderItem = ({ item }: { item: Product }) => (
      <ProductItem product={item} onEdit={onEdit} onDelete={onDelete} />
    );

    const keyExtractor = (item: Product) => item.id;

    const ListEmptyComponent = () => (
      <View style={productStyles.emptyContainer}>
        <Text style={productStyles.emptyText}>Aucun produit trouvé</Text>
      </View>
    );

    return (
      <View style={productStyles.list}>
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={productStyles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
);

export default ProductList;
