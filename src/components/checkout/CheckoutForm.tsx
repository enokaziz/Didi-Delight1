import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

type FormState = {
  address: string;
  paymentMethod: string;
};

interface Props {
  formState: FormState;
  onFormChange: (newState: Partial<FormState>) => void;
}

const CheckoutForm: React.FC<Props> = ({ formState, onFormChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Adresse de livraison"
        value={formState.address}
        onChangeText={(text) => onFormChange({ address: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Méthode de paiement"
        value={formState.paymentMethod}
        onChangeText={(text) => onFormChange({ paymentMethod: text })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
});

export default CheckoutForm;
