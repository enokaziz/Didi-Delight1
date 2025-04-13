import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import CheckoutScreen from '../screens/CheckoutScreen';
import { useCart } from '../contexts/CartContext';

const CartButton = () => {
  const { cart } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setShowCart(true)}
      >
        <Text style={styles.text}>Panier ({cart.length})</Text>
      </TouchableOpacity>
      
      <CheckoutScreen 
        visible={showCart} 
        onClose={() => setShowCart(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2e8b57',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CartButton;
