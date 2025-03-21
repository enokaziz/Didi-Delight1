import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { orderHistoryStyles } from '@styles';

export const ORDER_STATUSES = {
  PENDING: "En attente",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
} as const;

type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

interface FilterBarProps {
  selectedFilter: OrderStatus | null;
  onFilterChange: (status: OrderStatus | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ selectedFilter, onFilterChange }) => {
  const filters = [null, ORDER_STATUSES.PENDING, ORDER_STATUSES.SHIPPED, ORDER_STATUSES.DELIVERED];

  return (
    <View style={orderHistoryStyles.filterBar}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter || "Tous"}
          style={[
            orderHistoryStyles.filterButton,
            selectedFilter === filter && orderHistoryStyles.filterButtonActive,
          ]}
          onPress={() => onFilterChange(filter as OrderStatus | null)}
          accessibilityLabel={`Filtrer par ${filter || "tous"}`}
        >
          <Text
            style={[
              orderHistoryStyles.filterText,
              selectedFilter === filter && orderHistoryStyles.filterTextActive,
            ]}
          >
            {filter || "Tous"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}; 