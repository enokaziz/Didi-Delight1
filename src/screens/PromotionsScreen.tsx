import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  promotionService,
  Promotion,
} from "../services/promotions/promotionService";

const PromotionsScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const activePromotions = await promotionService.getActivePromotions();
        setPromotions(activePromotions);
      } catch (err) {
        setError("Erreur lors du chargement des promotions");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const applyPromotion = async (promotion: Promotion) => {
    if (
      promotion.usageLimit &&
      (promotion.usageCount ?? 0) >= promotion.usageLimit
    ) {
      Alert.alert(
        "Limite atteinte",
        `La promotion ${promotion.title} a atteint sa limite d'utilisation.`
      );
      return;
    }
    try {
      await promotionService.incrementUsageCount(promotion.id);
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promotion.id
            ? { ...p, usageCount: (p.usageCount ?? 0) + 1 }
            : p
        )
      );
      Alert.alert(
        "Succès",
        `Promotion ${promotion.title} appliquée avec succès!`
      );
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de l'application de la promotion");
    }
  };
  const title = promotions[0]?.title;
  const description = promotions[0]?.description;
  const id = promotions[0]?.id;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🎁 Promotions Actives 🎁</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#D27D7D" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              promotionService
                .getActivePromotions()
                .then((promos) => setPromotions(promos))
                .catch((err) =>
                  setError("Erreur lors du chargement des promotions")
                )
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : promotions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../assets/images/empty-cart.png")}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>
            Aucune promotion disponible actuellement
          </Text>
        </View>
      ) : (
        <FlatList
          data={promotions}
          renderItem={({ item }) => (
            <View style={styles.promoCard}>
              <View style={styles.promoHeader}>
                <Text style={styles.promoTitle}>{item.title}</Text>
                {item.discountType && item.discountValue && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {item.discountType === "percentage"
                        ? `${item.discountValue}%`
                        : `${item.discountValue} FCFA`}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.promoDescription}>{item.description}</Text>

              <View style={styles.promoDetails}>
                <Text style={styles.promoDate}>
                  Valable du {new Date(item.startDate).toLocaleDateString()} au{" "}
                  {new Date(item.endDate).toLocaleDateString()}
                </Text>
                {item.minimumPurchase && (
                  <Text style={styles.promoCondition}>
                    Achat minimum: {item.minimumPurchase} FCFA
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => applyPromotion(item)}
              >
                <Text style={styles.applyButtonText}>
                  Appliquer cette promotion
                </Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF5F5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D27D7D",
    textAlign: "center",
    marginVertical: 16,
  },
  loader: {
    marginTop: 50,
  },
  listContainer: {
    paddingBottom: 20,
  },
  promoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#D27D7D",
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  discountBadge: {
    backgroundColor: "#D27D7D",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  promoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  promoDetails: {
    marginBottom: 12,
  },
  promoDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  promoCondition: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  applyButton: {
    backgroundColor: "#D27D7D",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#D27D7D",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#D27D7D",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default PromotionsScreen;
