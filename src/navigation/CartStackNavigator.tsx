import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { getTransitionOptions, nestedScreenOptions } from "./TransitionConfig";

const Stack = createStackNavigator();

export const CartStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerTintColor: "#4ECDC4", // Couleur du panier
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerLeft: ({ canGoBack }) => 
          canGoBack ? (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ) : null,
        // Appliquer les transitions personnalisées
        ...nestedScreenOptions,
      })}
    >
      <Stack.Screen 
        name="CartMain" 
        component={CartScreen} 
        options={{
          title: "Mon Panier",
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{
          title: "Finaliser la commande",
          // Utiliser une transition de type modal pour l'écran de paiement
          ...getTransitionOptions('modal'),
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});