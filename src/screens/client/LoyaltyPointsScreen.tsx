import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { loyaltyPointsService } from "../../services/loyalty/loyaltyPointsService";
import {
  LoyaltyPoints,
  LoyaltyReward,
  LoyaltyTransaction,
} from "../../types/loyaltyPoints";
import { FontAwesome5 } from "@expo/vector-icons";
import { formatDate } from "../../utils/loyaltyUtils";
import { useNavigation } from "@react-navigation/native";
import RewardDetailsModal from "../../components/loyalty/client/RewardDetailsModal";

const LoyaltyPointsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState({
    points: true,
    rewards: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(
    null
  );
  const [rewardModalVisible, setRewardModalVisible] = useState(false);

  const fetchData = async () => {
    if (!user) {
      console.log('Aucun utilisateur connecté');
      return;
    }
    
    console.log('Récupération des données pour l\'utilisateur:', user.uid);

    try {
      setLoading((prev) => ({ ...prev, points: true }));

      // Récupérer les points de l'utilisateur
      console.log('Tentative de récupération des points pour:', user.uid);
      let points = await loyaltyPointsService.getUserPoints(user.uid);
      console.log('Points récupérés:', points);

      // Initialiser les points si l'utilisateur n'en a pas
      if (!points) {
        console.log('Initialisation des points pour un nouvel utilisateur');
        try {
        points = await loyaltyPointsService.initializeUserPoints(
          user.uid,
          user.displayName || undefined,
          user.email || undefined
        );
        } catch (initError) {
          console.error('Erreur lors de l\'initialisation des points:', initError);
          // Créer un objet de points par défaut en cas d'échec
          points = {
            id: user.uid,
            userId: user.uid,
            userName: user.displayName || 'Utilisateur',
            userEmail: user.email || undefined,
            points: 0,
            totalPointsEarned: 0,
            totalPointsRedeemed: 0,
            level: 'bronze',
            history: [],
            purchaseCount: 0,
            totalSpent: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
      }

      setLoyaltyData(points);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des points de fidélité:",
        error
      );
    } finally {
      setLoading((prev) => ({ ...prev, points: false }));
    }

    try {
      setLoading((prev) => ({ ...prev, rewards: true }));

      // Récupérer les récompenses actives uniquement
      const availableRewards = await loyaltyPointsService.getAllRewards(true);
      setRewards(availableRewards);
    } catch (error) {
      console.error("Erreur lors de la récupération des récompenses:", error);
    } finally {
      setLoading((prev) => ({ ...prev, rewards: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleRewardPress = (reward: LoyaltyReward) => {
    setSelectedReward(reward);
    setRewardModalVisible(true);
  };

  const handleCloseRewardModal = () => {
    setRewardModalVisible(false);
    setSelectedReward(null);
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!user) return false;

    try {
      const success = await loyaltyPointsService.redeemReward(
        user.uid,
        rewardId
      );

      if (success) {
        // Recharger les données après l'échange
        await fetchData();
        handleCloseRewardModal();
      }

      return success;
    } catch (error) {
      console.error("Erreur lors de l'échange de la récompense:", error);
      return false;
    }
  };

  const getLevelIcon = (level: string | undefined) => {
    // S'assurer que level est défini
    const safeLevel = level || "bronze";
    switch (safeLevel) {
      case "bronze":
        return <FontAwesome5 name="medal" size={20} color="#CD7F32" />;
      case "silver":
        return <FontAwesome5 name="medal" size={20} color="#C0C0C0" />;
      case "gold":
        return <FontAwesome5 name="medal" size={20} color="#FFD700" />;
      case "platinum":
        return <FontAwesome5 name="crown" size={20} color="#E5E4E2" />;
      default:
        return <FontAwesome5 name="medal" size={20} color="#CD7F32" />;
    }
  };

  const renderTransactionItem = ({ item }: { item: LoyaltyTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionType}>
          {item.type === "earn" ? (
            <FontAwesome5 name="plus-circle" size={16} color="#4caf50" />
          ) : (
            <FontAwesome5 name="minus-circle" size={16} color="#f44336" />
          )}
          <Text
            style={[
              styles.transactionPoints,
              item.type === "earn"
                ? styles.pointsEarned
                : styles.pointsRedeemed,
            ]}
          >
            {item.type === "earn" ? "+" : "-"}
            {Math.abs(item.points)} points
          </Text>
        </View>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.transactionDescription}>{item.description}</Text>
      <View style={styles.transactionSource}>
        <FontAwesome5
          name={
            item.source === "purchase"
              ? "shopping-cart"
              : item.source === "reward"
                ? "gift"
                : item.source === "promotion"
                  ? "tag"
                  : item.source === "referral"
                    ? "user-friends"
                    : item.source === "birthday"
                      ? "birthday-cake"
                      : "hand-holding"
          }
          size={12}
          color="#999"
        />
        <Text style={styles.transactionSourceText}>
          {item.source === "purchase"
            ? "Achat"
            : item.source === "reward"
              ? "Récompense"
              : item.source === "promotion"
                ? "Promotion"
                : item.source === "referral"
                  ? "Parrainage"
                  : item.source === "birthday"
                    ? "Anniversaire"
                    : "Manuel"}
        </Text>
      </View>
    </View>
  );

  const renderRewardItem = ({ item }: { item: LoyaltyReward }) => (
    <TouchableOpacity
      style={[
        styles.rewardItem,
        loyaltyData &&
          loyaltyData.points < item.pointsCost &&
          styles.rewardItemDisabled,
      ]}
      onPress={() => handleRewardPress(item)}
      disabled={loyaltyData ? loyaltyData.points < item.pointsCost : true}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.rewardImage} />
      ) : (
        <View style={styles.rewardImagePlaceholder}>
          <FontAwesome5
            name={
              item.type === "discount"
                ? "percent"
                : item.type === "freeProduct"
                  ? "gift"
                  : item.type === "freeDelivery"
                    ? "shipping-fast"
                    : item.type === "exclusive"
                      ? "star"
                      : "calendar-alt"
            }
            size={30}
            color="#F04E98"
          />
        </View>
      )}
      <View style={styles.rewardContent}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.rewardPointsContainer}>
          <FontAwesome5 name="coins" size={14} color="#F04E98" />
          <Text style={styles.rewardPoints}>{item.pointsCost} points</Text>
        </View>
      </View>
      {loyaltyData && loyaltyData.points < item.pointsCost && (
        <View style={styles.rewardLocked}>
          <FontAwesome5 name="lock" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading.points && !loyaltyData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F04E98" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#F04E98"]}
        />
      }
    >
      {/* Section du solde et du niveau */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <Text style={styles.pointsHeaderText}>Mes Points de Fidélité</Text>
        </View>
        <View style={styles.pointsContent}>
          <View style={styles.pointsBalanceContainer}>
            <Text style={styles.pointsBalance}>{loyaltyData?.points || 0}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
          <View style={styles.levelContainer}>
            {getLevelIcon(loyaltyData?.level)}
            <Text style={styles.levelText}>
              Niveau{" "}
              {loyaltyData && loyaltyData.level && typeof loyaltyData.level === 'string'
                ? loyaltyData.level.charAt(0).toUpperCase() +
                  loyaltyData.level.slice(1)
                : "Bronze"}
            </Text>
          </View>
        </View>
      </View>

      {/* Section des récompenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Récompenses disponibles</Text>
        </View>

        {loading.rewards ? (
          <ActivityIndicator
            size="small"
            color="#F04E98"
            style={styles.loadingIndicator}
          />
        ) : rewards.length > 0 ? (
          <FlatList
            data={rewards}
            renderItem={renderRewardItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rewardsList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <FontAwesome5 name="gift" size={40} color="#ddd" />
            <Text style={styles.emptyStateText}>
              Aucune récompense disponible pour le moment
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllButtonText}>
            Voir toutes les récompenses
          </Text>
          <FontAwesome5 name="chevron-right" size={12} color="#F04E98" />
        </TouchableOpacity>
      </View>

      {/* Section de l'historique des transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique des transactions</Text>
        </View>

        {loyaltyData?.history && loyaltyData.history.length > 0 ? (
          loyaltyData.history
            .slice()
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5)
            .map((transaction) => (
              <View key={transaction.id}>
                {renderTransactionItem({ item: transaction })}
              </View>
            ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <FontAwesome5 name="history" size={40} color="#ddd" />
            <Text style={styles.emptyStateText}>
              Aucune transaction pour le moment
            </Text>
          </View>
        )}

        {loyaltyData?.history && loyaltyData.history.length > 5 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Voir tout l'historique</Text>
            <FontAwesome5 name="chevron-right" size={12} color="#F04E98" />
          </TouchableOpacity>
        )}
      </View>

      {/* Section d'information sur le programme */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Comment gagner des points ?</Text>

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="shopping-bag" size={16} color="#F04E98" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoItemTitle}>Achats</Text>
            <Text style={styles.infoItemText}>
              Gagnez des points à chaque achat
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="user-friends" size={16} color="#F04E98" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoItemTitle}>Parrainage</Text>
            <Text style={styles.infoItemText}>
              Invitez vos amis et gagnez des points
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="birthday-cake" size={16} color="#F04E98" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoItemTitle}>Anniversaire</Text>
            <Text style={styles.infoItemText}>
              Recevez un bonus le jour de votre anniversaire
            </Text>
          </View>
        </View>
      </View>

      {/* Modale de détails de récompense */}
      <RewardDetailsModal
        visible={rewardModalVisible}
        reward={selectedReward}
        userPoints={loyaltyData?.points || 0}
        onClose={handleCloseRewardModal}
        onRedeem={handleRedeemReward}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  pointsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  pointsHeader: {
    backgroundColor: "#F04E98",
    padding: 16,
  },
  pointsHeaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  pointsContent: {
    padding: 20,
    alignItems: "center",
  },
  pointsBalanceContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  pointsBalance: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
  },
  pointsLabel: {
    fontSize: 16,
    color: "#666",
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  rewardsList: {
    paddingBottom: 8,
  },
  rewardItem: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  rewardItemDisabled: {
    opacity: 0.6,
  },
  rewardImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  rewardImagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardContent: {
    padding: 12,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  rewardPointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardPoints: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F04E98",
    marginLeft: 4,
  },
  rewardLocked: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionType: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionPoints: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  pointsEarned: {
    color: "#4caf50",
  },
  pointsRedeemed: {
    color: "#f44336",
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
  },
  transactionDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  transactionSource: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionSourceText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: "#F04E98",
    marginRight: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 15,
    margin: 16,
    marginTop: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE7F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  infoItemText: {
    fontSize: 12,
    color: "#666",
  },
});

export default LoyaltyPointsScreen;
