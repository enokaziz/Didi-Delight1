import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  SafeAreaView,
  TextInput,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { createOrder } from "../services/orderService"; // Import modifié
import { Product } from "../types/Product";
import * as Progress from "react-native-progress";
import Icon from "react-native-vector-icons/FontAwesome";

const CheckoutScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [buttonScale] = useState(new Animated.Value(1));
  const [shippingAddress, setShippingAddress] = useState<string>(""); // État pour l'adresse
  const [paymentMethod, setPaymentMethod] = useState<string>(""); // État pour la méthode de paiement

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const totalPrice = useMemo(
    () => cart.reduce((sum: number, item: Product) => sum + item.price, 0),
    [cart]
  );

  const handleOrder = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour passer une commande.");
      return;
    }

    if (!shippingAddress || !paymentMethod) {
      Alert.alert("Erreur", "Veuillez remplir l'adresse et la méthode de paiement.");
      return;
    }

    setLoading(true);
    try {
      await createOrder(
        user.uid,
        cart,
        totalPrice,
        shippingAddress,
        paymentMethod
      );

      Alert.alert(
        "Commande réussie !",
        "Votre commande est en cours de traitement. Vous recevrez une notification lorsque l'état de votre commande changera."
      );
      clearCart();
      navigation.navigate("Commandes");
    } catch (error) {
      console.error("Erreur lors de la commande :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la commande. Veuillez vérifier votre connexion internet et réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (loading) {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(animatedScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const itemAnimations = useRef(cart.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    itemAnimations.forEach((value, index) => {
      Animated.timing(value, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [cart]);

  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Récapitulatif de la commande</Text>
        <Text style={styles.customization}>Personnalisez votre commande :</Text>

        {/* Champs de saisie pour l'adresse et la méthode de paiement */}
        <TextInput
          placeholder="Adresse de livraison"
          value={shippingAddress}
          onChangeText={setShippingAddress}
          style={styles.input}
        />
        <TextInput
          placeholder="Méthode de paiement (ex: Carte, Espèces)"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          style={styles.input}
        />

        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={[
                styles.cartItem,
                {
                  opacity: itemAnimations[index],
                  transform: [
                    {
                      translateY: itemAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>Prix : {item.price} FCFA</Text>
            </Animated.View>
          )}
        />

        <Text style={styles.total}>Total : {totalPrice} FCFA</Text>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleOrder}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Icon name="shopping-cart" size={20} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Passer commande</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: animatedOpacity,
              transform: [{ scale: animatedScale }],
              pointerEvents: loading ? "none" : "auto",
            },
          ]}
        >
          {loading && (
            <View style={styles.loadingContent}>
              <Progress.CircleSnail color={["red", "green", "blue"]} size={80} />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f0f0" },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  customization: { fontSize: 18, marginBottom: 15, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  cartItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { fontSize: 14, color: "#777" },
  total: { fontSize: 20, fontWeight: "bold", marginTop: 20, color: "#333" },
  button: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: { marginTop: 10 },
});

export default CheckoutScreen;