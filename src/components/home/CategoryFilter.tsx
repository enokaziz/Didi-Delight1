// components/home/CategoryFilter.tsx
import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from "../../theme/theme";
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

  // Icônes pour chaque catégorie (exemple)
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case "tous": return "grid-outline";
      case "électronique": return "phone-portrait-outline";
      case "vêtements": return "shirt-outline";
      case "maison": return "home-outline";
      case "beauté": return "color-palette-outline";
      case "alimentation": return "fast-food-outline";
      default: return "pricetag-outline";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allCategories.map((category) => {
          const isActive = selectedCategory === (category === "Tous" ? null : category);
          const iconName = getCategoryIcon(category);
          
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
              onPress={() => onSelectCategory(category === "Tous" ? null : category)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={iconName as any} 
                size={18} 
                color={isActive ? "#FFF" : COLORS.text.secondary} 
                style={styles.categoryIcon}
              />
              <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
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