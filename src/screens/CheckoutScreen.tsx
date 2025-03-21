import React, { useState, useCallback, Suspense } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';
import type { CheckoutScreenNavigationProp } from '@navigation/types';

// Lazy loading des composants
const OrderSummary = React.lazy(() => import('@components/checkout/OrderSummary'));
const PaymentForm = React.lazy(() => import('@components/checkout/PaymentForm'));

// Composant de chargement
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingContent}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingDetails} />
    </View>
  </View>
);

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { items, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = useCallback(async (paymentDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
  }) => {
    setIsLoading(true);
    try {
      // Simuler un appel API pour le traitement du paiement
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      
      // Vider le panier après un paiement réussi
      clearCart();
      
      // Afficher un message de succès
      Alert.alert(
        'Paiement réussi',
        'Votre commande a été confirmée',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Accueil' }],
            }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du traitement du paiement'
      );
    } finally {
      setIsLoading(false);
    }
  }, [clearCart, navigation]);

  return (
    <ScrollView style={styles.container}>
      <Suspense fallback={<LoadingComponent />}>
        <OrderSummary items={items} totalPrice={totalPrice} />
      </Suspense>
      <Suspense fallback={<LoadingComponent />}>
        <PaymentForm onSubmit={handlePayment} isLoading={isLoading} />
      </Suspense>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  loadingContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  loadingContent: {
    padding: SPACING.md,
  },
  loadingTitle: {
    width: '60%',
    height: 24,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  loadingDetails: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
  },
});