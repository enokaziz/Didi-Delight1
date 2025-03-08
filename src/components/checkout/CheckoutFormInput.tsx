// components/checkout/CheckoutFormInput.tsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
};


const CheckoutFormInput = ({
  placeholder,
  value,
  onChangeText,
  accessibilityLabel,
  accessibilityHint
}: Props) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    style={styles.input}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
  />
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
});

export default CheckoutFormInput;