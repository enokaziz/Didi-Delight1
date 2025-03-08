import React from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Product } from '../../types/Product';

type Props = {
  item: Product;
  animation: Animated.Value;
};

const AnimatedCartItem = ({ item, animation }: Props) => {
  if(!Animation) return null;

  return (
    
  <Animated.View style={[styles.container, {
    opacity: animation,
    transform: [{ translateY: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0]
    })
   }]
  }]}>
    <Text style={styles.name}>{item.name}</Text>
    <Text style={styles.price}>
      {item.price} FCFA × {item.quantity || 1}
    </Text>
  </Animated.View>
);
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  name: { /* ... */ },
  price: { /* ... */ }
});

export default AnimatedCartItem;