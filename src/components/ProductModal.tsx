"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { Product } from "../types/Product";

interface ProductModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  newProductName: string;
  setNewProductName: (name: string) => void;
  newProductPrice: string;
  setNewProductPrice: (price: string) => void;
  newProductCategory: string;
  setNewProductCategory: (category: string) => void;
  handleAddProduct: () => void;
  handleUpdateProduct: () => void;
  editingProduct: Product | null;
}

// Catégories prédéfinies pour la pâtisserie
const PREDEFINED_CATEGORIES = [
  "Gâteaux",
  "Tartes",
  "Viennoiseries",
  "Pâtisseries",
  "Biscuits",
  "Chocolats",
  "Glaces",
  "Boissons",
  "Spécialités",
];

const ProductModalPro: React.FC<ProductModalProps> = ({
  isVisible,
  onDismiss,
  newProductName,
  setNewProductName,
  newProductPrice,
  setNewProductPrice,
  newProductCategory,
  setNewProductCategory,
  handleAddProduct,
  handleUpdateProduct,
  editingProduct,
}) => {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(
    PREDEFINED_CATEGORIES
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    price: false,
  });

  useEffect(() => {
    // Filtrer les catégories en fonction de la saisie
    if (newProductCategory) {
      setFilteredCategories(
        PREDEFINED_CATEGORIES.filter((cat) =>
          cat.toLowerCase().includes(newProductCategory.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(PREDEFINED_CATEGORIES);
    }

    // Valider le formulaire
    const nameValid = newProductName.trim().length > 0;
    const priceValid = /^\d+(\.\d{1,2})?$/.test(newProductPrice);

    setIsFormValid(nameValid && priceValid);
    setErrors({
      name: !nameValid && newProductName.length > 0,
      price: !priceValid && newProductPrice.length > 0,
    });
  }, [newProductName, newProductPrice, newProductCategory]);

  const handleCategorySelect = (category: string) => {
    setNewProductCategory(category);
    setShowCategorySelector(false);
  };

  const handleSubmit = () => {
    if (isFormValid) {
      if (editingProduct) {
        handleUpdateProduct();
      } else {
        handleAddProduct();
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onDismiss}
      transparent
      animationType="fade"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.backdrop} onPress={onDismiss} />

        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informations produit</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput
                placeholder="Entrez le nom du produit"
                value={newProductName}
                onChangeText={setNewProductName}
                style={[styles.input, errors.name && styles.inputError]}
                accessibilityLabel="Nom du produit"
              />
              {errors.name && (
                <Text style={styles.errorText}>
                  Veuillez entrer un nom valide
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Prix *</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  placeholder="0.00"
                  value={newProductPrice}
                  onChangeText={setNewProductPrice}
                  style={[styles.priceInput, errors.price && styles.inputError]}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Prix du produit"
                />
                <Text style={styles.currencyLabel}>FCFA</Text>
              </View>
              {errors.price && (
                <Text style={styles.errorText}>
                  Veuillez entrer un prix valide
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Catégorie</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategorySelector(!showCategorySelector)}
              >
                <TextInput
                  placeholder="Sélectionnez ou saisissez une catégorie"
                  value={newProductCategory}
                  onChangeText={setNewProductCategory}
                  style={styles.categoryInput}
                  accessibilityLabel="Catégorie du produit"
                  onFocus={() => setShowCategorySelector(true)}
                />
                <MaterialIcons
                  name={
                    showCategorySelector ? "arrow-drop-up" : "arrow-drop-down"
                  }
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {showCategorySelector && (
                <View style={styles.categoriesList}>
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => handleCategorySelect(item)}
                      >
                        <Text style={styles.categoryItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 150 }}
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !isFormValid && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid}
            >
              <Text style={styles.submitButtonText}>
                {editingProduct ? "Mettre à jour" : "Ajouter"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F04E98",
  },
  closeButton: {
    padding: 4,
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  currencyLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingRight: 12,
  },
  categoryInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  categoriesList: {
    marginTop: 4,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    maxHeight: 150,
    overflow: "hidden",
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryItemText: {
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#F04E98",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default ProductModalPro;
