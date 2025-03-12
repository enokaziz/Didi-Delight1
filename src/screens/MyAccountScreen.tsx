import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { loyaltyPointsService } from '../services/loyalty/loyaltyPointsService';

const MyAccountScreen = () => {
  const [accountData, setAccountData] = useState<{ date: Date; points: number; type: 'redeem' | 'earn'; description: string; }[]>([]);
  const userId = "user_id"; // Remplacez par l'ID de l'utilisateur actuel

  useEffect(() => {
    const fetchPoints = async () => {
      const userPoints = await loyaltyPointsService.getUserPoints(userId);
      if (userPoints) {
        setAccountData(userPoints.history ?? []);
      }
    };
    fetchPoints();
  }, []);

  const handleRedeemPoints = async () => {
    const pointsToRedeem = 50; // Exemple de points à réclamer
    const success = await loyaltyPointsService.redeemPoints(userId, pointsToRedeem, 'Réduction sur commande');
    if (success) {
      alert('Points réclamés avec succès!');
      // Mettez à jour les points après réclamation
    } else {
      alert('Échec de la réclamation des points.');
    }
  };

  const date = accountData[0]?.date ? String(accountData[0].date) : '';
  const description = accountData[0]?.description;
  const points = accountData[0]?.points;

  return (
    <View>
      <Text>Points de fidélité : {points}</Text>
      <Text>Historique des points :</Text>
      {accountData.map((entry) => (
        <Text key={entry.date}>{entry.description}: {entry.points} points</Text>
      ))}
      <Button title="Réclamer des points" onPress={handleRedeemPoints} />
    </View>
  );
};

export default MyAccountScreen;
