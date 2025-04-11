import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Product } from "../types/Product";
import {
  createProduct,
  updateProduct,
  uploadImage,
} from "../firebase/productService";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { FontAwesome5 } from "@expo/vector-icons";

const COLORS = {
  primary: "#F04E98",
  secondary: "#F7A4C5",
  background: "#FFF5F9",
  text: "#333",
  border: "#FFD6E8",
  error: "#FF6B6B",
  success: "#4ECDC4",
  dark: "#D6186B",
};

const CATEGORIES = ["Gâteaux", "Mets", "Mets traditionnels", "Jus", "Box"];

const AddEditProductScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "AddEditProduct">>();
  const route = useRoute<RouteProp<RootStackParamList, "AddEditProduct">>();
  const { product } = route.params || {};

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(
    product?.price ? String(product.price) : ""
  );
  const [category, setCategory] = useState(product?.category || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [description, setDescription] = useState(product?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    category?: string;
  }>({});

  // Fonction pour sélectionner une image
  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          Toast.show({
            type: "info",
            text1: "Annulé",
            text2: "Aucune image sélectionnée.",
          });
        } else if (response.errorMessage) {
          Toast.show({
            type: "error",
            text1: "Erreur",
            text2: response.errorMessage,
          });
        } else if (response.assets && response.assets.length > 0) {
          if (!response.assets[0].uri) {
            Toast.show({
              type: "error",
              text1: "Erreur",
              text2: "Échec du téléchargement de l'image.",
            });
            return;
          }
          setImageUrl(response.assets[0].uri || "");
        }
      }
    );
  };

  // Validation du prix
  const isValidPrice = (value: string) => {
    const parsed = parseFloat(value.replace(",", "."));
    return !isNaN(parsed) && parsed > 0;
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      price?: string;
      category?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Le nom du produit est requis";
    }

    if (!price.trim()) {
      newErrors.price = "Le prix est requis";
    } else if (!isValidPrice(price)) {
      newErrors.price = "Le prix doit être un nombre positif";
    }

    if (!category.trim()) {
      newErrors.category = "La catégorie est requise";
    } else if (!CATEGORIES.includes(category)) {
      newErrors.category = "Veuillez sélectionner une catégorie valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez corriger les erreurs dans le formulaire.",
      });
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;

      // Si une nouvelle image a été sélectionnée (URI local), l'uploader vers Firestore Storage
      if (imageUrl && imageUrl.startsWith("file://")) {
        finalImageUrl = await uploadImage(imageUrl);
      }

      const productData = {
        name,
        price: parseFloat(price.replace(",", ".")),
        category,
        imageUrl: finalImageUrl,
        description,
        stock: product?.stock || 0,
        rating: product?.rating || 0,
        reviews: product?.reviews || 0,
        isPromotional: product?.isPromotional || false,
        isPopular: product?.isPopular || false,
      };

      if (product) {
        await updateProduct({ ...product, ...productData });
        Toast.show({
          type: "success",
          text1: "Produit mis à jour !",
        });
      } else {
        await createProduct(productData);
        Toast.show({
          type: "success",
          text1: "Produit ajouté !",
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du produit :", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Une erreur s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome5
                name="arrow-left"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.title}>
              {product ? "Modifier le produit" : "Ajouter un produit"}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput
                placeholder="Ex: Gâteau au chocolat"
                value={name}
                onChangeText={setName}
                style={[styles.input, errors.name ? styles.inputError : null]}
                accessibilityLabel="Nom du produit"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Prix *</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  placeholder="Ex: 3000"
                  value={price}
                  onChangeText={setPrice}
                  style={[
                    styles.input,
                    styles.priceInput,
                    errors.price ? styles.inputError : null,
                  ]}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Prix du produit"
                />
                <Text style={styles.currency}>FCFA</Text>
              </View>
              {errors.price ? (
                <Text style={styles.errorText}>{errors.price}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Catégorie *</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category ? (
                <Text style={styles.errorText}>{errors.category}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholder="Description détaillée du produit"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Description du produit"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Image du produit</Text>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleSelectImage}
              >
                <FontAwesome5
                  name="camera"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.imageButtonText}>
                  {imageUrl ? "Changer l'image" : "Sélectionner une image"}
                </Text>
              </TouchableOpacity>
              {imageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.imagePreview}
                  />
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <FontAwesome5
                    name="birthday-cake"
                    size={40}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.noImageText}>
                    Aucune image sélectionnée
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name={product ? "save" : "plus-circle"}
                    size={18}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.saveButtonText}>
                    {product ? "Mettre à jour" : "Ajouter le produit"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: "#FFF0F0",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
  },
  currency: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  categoryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  imageButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  imageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  noImageContainer: {
    height: 150,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noImageText: {
    color: COLORS.text,
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddEditProductScreen;
