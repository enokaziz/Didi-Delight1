import React, {useState, useMemo} from 'react';
import { useCheckoutAnimations } from '../hooks/useCheckoutAnimations';
import { useOrderProcessing } from '../hooks/useOrderProcessing';
import { validateCheckoutForm } from '../utils/validation';
import AnimatedCartItem from '../components/checkout/AnimatedCartItem';
import CheckoutForm from '../components/checkout/CheckoutForm';
import LoadingOverlay from '../components/checkout/LoadingOverlay';
import styles from '../styles/checkoutStyles';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/Product';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Alert,SafeAreaView, FlatList } from 'react-native';

export type FormState = {
  address: string;
  paymentMethod: string;
  errors: string[];
}
const CheckoutScreen: React.FC = () => {
  // Hooks
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { loading, processOrder } = useOrderProcessing(clearCart);
  const { itemAnimations, overlayAnimations } = useCheckoutAnimations(cart.length);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // État local
  const [formState, setFormState] = useState<FormState>({
    address: '',
    paymentMethod: '',
    errors: []
  });

  const totalPrice = useMemo(() => 
    cart.reduce((sum: number, item: Product) => 
      sum + item.price * (item.quantity || 1), 
    0
  ), [cart]);

  const handleOrder = async () => {
    if (!user) return Alert.alert('Erreur', 'Authentification requise');
    
    const [isValid, errors] = validateCheckoutForm(
      formState.address,
      formState.paymentMethod
    );
    
    if (!isValid) return setFormState(prev => ({ ...prev, errors }));

    const success = await processOrder(
      user.uid,
      cart,
      totalPrice,
      formState.address,
      formState.paymentMethod
    );

    if (success) {
      navigation.navigate('Commandes');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Liste et formulaire simplifiés */}
      <CheckoutForm 
        formState={formState}
        onFormChange={(newState) => setFormState(prev => ({
          ...prev,
          ...newState,
          errors: newState.errors || prev.errors
        }))}
      />
      
      {/* Liste des articles */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        extraData={formState}
        renderItem={({ item, index }) => {
          if (!itemAnimations[index]) return null;
          return(
          <AnimatedCartItem 
            item={item} 
            animation={itemAnimations[index]} 
          />
          );
        }}
      />

      {/* Overlay de chargement */}
      <LoadingOverlay 
        visible={loading} 
        animations={overlayAnimations}
      />
    </SafeAreaView>
  );
};
export default CheckoutScreen;