import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  error?: string;
};

const CheckoutFormInput = forwardRef<TextInput, Props>(
  ({ placeholder, value, onChangeText, accessibilityLabel, accessibilityHint, error }, ref) => (
    <View style={styles.inputContainer}>
      <TextInput
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        returnKeyType="next"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
);

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  inputError: { borderColor: '#d32f2f', backgroundColor: '#ffebee' },
  errorText: { color: '#d32f2f', fontSize: 12, marginTop: 5, marginLeft: 5 },
});

export default CheckoutFormInput;