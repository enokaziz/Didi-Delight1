import React, { useState, useMemo, useCallback } from "react";
import { useCheckoutAnimations } from "../hooks/useCheckoutAnimations";
import { useOrderProcessing } from "../hooks/useOrderProcessing";
import { validateCheckoutForm } from "../utils/validation";
import AnimatedCartItem from "../components/checkout/AnimatedCartItem";
import CheckoutForm from "../components/checkout/CheckoutForm";
import LoadingOverlay from "../components/checkout/LoadingOverlay";
import styles from "../styles/checkoutStyles";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Product } from "../types/Product";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";

export type FormState = {
  address: string;
  paymentMethod: string;
  errors: string[];
};

const CheckoutScreen: React.FC = () => {
  const { cart, clearCart, removeFromCart } = useCart(); // Assurez-vous que removeFromCart existe dans CartContext
  const { user } = useAuth();
  const { loading, processOrder } = useOrderProcessing(clearCart);
  const { itemAnimations, overlayAnimations } = useCheckoutAnimations(
    cart.length
  );
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const buttonScale = new Animated.Value(1); // Pour l’effet au clic

  const [formState, setFormState] = useState<FormState>({
    address: "",
    paymentMethod: "",
    errors: [],
  });

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (sum: number, item: Product) => sum + item.price * (item.quantity ?? 1),
        0
      ),
    [cart]
  );

  const handleOrder = useCallback(async () => {
    if (!user) return Alert.alert("Erreur", "Authentification requise");

    const [isValid, errors] = validateCheckoutForm(
      formState.address,
      formState.paymentMethod
    );
    if (!isValid) return setFormState((prev) => ({ ...prev, errors }));

    Alert.alert(
      "Confirmer la commande",
      `Voulez-vous confirmer votre commande de ${totalPrice} FCFA ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            const success = await processOrder(
              user.uid,
              cart,
              totalPrice,
              formState.address,
              formState.paymentMethod
            );
            if (success) {
              Alert.alert("Succès", "Commande passée avec succès !", [
                { text: "OK", onPress: () => navigation.navigate("Commandes") },
              ]);
            } else {
              Alert.alert(
                "Erreur",
                "Échec du traitement de la commande. Veuillez réessayer."
              );
            }
          },
        },
      ]
    );
  }, [user, formState, cart, totalPrice, processOrder, navigation]);

  const handleRemoveItem = useCallback(
    (item: Product) => {
      Alert.alert(
        "Supprimer l’article",
        `Voulez-vous supprimer ${item.name} du panier ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            onPress: () => {
              removeFromCart(item.id, 1); // Supprime une unité à la fois
            },
          },
        ]
      );
    },
    [removeFromCart]
  );

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={localStyles.container}
      >
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={true}
          alwaysBounceVertical={true}
        >
          <Text style={localStyles.title}>Finaliser la commande</Text>

          {formState.errors.length > 0 && (
            <View style={localStyles.errorContainer}>
              {formState.errors.map((error, index) => (
                <Text key={index} style={localStyles.errorText}>
                  {error}
                </Text>
              ))}
            </View>
          )}

          <CheckoutForm
            formState={formState}
            onFormChange={(newState) =>
              setFormState((prev) => ({
                ...prev,
                ...newState,
                errors: newState.errors || prev.errors,
              }))
            }
          />

          <Text style={localStyles.sectionTitle}>Articles ({cart.length})</Text>
          {cart.map((item, index) =>
            itemAnimations[index] ? (
              <View key={item.id}>
                <AnimatedCartItem
                  item={item}
                  animation={itemAnimations[index]}
                />
                <TouchableOpacity
                  style={localStyles.removeButton}
                  onPress={() => handleRemoveItem(item)}
                >
                  <Text style={localStyles.removeButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            ) : null
          )}

          <View style={localStyles.summaryContainer}>
            <Text style={localStyles.summaryTitle}>Résumé</Text>
            <View style={localStyles.summaryRow}>
              <Text>Total</Text>
              <Text style={localStyles.totalPrice}>{totalPrice} FCFA</Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                localStyles.orderButton,
                loading && localStyles.orderButtonDisabled,
              ]}
              onPress={() => {
                animateButtonPress();
                handleOrder();
              }}
              disabled={loading || cart.length === 0}
              accessibilityLabel="Confirmer et passer la commande"
              accessibilityHint={`Finalise votre commande de ${totalPrice} FCFA avec les informations fournies`}
            >
              <Text style={localStyles.orderButtonText}>
                {loading ? "Traitement en cours..." : "Passer la commande"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} animations={overlayAnimations} />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 }, // Plus d’espace en bas
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#212529",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#343a40",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: { color: "#d32f2f", fontSize: 14 },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#343a40",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalPrice: { fontWeight: "bold", fontSize: 16, color: "#212529" },
  orderButton: {
    backgroundColor: "#FF4952",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 30,
  },
  orderButtonDisabled: { backgroundColor: "#adb5bd", opacity: 0.7 },
  orderButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  removeButton: {
    backgroundColor: "#d32f2f",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  removeButtonText: { color: "white", fontSize: 14 },
});

export default CheckoutScreen;
