import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  promotionService,
  Promotion,
} from "../../services/promotions/promotionService";

const PromotionManagementScreen: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const allPromotions = await promotionService.getActivePromotions();
      setPromotions(allPromotions);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    if (!newPromo.title || !newPromo.startDate || !newPromo.endDate) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
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
      const createdPromo =
        await promotionService.createPromotion(promotionData);
      setPromotions([...promotions, createdPromo]);
      setNewPromo({ title: "", description: "", startDate: "", endDate: "" });
      Alert.alert("Succès", "Promotion créée avec succès");
    } catch (error) {
      Alert.alert("Erreur", "Échec de la création de la promotion");
    }
  };

  const togglePromotionActive = async (promotion: Promotion) => {
    try {
      await promotionService.updatePromotion(promotion.id, {
        active: !promotion.active,
      });
      setPromotions(
        promotions.map((p) =>
          p.id === promotion.id ? { ...p, active: !p.active } : p
        )
      );
    } catch (error) {
      Alert.alert("Erreur", "Échec de la mise à jour");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌸 Gestion des Promotions 🌸</Text>

      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={newPromo.title}
        onChangeText={(text) => setNewPromo({ ...newPromo, title: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={newPromo.description}
        onChangeText={(text) => setNewPromo({ ...newPromo, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Date de début (YYYY-MM-DD)"
        value={newPromo.startDate}
        onChangeText={(text) => setNewPromo({ ...newPromo, startDate: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Date de fin (YYYY-MM-DD)"
        value={newPromo.endDate}
        onChangeText={(text) => setNewPromo({ ...newPromo, endDate: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreatePromotion}>
        <Text style={styles.buttonText}>Créer Promotion</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#D27D7D" />
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.promoItem}>
              <Text style={styles.promoText}>
                {item.title} - {item.active ? "Active" : "Inactive"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  item.active ? styles.activeButton : styles.inactiveButton,
                ]}
                onPress={() => togglePromotionActive(item)}
              >
                <Text style={styles.buttonText}>
                  {item.active ? "Désactiver" : "Activer"}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: "#F4C6C6", // Beige vanille
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#D27D7D", // Rose poudré
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFDDDD",
    padding: 12,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: "#FFF",
  },
  button: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: "#D27D7D",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  promoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#FFDDDD",
    backgroundColor: "#FFEDE1",
    borderRadius: 12,
  },
  promoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  activeButton: {
    backgroundColor: "red",
  },
  inactiveButton: {
    backgroundColor: "green",
  },
});

export default PromotionManagementScreen;
