import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EventManagementScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Événements</Text>
      {/* Ajouter ici la logique de gestion des événements */}
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

export default EventManagementScreen;
