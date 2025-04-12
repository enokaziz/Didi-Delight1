import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Modal,
  Platform,
} from "react-native";
import {
  promotionService,
  Promotion,
} from "../../services/promotions/promotionService";
import { DatePickerInput } from "react-native-paper-dates";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Picker } from "@react-native-picker/picker";
import { Product } from "../../types/Product";
import { getProducts } from "../../firebase/productService";

const PromotionManagementScreen: React.FC = () => {
  // États pour la liste des promotions et le chargement
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // État pour le formulaire de nouvelle promotion
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Par défaut, 1 mois de validité
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    minimumPurchase: 0,
    usageLimit: 0,
    conditions: "",
    active: true,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
  });

  // États pour les modales
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPromotions();
    fetchProductsAndCategories();
  }, []);

  // Charger les produits et extraire les catégories uniques
  const fetchProductsAndCategories = async () => {
    try {
      const allProducts = await getProducts();
      setProducts(allProducts);

      // Extraire les catégories uniques
      const uniqueCategories = Array.from(
        new Set(allProducts.map((product) => product.category))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      Alert.alert("Erreur", "Impossible de charger les produits");
    }
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const allPromotions = await promotionService.getActivePromotions();
      setPromotions(allPromotions);
    } catch (error) {
      console.error("Erreur lors du chargement des promotions:", error);
      Alert.alert("Erreur", "Impossible de charger les promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    if (!newPromo.title || !newPromo.startDate || !newPromo.endDate) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (newPromo.startDate > newPromo.endDate) {
      Alert.alert(
        "Erreur",
        "La date de fin doit être postérieure à la date de début"
      );
      return;
    }

    if (
      newPromo.discountType &&
      (newPromo.discountValue <= 0 ||
        (newPromo.discountType === "percentage" &&
          newPromo.discountValue > 100))
    ) {
      Alert.alert("Erreur", "Veuillez entrer une valeur de remise valide");
      return;
    }

    // Création d'un objet de base avec les champs obligatoires
    const promotionData: any = {
      title: newPromo.title,
      description: newPromo.description,
      startDate: newPromo.startDate,
      endDate: newPromo.endDate,
      active: newPromo.active,
      discountType: newPromo.discountType,
      discountValue: newPromo.discountValue,
    };

    // Ajout conditionnel des champs optionnels (uniquement s'ils ont des valeurs)
    if (newPromo.minimumPurchase > 0) {
      promotionData.minimumPurchase = newPromo.minimumPurchase;
    }

    if (newPromo.usageLimit > 0) {
      promotionData.usageLimit = newPromo.usageLimit;
    }

    if (newPromo.conditions && newPromo.conditions.trim() !== "") {
      promotionData.conditions = newPromo.conditions.trim();
    }

    if (newPromo.applicableProducts && newPromo.applicableProducts.length > 0) {
      promotionData.applicableProducts = newPromo.applicableProducts;
    }

    if (
      newPromo.applicableCategories &&
      newPromo.applicableCategories.length > 0
    ) {
      promotionData.applicableCategories = newPromo.applicableCategories;
    }

    try {
      const createdPromo =
        await promotionService.createPromotion(promotionData);
      setPromotions([...promotions, createdPromo]);

      // Réinitialiser le formulaire
      setNewPromo({
        title: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: 10,
        minimumPurchase: 0,
        usageLimit: 0,
        conditions: "",
        active: true,
        applicableProducts: [],
        applicableCategories: [],
      });

      setSelectedProducts([]);
      setSelectedCategories([]);

      Alert.alert("Succès", "Promotion créée avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de la promotion:", error);
      Alert.alert("Erreur", "Échec de la création de la promotion");
    }
  };

  const togglePromotionActive = async (promotion: Promotion) => {
    try {
      await promotionService.updatePromotion(promotion.id, {
        active: !promotion.active,
      });
      setPromotions(
        promotions.map((p) =>
          p.id === promotion.id ? { ...p, active: !p.active } : p
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la promotion:", error);
      Alert.alert("Erreur", "Échec de la mise à jour");
    }
  };

  // Fonctions pour gérer la sélection des produits
  const handleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const confirmProductSelection = () => {
    setNewPromo({
      ...newPromo,
      applicableProducts: selectedProducts,
    });
    setShowProductSelector(false);
  };

  // Fonctions pour gérer la sélection des catégories
  const handleCategorySelection = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const confirmCategorySelection = () => {
    setNewPromo({
      ...newPromo,
      applicableCategories: selectedCategories,
    });
    setShowCategorySelector(false);
  };

  // Fonction pour formater l'affichage des produits sélectionnés
  const getSelectedProductsText = () => {
    if (newPromo.applicableProducts.length === 0)
      return "Aucun produit sélectionné";

    return newPromo.applicableProducts
      .map((id) => {
        const product = products.find((p) => p.id === id);
        return product ? product.name : id;
      })
      .join(", ");
  };

  // Fonction pour formater l'affichage des catégories sélectionnées
  const getSelectedCategoriesText = () => {
    if (newPromo.applicableCategories.length === 0)
      return "Aucune catégorie sélectionnée";

    return newPromo.applicableCategories.join(", ");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌸 Gestion des Promotions 🌸</Text>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations générales</Text>

          <TextInput
            style={styles.input}
            placeholder="Titre de la promotion"
            value={newPromo.title}
            onChangeText={(text) => setNewPromo({ ...newPromo, title: text })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description détaillée"
            value={newPromo.description}
            onChangeText={(text) =>
              setNewPromo({ ...newPromo, description: text })
            }
            multiline
            numberOfLines={4}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Promotion active</Text>
            <Switch
              value={newPromo.active}
              onValueChange={(value) =>
                setNewPromo({ ...newPromo, active: value })
              }
              trackColor={{ false: "#767577", true: "#D27D7D" }}
              thumbColor={newPromo.active ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Période de validité</Text>

          <Text style={styles.inputLabel}>Date de début</Text>
          <DatePickerInput
            locale="fr"
            label="Date de début"
            value={newPromo.startDate}
            onChange={(date) =>
              date && setNewPromo({ ...newPromo, startDate: date })
            }
            inputMode="start"
            style={styles.datePicker}
            mode="outlined"
          />

          <Text style={styles.inputLabel}>Date de fin</Text>
          <DatePickerInput
            locale="fr"
            label="Date de fin"
            value={newPromo.endDate}
            onChange={(date) =>
              date && setNewPromo({ ...newPromo, endDate: date })
            }
            inputMode="end"
            style={styles.datePicker}
            mode="outlined"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Détails de la remise</Text>

          <View style={styles.row}>
            <View style={styles.pickerContainer}>
              <Text style={styles.inputLabel}>Type de remise</Text>
              <Picker
                selectedValue={newPromo.discountType}
                onValueChange={(value) =>
                  setNewPromo({
                    ...newPromo,
                    discountType: value as "percentage" | "fixed",
                  })
                }
                style={styles.picker}
              >
                <Picker.Item label="Pourcentage (%)" value="percentage" />
                <Picker.Item label="Montant fixe (F CFA)" value="fixed" />
              </Picker>
            </View>

            <View style={styles.valueContainer}>
              <Text style={styles.inputLabel}>Valeur</Text>
              <View style={styles.valueInputContainer}>
                <TextInput
                  style={styles.valueInput}
                  placeholder="Valeur"
                  value={newPromo.discountValue.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 0;
                    setNewPromo({ ...newPromo, discountValue: value });
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <Text style={styles.valueUnit}>
                  {newPromo.discountType === "percentage" ? "%" : "F CFA"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Montant minimum d'achat (F CFA)</Text>
          <View style={styles.numericInputContainer}>
            <TextInput
              style={styles.numericInput}
              placeholder="Montant minimum (optionnel)"
              value={
                newPromo.minimumPurchase > 0
                  ? newPromo.minimumPurchase.toString()
                  : ""
              }
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                setNewPromo({ ...newPromo, minimumPurchase: value });
              }}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            {newPromo.minimumPurchase > 0 && (
              <Text style={styles.numericUnit}>F CFA</Text>
            )}
          </View>

          <Text style={styles.inputLabel}>Limite d'utilisation</Text>
          <View style={styles.numericInputContainer}>
            <TextInput
              style={styles.numericInput}
              placeholder="Nombre maximum d'utilisations (optionnel)"
              value={
                newPromo.usageLimit > 0 ? newPromo.usageLimit.toString() : ""
              }
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setNewPromo({ ...newPromo, usageLimit: value });
              }}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            {newPromo.usageLimit > 0 && (
              <Text style={styles.numericUnit}>utilisations</Text>
            )}
          </View>

          <Text style={styles.inputLabel}>Conditions supplémentaires</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conditions supplémentaires (optionnel)"
            value={newPromo.conditions}
            onChangeText={(text) =>
              setNewPromo({ ...newPromo, conditions: text })
            }
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Restrictions d'application</Text>

          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => {
              setSelectedProducts(newPromo.applicableProducts);
              setShowProductSelector(true);
            }}
          >
            <Text style={styles.selectorButtonText}>
              Sélectionner des produits
            </Text>
          </TouchableOpacity>

          <Text style={styles.selectionText}>
            Produits sélectionnés: {getSelectedProductsText()}
          </Text>

          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => {
              setSelectedCategories(newPromo.applicableCategories);
              setShowCategorySelector(true);
            }}
          >
            <Text style={styles.selectorButtonText}>
              Sélectionner des catégories
            </Text>
          </TouchableOpacity>

          <Text style={styles.selectionText}>
            Catégories sélectionnées: {getSelectedCategoriesText()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePromotion}
        >
          <Text style={styles.createButtonText}>Créer la promotion</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Liste des promotions existantes */}
      <View style={styles.promotionsList}>
        <Text style={styles.sectionTitle}>Promotions existantes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#D27D7D" />
        ) : (
          <FlatList
            data={promotions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.promoItem}>
                <View style={styles.promoDetails}>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoDate}>
                    {new Date(item.startDate).toLocaleDateString()} -{" "}
                    {new Date(item.endDate).toLocaleDateString()}
                  </Text>
                  {item.discountType && item.discountValue && (
                    <Text style={styles.promoDiscount}>
                      Remise:{" "}
                      {item.discountType === "percentage"
                        ? `${item.discountValue}%`
                        : `${item.discountValue} F CFA`}
                    </Text>
                  )}
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {item.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.active
                      ? styles.deactivateButton
                      : styles.activateButton,
                  ]}
                  onPress={() => togglePromotionActive(item)}
                >
                  <Text style={styles.actionButtonText}>
                    {item.active ? "Désactiver" : "Activer"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyText}>
                  Aucune promotion disponible
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modal pour la sélection des produits */}
      <Modal
        visible={showProductSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner des produits</Text>

            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectableItem,
                    selectedProducts.includes(item.id) && styles.selectedItem,
                  ]}
                  onPress={() => handleProductSelection(item.id)}
                >
                  <Text style={styles.selectableItemText}>{item.name}</Text>
                  {selectedProducts.includes(item.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowProductSelector(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmProductSelection}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour la sélection des catégories */}
      <Modal
        visible={showCategorySelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategorySelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner des catégories</Text>

            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectableItem,
                    selectedCategories.includes(item) && styles.selectedItem,
                  ]}
                  onPress={() => handleCategorySelection(item)}
                >
                  <Text style={styles.selectableItemText}>{item}</Text>
                  {selectedCategories.includes(item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCategorySelector(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCategorySelection}
              >
                <Text style={styles.modalButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4C6C6", // Rose pâle
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#D27D7D", // Rose poudré
    textAlign: "center",
    marginVertical: 15,
  },
  scrollContainer: {
    padding: 15,
    maxHeight: 400, // Limiter la hauteur pour voir la liste des promotions
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D27D7D",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFDDDD",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#FFF",
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  datePicker: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  pickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  picker: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#FFDDDD",
    borderRadius: 10,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 150,
  },
  valueInput: {
    borderWidth: 1,
    borderColor: "#FFDDDD",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF",
    flex: 1,
    fontSize: 16,
    minWidth: 80,
    textAlign: "center",
    color: "#333",
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFDDDD",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingRight: 10,
    flex: 1,
  },
  numericInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFDDDD",
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginBottom: 15,
    paddingRight: 10,
  },
  numericInput: {
    padding: 12,
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  numericUnit: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D27D7D",
    marginLeft: 5,
  },
  valueUnit: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#D27D7D",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  selectorButton: {
    backgroundColor: "#FFEDE1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  selectorButtonText: {
    color: "#D27D7D",
    fontWeight: "bold",
  },
  selectionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  createButton: {
    backgroundColor: "#D27D7D",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 20,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Styles pour la liste des promotions
  promotionsList: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
  promoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#FFEDE1",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  promoDetails: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  promoDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  promoDiscount: {
    fontSize: 14,
    color: "#D27D7D",
    fontWeight: "bold",
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#D27D7D",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  actionButton: {
    padding: 10,
    borderRadius: 20,
    width: 100,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  activateButton: {
    backgroundColor: "#4CAF50", // Vert
  },
  deactivateButton: {
    backgroundColor: "#F44336", // Rouge
  },
  emptyList: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    fontStyle: "italic",
  },

  // Styles pour les modales
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D27D7D",
    textAlign: "center",
    marginBottom: 15,
  },
  modalList: {
    maxHeight: 300,
  },
  selectableItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  selectedItem: {
    backgroundColor: "#FFEDE1",
  },
  selectableItemText: {
    fontSize: 16,
    color: "#333",
  },
  checkmark: {
    color: "#D27D7D",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#CCCCCC",
  },
  confirmButton: {
    backgroundColor: "#D27D7D",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default PromotionManagementScreen;
