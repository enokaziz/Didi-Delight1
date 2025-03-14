// src/components/home/SortPicker.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from "../../theme/theme";
import { MaterialIcons } from "@expo/vector-icons";

interface SortOption {
  label: string;
  value: string | null;
}

interface SortPickerProps {
  selectedValue: string | null;
  onValueChange: (value: string | null) => void;
  options?: SortOption[];
}

const SortPicker: React.FC<SortPickerProps> = ({
  selectedValue,
  onValueChange,
  options = [
    { label: "Trier par...", value: null },
    { label: "Prix croissant", value: "priceAsc" },
    { label: "Prix décroissant", value: "priceDesc" },
    { label: "Nom (A-Z)", value: "nameAsc" },
  ],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MaterialIcons name="sort" size={18} color={COLORS.text.secondary} />
        <Text style={styles.label}>Trier:</Text>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={COLORS.text.secondary}
          accessibilityLabel="Trier les produits"
        >
          {options.map((option) => (
            <Picker.Item 
              key={option.value || "default"} 
              label={option.label} 
              value={option.value} 
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.caption,
    marginLeft: SPACING.xs,
    fontWeight: "bold", // or any other valid value like "400", "700", etc.
  },
  pickerContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background.card,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  picker: {
    height: 45,
    width: "100%",
    color: COLORS.text.primary,
  },
});

export default SortPicker;