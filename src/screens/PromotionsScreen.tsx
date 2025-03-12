import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { promotionService, Promotion } from '../services/promotions/promotionService';

const PromotionsScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const activePromotions = await promotionService.getActivePromotions();
      setPromotions(activePromotions);
    };
    fetchPromotions();
  }, []);

  const applyPromotion = async (promotion: Promotion) => {
    if (!promotion) return;
    const success = await promotionService.incrementUsageCount(promotion.id);
    if (success) {
      alert(`Promotion ${promotion.title} appliquée avec succès!`);
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
