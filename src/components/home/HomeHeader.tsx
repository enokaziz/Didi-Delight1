// components/home/HomeHeader.tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "../../theme/theme";

interface HomeHeaderProps {
  title: string;
  productsCount: number;
  onResetFilters?: () => void;
  showReset?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  title, 
  productsCount, 
  onResetFilters,
  showReset = false
}) => {
  const translateY = new Animated.Value(-50);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          opacity 
        }
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{productsCount}</Text>
        </View>
      </View>
      
      {showReset && (
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={onResetFilters}
          activeOpacity={0.7}
        >
          <MaterialIcons name="refresh" size={18} color={COLORS.primary.main} />
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.text.primary,
  },
  badge: {
    backgroundColor: COLORS.primary.main,
    borderRadius: 50,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.paper,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  resetText: {
    color: COLORS.primary.main,
    marginLeft: SPACING.xs,
    fontWeight: "500",
  },
});

export default HomeHeader;