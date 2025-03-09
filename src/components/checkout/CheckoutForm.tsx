import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckoutFormInput from './CheckoutFormInput'; 
import { FormState } from '../../screens/CheckoutScreen';

type Props = {
  formState: FormState;
  onFormChange: (state: {
    errors: string[]; address: string; paymentMethod: string 
  }) => void;
};

const CheckoutForm = ({ formState, onFormChange }: Props) => {
  const handleInputChange = (field: keyof FormState, value: string) => {
    onFormChange({
      ...formState,
      [field]: value,
      errors: [] // Réinitialise les erreurs à chaque modification
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Informations de livraison</Text>
      
      <CheckoutFormInput
        placeholder="Adresse de livraison"
        value={formState.address}
        onChangeText={(text) => handleInputChange('address', text)}
        accessibilityLabel="Adresse de livraison"
        accessibilityHint="Entrez votre adresse complète de livraison"
      />
      
      <Text style={styles.sectionTitle}>Paiement</Text>
      
      <CheckoutFormInput
        placeholder="Méthode de paiement"
        value={formState.paymentMethod}
        onChangeText={(text) => handleInputChange('paymentMethod', text)}
        accessibilityLabel="Méthode de paiement"
        accessibilityHint="Entrez votre méthode de paiement préférée"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#343a40',
  }
});

export default CheckoutForm;