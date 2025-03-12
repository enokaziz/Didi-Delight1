import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons, Text } from 'react-native-paper';

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
  const validatePhoneNumber = (number: string) => {
    // Accepter uniquement les chiffres
    const digitsOnly = number.replace(/\D/g, '');
    // Limiter à 8 chiffres
    return digitsOnly.slice(0, 8);
  };

  const handlePhoneNumberChange = (value: string) => {
    const formattedNumber = validatePhoneNumber(value);
    setPhoneNumber(formattedNumber);
  };

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.title}>Paiement Mobile Money</Text>
      
      <TextInput
        label="Numéro de téléphone"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        keyboardType="phone-pad"
        maxLength={8}
        error={!!error}
        style={styles.input}
      />
      {error && <Text variant="bodySmall" style={styles.errorText}>{error}</Text>}

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
