// components/home/CategoryFilter.tsx
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,

  selectedCategory,
  onSelectCategory,
}) => {
  // Ajouter l'option "Tous" au début
  const allCategories = ["Tous", ...categories];

  // Fonction qui assigne automatiquement une icône en fonction du texte de la catégorie
  const getAutomaticCategoryIcon = (category: string): string => {
    // Pour la catégorie "Tous"
    if (category.toLowerCase() === "tous") return "grid-outline";

    // Convertir en minuscules pour les comparaisons
    const text = category.toLowerCase();

    // Mots-clés associés à des icônes (ajoutez ou modifiez selon vos catégories)
    const keywordMap: Record<string, string> = {
      // Nourriture et boissons
      boisson: "wine-outline",
      eau: "water-outline",
      jus: "wine-outline",
      alcool: "beer-outline",
      vin: "wine-outline",
      café: "cafe-outline",
      thé: "cafe-outline",

      // Aliments
      fruit: "nutrition-outline",
      légume: "leaf-outline",
      viande: "fast-food-outline",
      poisson: "fish-outline",
      épice: "flame-outline",
      dessert: "ice-cream-outline",
      pain: "restaurant-outline",
      pâtisserie: "ice-cream-outline",
      gâteau: "ice-cream-outline",
      chocolat: "cafe-outline",
      bonbon: "ice-cream-outline",
      sucre: "cafe-outline",

      // Vêtements
      vêtement: "shirt-outline",
      chaussure: "footsteps-outline",
      accessoire: "watch-outline",
      bijou: "diamond-outline",
      chapeau: "shirt-outline",

      // Électronique
      électronique: "phone-portrait-outline",
      téléphone: "phone-portrait-outline",
      ordinateur: "laptop-outline",
      tablette: "tablet-portrait-outline",
      télévision: "tv-outline",
      audio: "musical-notes-outline",
      musique: "musical-notes-outline",

      // Maison
      maison: "home-outline",
      meuble: "bed-outline",
      cuisine: "restaurant-outline",
      "salle de bain": "water-outline",
      jardin: "leaf-outline",
      décoration: "color-palette-outline",

      // Beauté
      beauté: "color-palette-outline",
      cosmétique: "color-palette-outline",
      parfum: "color-palette-outline",
      soin: "color-palette-outline",
      maquillage: "color-palette-outline",

      // Autres
      livre: "book-outline",
      sport: "football-outline",
      jouet: "game-controller-outline",
      enfant: "people-outline",
      bébé: "people-outline",
      animal: "paw-outline",
      santé: "medkit-outline",
      médicament: "medkit-outline",
      bureau: "briefcase-outline",
      papeterie: "document-outline",
    };

    // Chercher si un mot-clé est présent dans le texte de la catégorie
    for (const [keyword, icon] of Object.entries(keywordMap)) {
      if (text.includes(keyword)) {
        return icon;
      }
    }

    // Assignation déterministe basée sur la première lettre si aucun mot-clé ne correspond
    const firstChar = text.charAt(0);
    const charCode = firstChar.charCodeAt(0);

    // Liste d'icônes génériques pour les catégories sans correspondance
    const genericIcons = [
      "pricetag-outline",
      "cube-outline",
      "basket-outline",
      "gift-outline",
      "bag-outline",
      "cart-outline",
      "storefront-outline",
      "star-outline",
      "bookmark-outline",
      "heart-outline",
    ];

    // Utiliser le code du caractère pour sélectionner une icône de manière déterministe
    const iconIndex = charCode % genericIcons.length;
    return genericIcons[iconIndex];
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allCategories.map((category) => {
          const isActive =
            selectedCategory === (category === "Tous" ? null : category);
          const iconName = getAutomaticCategoryIcon(category);

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                isActive && styles.activeCategoryButton,
              ]}
              onPress={() =>
                onSelectCategory(category === "Tous" ? null : category)
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={18}
                color={isActive ? "#FFF" : COLORS.text.secondary}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#FFF",
    fontWeight: "600",
  },
});

export default CategoryFilter;
