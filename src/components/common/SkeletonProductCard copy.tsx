// components/common/SkeletonProductCard.tsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../theme/theme";

const SkeletonProductCard = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.image, 
          { opacity: fadeAnim }
        ]} 
      />
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.categoryBar, 
            { opacity: fadeAnim }
          ]} 
        />
        <Animated.View 
          style={[
            styles.titleBar, 
            { opacity: fadeAnim }
          ]} 
        />
        <Animated.View 
          style={[
            styles.titleBarShort, 
            { opacity: fadeAnim }
          ]} 
        />
        <Animated.View 
          style={[
            styles.priceBar, 
            { opacity: fadeAnim }
          ]} 
        />
        <Animated.View 
          style={[
            styles.button, 
            { opacity: fadeAnim }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.secondary.main,
  },
  content: {
    padding: SPACING.sm,
  },
  categoryBar: {
    width: "40%",
    height: 10,
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  titleBar: {
    width: "100%",
    height: 14,
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.xs,
  },
  titleBarShort: {
    width: "70%",
    height: 14,
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  priceBar: {
    width: "50%",
    height: 18,
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.sm,
  },
  button: {
    width: "100%",
    height: 36,
    backgroundColor: COLORS.secondary.main,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default SkeletonProductCard;