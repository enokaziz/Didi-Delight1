import React, { useState, useMemo, useEffect } from "react";
import { useCheckoutAnimations } from "../hooks/useCheckoutAnimations";
import { useOrderProcessing } from "../hooks/useOrderProcessing";
import { validateCheckoutForm } from "../utils/validation";
import AnimatedCartItem from "../components/checkout/AnimatedCartItem";
import CheckoutForm from "../components/checkout/CheckoutForm";
import LoadingOverlay from "../components/checkout/LoadingOverlay";
import CheckoutModal from "../components/checkout/CheckoutModal";
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
  Platform,
  ScrollView,
  Modal,
} from "react-native";

export type FormState = {
  address: string;
  paymentMethod: string;
  errors: string[];
};

interface Props {
  visible: boolean;
  onClose?: () => void;
}

const CheckoutScreen: React.FC<Props> = ({ visible, onClose = () => {} }) => {
  // Hooks
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { loading, processOrder } = useOrderProcessing(clearCart);
  const { itemAnimations, overlayAnimations } = useCheckoutAnimations(
    cart.length
  );
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // État local
  const [formState, setFormState] = useState<FormState>({
    address: "",
    paymentMethod: "",
    errors: [],
  });

  const [showModal, setShowModal] = useState(false);

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (sum: number, item: Product) => sum + item.price * (item.quantity || 1),
        0
      ),
    [cart]
  );

  const handleOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Panier vide", "Votre panier est vide");
      return;
    }
    setShowModal(true);
  };

  useEffect(() => {
    // Réinitialiser l'affichage quand la modal se ferme
    if (!visible) {
      setShowModal(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={localStyles.scrollContent}>
          {/* Bouton pour ouvrir la modal de paiement */}
          <TouchableOpacity
            style={localStyles.checkoutButton}
            onPress={handleOrder}
          >
            <Text style={localStyles.checkoutButtonText}>
              Finaliser la commande
            </Text>
          </TouchableOpacity>

          <Text style={localStyles.title}>Votre Panier</Text>

          {/* Liste des articles */}
          {cart.map((item, index) => (
            <AnimatedCartItem
              key={item.id}
              item={item}
              animation={itemAnimations[index]}
            />
          ))}

          {/* Total */}
          <View style={localStyles.totalContainer}>
            <Text style={localStyles.totalText}>Total : {totalPrice} FCFA</Text>
          </View>
        </ScrollView>

        {/* Modal de checkout */}
        <CheckoutModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          formState={formState}
          onFormChange={(newState) =>
            setFormState((prev) => ({ ...prev, ...newState }))
          }
          totalPrice={totalPrice}
          cart={cart}
          onSubmit={async () => {
            if (!user) return;
            const success = await processOrder(
              user.uid,
              cart,
              totalPrice,
              formState.address,
              formState.paymentMethod
            );
            if (success) navigation.navigate("Commandes");
          }}
        />

        <LoadingOverlay visible={loading} animations={overlayAnimations} />

        <TouchableOpacity style={localStyles.closeButton} onPress={onClose}>
          <Text>Fermer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  totalContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  checkoutButton: {
    backgroundColor: "#2e8b57",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  checkoutButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 10,
    backgroundColor: "#FF4952",
    padding: 10,
    borderRadius: 50,
  },
});

export default CheckoutScreen;
