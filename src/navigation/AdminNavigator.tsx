// src/navigation/AdminNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AdminStackParamList } from "../navigation/types";
import AdminChatListScreen from "../screens/admin/AdminChatListScreen";
import AdminChatScreen from "../screens/admin/AdminChatScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ProductManagementScreen from "../screens/ProductManagementScreen";
import AddEditProductScreen from "../screens/AddEditProductScreen";

const Stack = createStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: true,
        headerBackTitle: "Retour",
        cardStyle: { backgroundColor: "#fff" }
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
    </Stack.Navigator>
  );
};

export default AdminNavigator;