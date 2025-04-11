import React from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Product } from '../../types/Product';

type Props = {
  item: Product & { quantity?: number };
  animation?: Animated.Value;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
};

const AnimatedCartItem = ({ item, animation, onQuantityChange, onRemove }: Props) => {
  if (!animation) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>
        {item.price} FCFA × {(item.quantity ?? 1)}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#212529' },
  price: { fontSize: 14, color: '#495057', fontWeight: '500' },
});

export default AnimatedCartItem;