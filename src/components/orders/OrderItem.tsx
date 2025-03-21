import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { styles } from '@styles/orderHistory.styles';
import { ORDER_STATUSES } from './FilterBar';
import type { Order } from '../../types/Order';

interface OrderItemProps {
  item: Order;
  onViewDetails: (orderId: string) => void;
}

export const OrderItem: React.FC<OrderItemProps> = React.memo(({ item, onViewDetails }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.DELIVERED:
        return <Ionicons name="checkmark-circle" size={20} color="#38B000" />;
      case ORDER_STATUSES.SHIPPED:
        return <Ionicons name="time" size={20} color="#FFC107" />;
      default:
        return <Ionicons name="alert-circle" size={20} color="#6C757D" />;
    }
  };

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <View style={styles.orderItem}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <Text style={styles.orderInfo}>Montant : {item.total} FCFA</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.orderDate}>
          {format(new Date(item.createdAt), "PPpp", { locale: fr })}
        </Text>
        <TouchableOpacity onPress={() => onViewDetails(item.id || "")}>
          <Text style={styles.detailsButton}>Voir Détails</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}); 