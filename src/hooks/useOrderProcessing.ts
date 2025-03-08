import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { createOrder } from '../services/orderService';
import { Product } from 'types/Product';

export const useOrderProcessing = (clearCart: () => void) => {
  const [loading, setLoading] = useState(false);

  const processOrder = useCallback(async (
    userId: string,
    cart: Product[],
    total: number,
    address: string,
    paymentMethod: string
  ) => {
    setLoading(true);
    try {
      await createOrder(userId, cart, total, address, paymentMethod);
      clearCart();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      Alert.alert('Erreur', `Échec : ${message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [clearCart]);

  return { loading, processOrder };
};