// components/common/SearchBar.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../theme/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  onFocus,
  onBlur,
  placeholder = "Rechercher des produits...",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedWidth = new Animated.Value(0);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedWidth, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    if (onBlur) onBlur();
  };

  const borderWidth = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const borderColor = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary.main],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          borderWidth,
          borderColor,
        }
      ]}
    >
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? COLORS.primary.main : COLORS.text.light} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.light}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={onClear} 
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={COLORS.text.light} 
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 30,
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: COLORS.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: SPACING.xs,
  },
});

export default SearchBar;