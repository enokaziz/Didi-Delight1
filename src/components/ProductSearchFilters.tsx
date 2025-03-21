import React from 'react';
import { View, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '@styles/productManagement.styles';

interface ProductSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const ProductSearchFilters: React.FC<ProductSearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
}) => {
  return (
    <View style={styles.searchFilterContainer}>
      <TextInput
        placeholder="Rechercher un produit"
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchFilterInput}
        accessibilityLabel="Rechercher un produit"
      />
      <Picker
        selectedValue={categoryFilter}
        onValueChange={onCategoryChange}
        style={styles.filterPicker}
        accessibilityLabel="Filtrer par catégorie"
      >
        <Picker.Item label="Toutes les catégories" value="" />
        {categories.map(category => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>
    </View>
  );
}; 