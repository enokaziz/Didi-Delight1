import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { LoyaltyReward } from "../../../types/loyaltyPoints";
import { FontAwesome5 } from "@expo/vector-icons";
import { formatDate } from "../../../utils/loyaltyUtils";

interface LoyaltyRewardsTabProps {
  rewards: LoyaltyReward[];
  loading: boolean;
  onRefresh: () => void;
  onAddReward: () => void;
  onEditReward: (reward: LoyaltyReward) => void;
  onDeleteReward: (rewardId: string) => Promise<boolean>;
}

const LoyaltyRewardsTab: React.FC<LoyaltyRewardsTabProps> = ({
  rewards,
  loading,
  onRefresh,
  onAddReward,
  onEditReward,
  onDeleteReward,
}) => {
  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case "discount":
        return <FontAwesome5 name="percent" size={16} color="#F04E98" />;
      case "freeProduct":
        return <FontAwesome5 name="gift" size={16} color="#F04E98" />;
      case "freeDelivery":
        return <FontAwesome5 name="shipping-fast" size={16} color="#F04E98" />;
      case "exclusive":
        return <FontAwesome5 name="star" size={16} color="#F04E98" />;
      case "event":
        return <FontAwesome5 name="calendar-alt" size={16} color="#F04E98" />;
      default:
        return <FontAwesome5 name="gift" size={16} color="#F04E98" />;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case "discount":
        return "Réduction";
      case "freeProduct":
        return "Produit gratuit";
      case "freeDelivery":
        return "Livraison gratuite";
      case "exclusive":
        return "Offre exclusive";
      case "event":
        return "Événement";
      default:
        return "Autre";
    }
  };

  const renderRewardItem = ({ item }: { item: LoyaltyReward }) => (
    <TouchableOpacity
      style={[styles.rewardCard, !item.active && styles.inactiveCard]}
      onPress={() => onEditReward(item)}
    >
      <View style={styles.rewardHeader}>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardName}>{item.name}</Text>
          <View style={styles.typeContainer}>
            {getRewardTypeIcon(item.type)}
            <Text style={styles.typeText}>{getRewardTypeLabel(item.type)}</Text>
          </View>
        </View>
        {!item.active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveText}>Inactif</Text>
          </View>
        )}
      </View>

      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.rewardImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.rewardDescription}>{item.description}</Text>

      <View style={styles.pointsCostContainer}>
        <FontAwesome5 name="coins" size={16} color="#F04E98" />
        <Text style={styles.pointsCost}>{item.pointsCost} points</Text>
      </View>

      {item.type === "discount" && item.discountValue && (
        <View style={styles.discountContainer}>
          <Text style={styles.discountText}>
            Réduction de {item.discountValue}%
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Créé le: {formatDate(item.createdAt)}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteReward(item.id)}
        >
          <FontAwesome5 name="trash-alt" size={16} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && rewards.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F04E98" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={onAddReward}>
        <FontAwesome5 name="plus" size={16} color="white" />
        <Text style={styles.addButtonText}>Ajouter une récompense</Text>
      </TouchableOpacity>

      {rewards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="gift" size={50} color="#ddd" />
          <Text style={styles.emptyText}>Aucune récompense disponible</Text>
          <Text style={styles.emptySubtext}>
            Créez des récompenses pour que vos clients puissent échanger leurs
            points
          </Text>
        </View>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          renderItem={renderRewardItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={["#F04E98"]}
            />
          }
        />
      )}
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  rewardCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  typeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  inactiveBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 12,
    color: "#999",
  },
  rewardImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  pointsCostContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE7F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pointsCost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F04E98",
    marginLeft: 8,
  },
  discountContainer: {
    backgroundColor: "#e9f5ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  discountText: {
    fontSize: 14,
    color: "#0077cc",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F04E98",
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
});

export default LoyaltyRewardsTab;
