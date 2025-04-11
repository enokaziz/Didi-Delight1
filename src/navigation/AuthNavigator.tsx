import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../screens/AuthScreen";
import BiometricAuthScreen from "../screens/BiometricAuthScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthStackParamList } from "./types";

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Commenter ou désactiver la vérification biométrique
  /*
  useEffect(() => {
    const checkBiometricStatus = async () => {
      const biometricEnabled = await AsyncStorage.getItem("biometricEnabled");
      setIsBiometricEnabled(biometricEnabled === "true");
    };

    checkBiometricStatus();
  }, []);
  */

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isBiometricEnabled ? (
        <Stack.Screen name="BiometricAuth" component={BiometricAuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Login" component={AuthScreen} />
          <Stack.Screen name="ForgotPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
