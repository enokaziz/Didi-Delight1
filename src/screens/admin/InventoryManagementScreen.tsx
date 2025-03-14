import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InventoryManagementScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion de l'Inventaire</Text>
      {/* Ajouter ici la logique de gestion de l'inventaire */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
});

export default InventoryManagementScreen;
