import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Animated, FlatList } from "react-native";
import AnimatedCartItem from "./AnimatedCartItem";
import styles from "@styles/checkoutStyles";
import { Product } from "../../types/Product";
import { checkoutStyles } from "../../styles";

interface CartItem extends Product {
  quantity: number;
}

interface CartItemsListProps {
  items: CartItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartItemsList = ({
  items,
  onQuantityChange,
  onRemoveItem,
}: CartItemsListProps) => {
  return (
    <View style={styles.itemsList}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimatedCartItem
            item={item}
            onQuantityChange={(quantity: number) =>
              onQuantityChange(item.id, quantity)
            }
            onRemove={() => onRemoveItem(item.id)}
          />
        )}
        contentContainerStyle={styles.itemsListContent}
      />
    </View>
  );
};
