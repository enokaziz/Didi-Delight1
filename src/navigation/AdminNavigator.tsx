// src/navigation/AdminNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AdminStackParamList } from "../navigation/types";
import AdminChatListScreen from "../screens/admin/AdminChatListScreen";
import AdminChatScreen from "../screens/admin/AdminChatScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen"; // Ajout du chemin complet
import ProductManagementScreen from "../screens/ProductManagementScreen";
import AddEditProductScreen from "../screens/AddEditProductScreen";
import EventManagementScreen from "../screens/admin/EventManagementScreen";
import PromotionManagementScreen from "../screens/admin/PromotionManagementScreen";
import InventoryManagementScreen from "../screens/admin/InventoryManagementScreen";
import LoyaltyPointsManagementScreen from "../screens/admin/LoyaltyPointsManagementScreen";
import OrderDetailsScreen from "../screens/admin/OrderDetailsScreen";

const Stack = createStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Retour",
        cardStyle: { backgroundColor: "#fff" },
      }}
      initialRouteName="AdminDashboard"
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: "Tableau de bord" }}
      />
      <Stack.Screen
        name="AdminChats"
        component={AdminChatListScreen}
        options={{ title: "Chats Clients" }}
      />
      <Stack.Screen
        name="AdminChat"
        component={AdminChatScreen}
        options={({ route }) => ({ title: `Client ${route.params.clientId}` })}
      />
      <Stack.Screen
        name="ProductManagement"
        component={ProductManagementScreen}
        options={{ title: "Gestion des Produits" }}
      />
      <Stack.Screen
        name="AddEditProduct"
        component={AddEditProductScreen}
        options={{ title: "Modifier Produit" }}
      />
      <Stack.Screen
        name="EventManagement"
        component={EventManagementScreen}
        options={{ title: "Gestion des Événements" }}
      />
      <Stack.Screen
        name="PromotionManagement"
        component={PromotionManagementScreen}
        options={{ title: "Gestion des Promotions" }}
      />
      <Stack.Screen
        name="InventoryManagement"
        component={InventoryManagementScreen}
        options={{ title: "Gestion de l'Inventaire" }}
      />
      <Stack.Screen
        name="LoyaltyPointsManagement"
        component={LoyaltyPointsManagementScreen}
        options={{ title: "Gestion des Points de Fidélité" }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: "Détails de la Commande" }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
