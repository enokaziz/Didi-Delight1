import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { promotionService, Promotion } from '../services/promotions/promotionService';

const PromotionsScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const activePromotions = await promotionService.getActivePromotions();
        setPromotions(activePromotions);
      } catch (err) {
        setError('Erreur lors du chargement des promotions');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const applyPromotion = async (promotion: Promotion) => {
    if (promotion.usageLimit && (promotion.usageCount ?? 0) >= promotion.usageLimit) {
      alert(`La promotion ${promotion.title} a atteint sa limite d'utilisation.`);
      return;
    }
    try {
      await promotionService.incrementUsageCount(promotion.id);
      setPromotions(prev => prev.map(p => p.id === promotion.id ? { ...p, usageCount: (p.usageCount ?? 0) + 1 } : p));
      alert(`Promotion ${promotion.title} appliquée avec succès!`);
    } catch (error) {
      alert('Erreur lors de l\'application de la promotion');
    }
  };
  const title = promotions[0]?.title;
  const description = promotions[0]?.description;
  const id = promotions[0]?.id;

  return (
    <View>
      <Text>Promotions Actives :</Text>
      <FlatList
        data={promotions}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Button title="Appliquer" onPress={() => applyPromotion(item)} />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default PromotionsScreen;
