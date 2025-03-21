import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, FlatList } from 'react-native';
import AnimatedCartItem from './AnimatedCartItem';
import { styles } from '@styles/checkout.styles';
import type { Product } from '../../types/Product';
import { CartItem } from "./CartItem";
import { checkoutStyles } from '@styles';

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
    <View style={checkoutStyles.itemsList}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
            onRemove={() => onRemoveItem(item.id)}
          />
        )}
        contentContainerStyle={checkoutStyles.itemsListContent}
      />
    </View>
  );
}; 