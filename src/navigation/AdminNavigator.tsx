// src/navigation/AdminNavigator.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminChatListScreen from "../screens/admin/AdminChatListScreen";
import AdminChatScreen from "../screens/admin/AdminChatScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ProductManagementScreen from "../screens/ProductManagementScreen";

type AdminStackParamList = {
  AdminChats: undefined;
  AdminChat: { clientId: string };
  AdminDashboard: undefined;
  ProductManagement: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Tableau de bord" }} />
        <Stack.Screen name="ProductManagement" component={ProductManagementScreen} options={{ title: "Gestion des Produits" }} />
      <Stack.Screen name="AdminChats" component={AdminChatListScreen} options={{ title: "Chats Clients" }} />
      <Stack.Screen name="AdminChat" component={AdminChatScreen} options={{ title: "Chat Client" }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
