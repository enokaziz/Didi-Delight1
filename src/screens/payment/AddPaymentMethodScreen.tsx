import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, TextInput, Button, RadioButton, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import MobileMoneyForm from '../../components/payment/MobileMoneyForm';
import { PaymentMethodType } from '../../types/PaymentMethod';

const AddPaymentMethodScreen = () => {
  const [type, setType] = useState<PaymentMethodType>('mobile_money');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'orange' | 'moov'>('orange');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const newPaymentMethod = {
        type,
        name,
        isDefault,
        userId: user.uid,
        phoneNumber: type === 'mobile_money' ? phoneNumber : undefined,
        provider: type === 'mobile_money' ? provider : undefined,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      await addDoc(collection(db, 'paymentMethods'), newPaymentMethod);
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ajouter une méthode de paiement" />
      </Appbar.Header>

      <View style={styles.content}>
        <TextInput
          label="Nom"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <RadioButton.Group onValueChange={(value) => setType(value as PaymentMethodType)} value={type}>
          <View style={styles.radioOption}>
            <RadioButton.Android value="mobile_money" />
            <Text>Mobile Money</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton.Android value="card" />
            <Text>Carte bancaire</Text>
          </View>
        </RadioButton.Group>

        {type === 'mobile_money' && (
          <MobileMoneyForm
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            provider={provider}
            setProvider={setProvider}
          />
        )}

        <View style={styles.checkboxContainer}>
          <RadioButton.Android
            value="default"
            status={isDefault ? 'checked' : 'unchecked'}
            onPress={() => setIsDefault(!isDefault)}
          />
          <Text>Définir comme méthode par défaut</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading || !name || (type === 'mobile_money' && !phoneNumber)}
          style={styles.button}
        >
          Enregistrer
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default AddPaymentMethodScreen;
