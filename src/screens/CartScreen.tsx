import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useCart } from "../contexts/CartContext";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { StackNavigationProp } from "@react-navigation/stack";

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;


const CartScreen: React.FC = () => {

  const { cart, removeFromCart, clearCart } = useCart();
  const navigation = useNavigation<CheckoutScreenNavigationProp>();

  const handleClearCart = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir vider le panier ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Vider", onPress: () => clearCart() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Votre Panier</Text>
      {cart.length === 0 ? (
        <Text>Le panier est vide</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item, index) => item.id + index}

            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text>{item.name} - {item.price} FCFA</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}
          />
            <TouchableOpacity onPress={() => navigation.navigate("Checkout")} style={styles.checkoutButton}>



            <Text style={styles.checkoutButtonText}>Commander</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Vider le panier</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1 },
  removeText: { color: "red" },
  checkoutButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, marginTop: 10, alignItems: "center" },
  checkoutButtonText: { color: "white", fontWeight: "bold" },
  clearButton: { backgroundColor: "red", padding: 10, borderRadius: 5, marginTop: 10, alignItems: "center" },
  clearButtonText: { color: "white", fontWeight: "bold" },
});

export default CartScreen;
