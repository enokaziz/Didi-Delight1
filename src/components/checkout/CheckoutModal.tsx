import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CheckoutForm from './CheckoutForm';

type FormState = {
  address: string;
  paymentMethod: string;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  formState: FormState;
  onFormChange: (newState: Partial<FormState>) => void;
  totalPrice: number;
  cart: any[];
  onSubmit: () => void;
}

const CheckoutModal: React.FC<Props> = ({
  visible,
  onClose,
  formState,
  onFormChange,
  totalPrice,
  cart,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <CheckoutForm
            formState={formState}
            onFormChange={onFormChange}
          />

          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitButtonText}>Payer {totalPrice} FCFA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FF4952',
  },
  submitButton: {
    backgroundColor: '#FF4952',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default CheckoutModal;
