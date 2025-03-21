import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { validateCheckoutForm } from '@utils/validation';
import type { Product } from '../types/Product';

interface OrderConfirmationProps {
  formState: {
    address: string;
    paymentMethod: string;
    errors: string[];
  };
  cart: Product[];
  totalPrice: number;
  processOrder: (
    userId: string,
    cart: Product[],
    totalPrice: number,
    address: string,
    paymentMethod: string
  ) => Promise<boolean>;
  onSuccess: () => void;
  onError: () => void;
}

export const useOrderConfirmation = ({
  formState,
  cart,
  totalPrice,
  processOrder,
  onSuccess,
  onError,
}: OrderConfirmationProps) => {
  const { user } = useAuth();

  const handleOrder = useCallback(async () => {
    if (!user) {
      Alert.alert('Erreur', 'Authentification requise');
      return;
    }

    const [isValid, errors] = validateCheckoutForm(formState.address, formState.paymentMethod);
    if (!isValid) {
      return { isValid: false, errors };
    }

    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Confirmer la commande',
        `Voulez-vous confirmer votre commande de ${totalPrice} FCFA ?`,
        [
          { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Confirmer',
            onPress: async () => {
              try {
                const success = await processOrder(
                  user.uid,
                  cart,
                  totalPrice,
                  formState.address,
                  formState.paymentMethod
                );
                if (success) {
                  Alert.alert('Succès', 'Commande passée avec succès !', [
                    { text: 'OK', onPress: onSuccess },
                  ]);
                } else {
                  Alert.alert('Erreur', 'Échec du traitement de la commande. Veuillez réessayer.');
                  onError();
                }
                resolve(success);
              } catch (error) {
                Alert.alert('Erreur', 'Une erreur est survenue lors du traitement de la commande.');
                onError();
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }, [user, formState, cart, totalPrice, processOrder, onSuccess, onError]);

  return { handleOrder };
}; 