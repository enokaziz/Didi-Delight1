import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput, Alert } from 'react-native';
import { promotionService, Promotion } from '../../services/promotions/promotionService';

const PromotionManagementScreen: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newPromo, setNewPromo] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const allPromotions = await promotionService.getActivePromotions(); // Peut être modifié pour récupérer toutes les promos
      setPromotions(allPromotions);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    if (!newPromo.title || !newPromo.startDate || !newPromo.endDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const promotionData = {
      title: newPromo.title,
      description: newPromo.description,
      startDate: new Date(newPromo.startDate),
      endDate: new Date(newPromo.endDate),
      active: true,
    };

    try {
      const createdPromo = await promotionService.createPromotion(promotionData);
      setPromotions([...promotions, createdPromo]);
      setNewPromo({ title: '', description: '', startDate: '', endDate: '' });
      Alert.alert('Succès', 'Promotion créée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la création de la promotion');
    }
  };

  const togglePromotionActive = async (promotion: Promotion) => {
    try {
      await promotionService.updatePromotion(promotion.id, { active: !promotion.active });
      setPromotions(promotions.map(p =>
        p.id === promotion.id ? { ...p, active: !p.active } : p
      ));
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Promotions</Text>

      {/* Formulaire de création */}
      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={newPromo.title}
        onChangeText={text => setNewPromo({ ...newPromo, title: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={newPromo.description}
        onChangeText={text => setNewPromo({ ...newPromo, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Date de début (YYYY-MM-DD)"
        value={newPromo.startDate}
        onChangeText={text => setNewPromo({ ...newPromo, startDate: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Date de fin (YYYY-MM-DD)"
        value={newPromo.endDate}
        onChangeText={text => setNewPromo({ ...newPromo, endDate: text })}
      />
      <Button title="Créer Promotion" onPress={handleCreatePromotion} />

      {/* Liste des promotions */}
      {loading ? (
        <Text>Chargement...</Text>
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.promoItem}>
              <Text>{item.title} - {item.active ? 'Active' : 'Inactive'}</Text>
              <Button
                title={item.active ? 'Désactiver' : 'Activer'}
                onPress={() => togglePromotionActive(item)}
              />
            </View>
          )}
        />
      )}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  promoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default PromotionManagementScreen;