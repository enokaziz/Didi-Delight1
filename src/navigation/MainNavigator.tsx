// src/navigation/MainNavigator.tsx
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import AuthNavigator from "./AuthNavigator";
import ClientNavigator from "./ClientNavigator";
import AdminNavigator from "./AdminNavigator";
import { RootStackParamList } from "../navigation/types";

const Stack = createStackNavigator<RootStackParamList>();

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
    <NavigationContainer>
       <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} /> 


        ) : userRole === "admin" ? (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="ClientApp" component={ClientNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
