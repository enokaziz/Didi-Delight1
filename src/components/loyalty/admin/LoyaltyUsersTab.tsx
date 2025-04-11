import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LoyaltyPoints } from "../../../types/loyaltyPoints";
import { FontAwesome5 } from "@expo/vector-icons";
import { formatDate } from "../../../utils/loyaltyUtils";

interface LoyaltyUsersTabProps {
  users: LoyaltyPoints[];
  loading: boolean;
  onRefresh: () => void;
  onSelectUser: (user: LoyaltyPoints) => void;
}

const LoyaltyUsersTab: React.FC<LoyaltyUsersTabProps> = ({
  users,
  loading,
  onRefresh,
  onSelectUser,
}) => {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "bronze":
        return <FontAwesome5 name="medal" size={16} color="#CD7F32" />;
      case "silver":
        return <FontAwesome5 name="medal" size={16} color="#C0C0C0" />;
      case "gold":
        return <FontAwesome5 name="medal" size={16} color="#FFD700" />;
      case "platinum":
        return <FontAwesome5 name="crown" size={16} color="#E5E4E2" />;
      default:
        return <FontAwesome5 name="medal" size={16} color="#CD7F32" />;
    }
  };

  const renderUserItem = ({ item }: { item: LoyaltyPoints }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => onSelectUser(item)}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName || "Utilisateur"}</Text>
          <Text style={styles.userEmail}>
            {item.userEmail || "Aucun email"}
          </Text>
        </View>
        <View style={styles.levelContainer}>
          {getLevelIcon(item.level)}
          <Text style={styles.levelText}>
            {item.level && typeof item.level === 'string' ? item.level.charAt(0).toUpperCase() + item.level.slice(1) : 'Bronze'}
          </Text>
        </View>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.pointsLabel}>Points actuels</Text>
        <Text style={styles.pointsValue}>{item.points}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total gagné</Text>
          <Text style={styles.statValue}>{item.totalPointsEarned}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total utilisé</Text>
          <Text style={styles.statValue}>{item.totalPointsRedeemed}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Achats</Text>
          <Text style={styles.statValue}>{item.purchaseCount}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Dernier achat:{" "}
          {item.lastPurchaseDate ? formatDate(item.lastPurchaseDate) : "Aucun"}
        </Text>
        <FontAwesome5 name="chevron-right" size={14} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F04E98" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="users" size={50} color="#ddd" />
          <Text style={styles.emptyText}>
            Aucun utilisateur avec des points de fidélité
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
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

      <View style={styles.helpTextContainer}>
        <Text style={styles.helpText}>
          Appuyez sur un utilisateur pour ajouter ou retirer des points
        </Text>
      </View>
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
  listContent: {
    padding: 16,
  },
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
    color: "#555",
  },
  pointsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEE7F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#F04E98",
    fontWeight: "500",
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F04E98",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
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
  helpTextContainer: {
    padding: 16,
    alignItems: "center",
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});

export default LoyaltyUsersTab;
