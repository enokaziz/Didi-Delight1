// src/components/home/SortPicker.tsx
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="sort" size={24} color={COLORS.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(value) => {
                onValueChange(value);
                setIsModalVisible(false); // Ferme le modal après sélection
              }}
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
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Fond semi-transparent
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: SPACING.xl, // Position sous le header
    paddingRight: SPACING.md,
  },
  dropdownContainer: {
    width: 200, // Largeur fixe pour le menu
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  picker: {
    width: "100%",
    color: COLORS.text.primary,
  },
});

export default SortPicker;