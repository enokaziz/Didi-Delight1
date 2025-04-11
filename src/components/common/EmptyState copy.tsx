// components/common/EmptyState.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../theme/theme";

interface EmptyStateProps {
  type: "search" | "empty" | "error";
  title?: string;
  message?: string;
  searchQuery?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  searchQuery = "",
  onAction,
  actionLabel = "Réessayer",
}) => {
  const getContent = () => {
    switch (type) {
      case "search":
        return {
          image: require("../../assets/images/empty-search.png"), // Créez ou importez cette image
          title: title || "Aucun résultat",
          message: message || `Aucun produit ne correspond à "${searchQuery}"`,
          icon: "search-outline",
          actionLabel: "Effacer la recherche",
        };
      case "error":
        return {
          image: require("../../assets/images/error.png"), // Créez ou importez cette image
          title: title || "Oups !",
          message: message || "Une erreur s'est produite. Veuillez réessayer.",
          icon: "refresh-outline",
          actionLabel: "Réessayer",
        };
      default:
        return {
          image: require("../../assets/images/empty-cart.png"), // Créez ou importez cette image
          title: title || "Catalogue vide",
          message: message || "Aucun produit n'est disponible pour le moment",
          icon: "add-circle-outline",
          actionLabel: "Actualiser",
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <Image source={content.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.message}>{content.message}</Text>
      
      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Ionicons name={content.icon as any} size={20} color="#FFF" />
          <Text style={styles.buttonText}>{actionLabel || content.actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary.main,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
});

export default EmptyState;