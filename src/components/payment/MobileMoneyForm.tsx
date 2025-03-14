import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { TextInput, SegmentedButtons, Text } from 'react-native-paper';
import { payWithMobileMoney } from '../../services/payment/mobileMoneyService';

interface MobileMoneyFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  provider: "orange" | "moov";
  setProvider: (value: "orange" | "moov") => void;
  error?: string;
}

const MobileMoneyForm: React.FC<MobileMoneyFormProps> = ({
  phoneNumber,
  setPhoneNumber,
  provider,
  setProvider,
  error,
}) => {
  const [errorState, setError] = useState(error);

  const validatePhoneNumber = (number: string) => {
    const digitsOnly = number.replace(/\D/g, '');
    return digitsOnly.length === 8;
  };

  const handlePhoneNumberChange = (value: string) => {
    const formattedNumber = value.replace(/\D/g, '');
    if (formattedNumber.length > 8) {
      return;
    }
    setPhoneNumber(formattedNumber);
  };

  const handlePayment = () => {
    const amount = 1000; // montant à payer, à ajuster selon votre logique
    payWithMobileMoney(provider === 'orange' ? 'Orange Money' : 'Moov Money', amount, phoneNumber);
  };

  if (!validatePhoneNumber(phoneNumber)) {
    setError('Le numéro de téléphone doit contenir 8 chiffres.');
    return (
      <View style={styles.container}>
        <Text variant="bodySmall" style={styles.title}>Paiement Mobile Money</Text>
        <Text variant="bodySmall" style={styles.errorText}>{errorState}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.title}>Paiement Mobile Money</Text>
      
      <TextInput
        label="Numéro de téléphone"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        keyboardType="phone-pad"
        maxLength={8}
        error={!!errorState}
        style={styles.input}
      />
      {errorState && <Text variant="bodySmall" style={styles.errorText}>{errorState}</Text>}

      <SegmentedButtons
        value={provider}
        onValueChange={value => setProvider(value as "orange" | "moov")}
        buttons={[
          { value: 'orange', label: 'Orange Money' },
          { value: 'moov', label: 'Moov Money' },
        ]}
      />

      <Text variant="bodySmall" style={styles.infoText}>
        Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
      </Text>

      <Button title="Payer avec Mobile Money" onPress={handlePayment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default MobileMoneyForm;