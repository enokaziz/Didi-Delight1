import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import CheckoutFormInput from './CheckoutFormInput';
import { FormState } from '../../screens/CheckoutScreen';

type Props = {
  formState: FormState;
  onFormChange: (state: { errors: string[]; address: string; paymentMethod: string }) => void;
};

const CheckoutForm = ({ formState, onFormChange }: Props) => {
  const addressInputRef = useRef<TextInput>(null);
  const paymentInputRef = useRef<TextInput>(null);

  const handleInputChange = useCallback(
    (field: keyof FormState, value: string) => {
      onFormChange({
        ...formState,
        [field]: value,
        errors: [],
      });
    },
    [formState, onFormChange]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Informations de livraison</Text>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => addressInputRef.current?.focus()}
        activeOpacity={0.7} // Légère opacité au clic pour feedback visuel
      >
        <CheckoutFormInput
          ref={addressInputRef}
          placeholder="Adresse de livraison"
          value={formState.address}
          onChangeText={(text) => handleInputChange('address', text)}
          accessibilityLabel="Adresse de livraison"
          accessibilityHint="Entrez votre adresse complète de livraison"
        />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Paiement</Text>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => paymentInputRef.current?.focus()}
        activeOpacity={0.7} // Légère opacité au clic pour feedback visuel
      >
        <CheckoutFormInput
          ref={paymentInputRef}
          placeholder="Méthode de paiement"
          value={formState.paymentMethod}
          onChangeText={(text) => handleInputChange('paymentMethod', text)}
          accessibilityLabel="Méthode de paiement"
          accessibilityHint="Entrez votre méthode de paiement préférée"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#343a40' },
  inputWrapper: {
    marginBottom: 15,
    backgroundColor: '#fff', // Fond blanc pour une zone cliquable visible
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 5, // Padding pour agrandir la zone cliquable
  },
});

export default CheckoutForm;