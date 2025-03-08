// components/checkout/CheckoutForm.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
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
    <View>
      <CheckoutFormInput
        placeholder="Adresse de livraison"
        value={formState.address}
        onChangeText={(text) => handleInputChange('address', text)}
        accessibilityLabel="Adresse de livraison"
      />
      <CheckoutFormInput
        placeholder="Méthode de paiement"
        value={formState.paymentMethod}
        onChangeText={(text) => handleInputChange('paymentMethod', text)}
        accessibilityLabel="Méthode de paiement"
      />
    </View>
  );
};

export default CheckoutForm;