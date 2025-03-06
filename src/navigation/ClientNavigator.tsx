import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Platform, Animated } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DeliveryTrackingScreen from "../screens/DeliveryTrackingScreen";
import CartScreen from "../screens/CartScreen";
import ChatScreen from "../screens/ChatScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import LanguageSelectorScreen from "../screens/LanguageSelectorScreen";

// Configuration des icônes
const ICON_CONFIG = {
  Accueil: { lib: Ionicons, name: Platform.select({ ios: "ios-home", android: "md-home" }) },
  Panier: { lib: MaterialIcons, name: "shopping-cart" as const },
  Commandes: { lib: Ionicons, name: "list" as const },
  "Suivi Livraison": { lib: MaterialIcons, name: "local-shipping" as const },
  Paramètres: { lib: Ionicons, name: "settings" as const },
  Chat: { lib: Ionicons, name: "chatbubble-ellipses" as const },
} as const;

// Typage pour les bibliothèques d'icônes
type IconLibrary = typeof Ionicons | typeof MaterialIcons;

// Composant pour afficher une icône avec accessibilité
const getIcon = (Lib: IconLibrary, name: string, color: string, size: number) => {
  const IconComponent = Lib;
  return IconComponent ? (
    <IconComponent name={name as keyof typeof IconComponent.glyphMap} size={size} color={color} accessibilityLabel={`Aller à ${name}`} />
  ) : null;
};

// Création des navigateurs
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour le panier
const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
  </Stack.Navigator>
);

// Stack pour les paramètres
const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="LanguageSelector" component={LanguageSelectorScreen} />
  </Stack.Navigator>
);

// Composant principal de navigation
const ClientNavigator = () => {
  const iconScale = React.useRef(new Animated.Value(1)).current;

  const handleIconPress = () => {
    Animated.sequence([
      Animated.spring(iconScale, { toValue: 1.2, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const { lib, name } = ICON_CONFIG[route.name as keyof typeof ICON_CONFIG];
          const iconSize = focused ? size * 1.2 : size;
          const iconColor = focused ? "#FF4952" : "gray";

          return (
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              {name && getIcon(lib, name, iconColor, iconSize)}
            </Animated.View>
          );
        },
        tabBarActiveTintColor: "#FF4952",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Panier" component={CartStack} />
      <Tab.Screen name="Commandes" component={OrderHistoryScreen} />
      <Tab.Screen name="Suivi Livraison" component={DeliveryTrackingScreen} />
      <Tab.Screen name="Paramètres" component={SettingsStack} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
};

export default ClientNavigator;