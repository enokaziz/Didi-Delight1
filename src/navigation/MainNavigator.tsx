// src/navigation/MainNavigator.tsx
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import AuthNavigator from "./AuthNavigator";
import ClientNavigator from "./ClientNavigator";
import AdminNavigator from "./AdminNavigator";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import MyAccountScreen from "../screens/MyAccountScreen";
import PromotionsScreen from "../screens/PromotionsScreen";
import InventoryScreen from "../screens/InventoryScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../navigation/types";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      ) : userRole === "admin" ? (
        <Stack.Screen name="AdminApp" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="ClientApp" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
};

const ClientTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Mon Compte" component={MyAccountScreen} />
      <Tab.Screen name="Promotions" component={PromotionsScreen} />
      <Tab.Screen name="Inventaire" component={InventoryScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
