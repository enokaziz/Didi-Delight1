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
import { 
  Alert, 
  SafeAreaView, 
  FlatList, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

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

    // Confirmation avant de passer la commande
    Alert.alert(
      'Confirmer la commande',
      `Voulez-vous confirmer votre commande de ${totalPrice} FCFA ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Confirmer',
          onPress: async () => {
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
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={localStyles.container}
      >
        <ScrollView contentContainerStyle={localStyles.scrollContent}>
          <Text style={localStyles.title}>Finaliser la commande</Text>
          
          {/* Affichage des erreurs */}
          {formState.errors.length > 0 && (
            <View style={localStyles.errorContainer}>
              {formState.errors.map((error, index) => (
                <Text key={index} style={localStyles.errorText}>{error}</Text>
              ))}
            </View>
          )}
          
          <CheckoutForm 
            formState={formState}
            onFormChange={(newState) => setFormState(prev => ({
              ...prev,
              ...newState,
              errors: newState.errors || prev.errors
            }))}
          />
          
          {/* Liste des articles */}
          <Text style={localStyles.sectionTitle}>Articles ({cart.length})</Text>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            extraData={formState}
            nestedScrollEnabled={true}
            scrollEnabled={false}
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
          
          {/* Résumé de la commande */}
          <View style={localStyles.summaryContainer}>
            <Text style={localStyles.summaryTitle}>Résumé</Text>
            <View style={localStyles.summaryRow}>
              <Text>Total</Text>
              <Text style={localStyles.totalPrice}>{totalPrice} FCFA</Text>
            </View>
          </View>
          
          {/* Bouton de commande */}
          <TouchableOpacity 
            style={localStyles.orderButton}
            onPress={handleOrder}
            disabled={loading}
            accessibilityLabel="Passer la commande"
            accessibilityHint="Finalise votre commande avec les informations fournies"
          >
            <Text style={localStyles.orderButtonText}>
              {loading ? 'Traitement en cours...' : 'Passer la commande'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Overlay de chargement */}
      <LoadingOverlay 
        visible={loading} 
        animations={overlayAnimations}
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#343a40',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#343a40',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#212529',
  },
  orderButton: {
    backgroundColor: '#FF4952',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30,
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;