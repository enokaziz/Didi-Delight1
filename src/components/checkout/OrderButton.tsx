import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styles } from '@styles/checkout.styles';

interface OrderButtonProps {
  loading: boolean;
  disabled: boolean;
  totalPrice: number;
  onPress: () => void;
}

export const OrderButton: React.FC<OrderButtonProps> = ({
  loading,
  disabled,
  totalPrice,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.orderButton, disabled && styles.orderButtonDisabled]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.orderButtonText}>
        Commander ({totalPrice} FCFA)
      </Text>
    )}
  </TouchableOpacity>
); 